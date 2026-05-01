from apps.chats.models import Message, MessageCipher, Chat
from apps.users.models import User, Identity


class MessageService():

    @staticmethod
    def get_chat_messages(chat : Chat):
        messages = Message.objects.filter(chat=chat)
        return messages

    @staticmethod
    def get_recipient_message_ciphertexts(chat : Chat, identity : Identity, after_id: int):
        """get_recipient_message_ciphertexts Récupère tous les MessageCipher associés à un Chat pour une Identity donnée

        Arguments:
            chat -- Discussion active
            identity -- identité destinataire du message

        Returns:
            Un tableau d'objet MessageCipher
        """
        ciphertexts = MessageCipher.objects.select_related("message").filter(
            identity=identity,
            message__chat=chat,
            message__id__gt=after_id
        ).order_by("message__created_at")
        return ciphertexts
