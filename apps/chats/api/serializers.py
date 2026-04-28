from rest_framework import serializers
from apps.users.models import Identity
from apps.chats.models import Message, MessageCipher, Chat
from apps.chats.services import ChatService
from django.conf import settings

class MessageCipherSerializer(serializers.Serializer):
    ciphertext = serializers.CharField()
    ephemeral_public_key = serializers.CharField()
    nonce = serializers.CharField(max_length=settings.MESSAGE_NONCE_LENGTH)
    identity = serializers.PrimaryKeyRelatedField(queryset=Identity.objects.all())


class MessageCipherRetrieveSerializer(serializers.ModelSerializer):
    message_id = serializers.IntegerField(source="message.id")
    created_at = serializers.DateTimeField(source="message.created_at")
    sender_username = serializers.CharField(source="message.sender.username")
    class Meta:
        model = MessageCipher
        fields = [
            "message_id",
            "ciphertext",
            "ephemeral_public_key",
            "nonce",
            "created_at",
            "sender_username",
        ]   


class MessageCreateSerializer(serializers.Serializer):
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())
    ciphertexts = MessageCipherSerializer(many=True)
    def validate(self, data):
        chat = data["chat"]
        allowed_identities = ChatService.get_allowed_identities(chat)
        for c in data["ciphertexts"]:
            if c["identity"].id not in allowed_identities:
                raise serializers.ValidationError(
                    "Opération non permise"
                )
        return data

class ChatIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Identity
        fields = [
            "id",
            "signing_public_key",
            "key_agreement_public_key"
        ]
   