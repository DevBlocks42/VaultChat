from rest_framework import serializers
from apps.users.models import Identity
from apps.chats.models import Message, MessageCipher, Chat
from apps.chats.services import ChatService

class MessageCipherSerializer(serializers.Serializer):
    ciphertext = serializers.CharField()
    ephemeral_public_key = serializers.CharField()
    nonce = serializers.CharField(max_length=settings.MESSAGE_NONCE_LENGTH, null=False, blank=False)
    identity = serializers.PrimaryKeyRelatedField(queryset=Identity.objects.all()) 

class MessageCreateSerializer(serializers.Serializer):
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())
    ciphertexts = MessageCipherSerializer(many=True)
    def validate(self, data):
        chat = data["chat"]
        allowed_identities = ChatService.get_allowed_identitied(chat)
        for c in data["ciphertexts"]:
            if c["identity"].id not in allowed_identities:
                raise serializers.ValidationError(
                    "Opération non permise"
                )
        return data
   