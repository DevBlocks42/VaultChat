from ..models import *
from apps.users.models import User
from django.db import transaction
from django.db.models import Exists, OuterRef

class ChatService():

    @staticmethod
    def create_chat(owner : User, name : str, public : bool):
        """create_chat créer une nouvelle discussion

        Arguments:
            owner -- utilisateur propriétaire
            name -- nom de discussion
            public -- visibilité de la discussion

        Returns:
            l'objet Chat fraîchement créé
        """
        with transaction.atomic():
            chat = Chat.objects.create(name=name, public=public)
            chatParticipation = ChatParticipation.objects.create(chat=chat, user=owner, owns=True)
            return chat

    @staticmethod 
    def participate_in_chat(user : User, chat : Chat):
        """participate_in_chat définit la participation d'un utilisateur à un chat

        Arguments:
            user -- l'utilisateur souhaitant participer
            chat -- le chat ciblé

        Returns:
            l'objet ChatParticipation créé
        """
        chatParticipation = ChatParticipation.objects.create(user=user, chat=chat, owns=False)
        return chatParticipation

    @staticmethod
    def get_available_public_chats(user : User):
        """get_available_public_chats retourne une liste de chats publics dont l'utilisateur n'est pas un participant

        Arguments:
            user -- utilisateur

        Returns:
            Une liste d'objet Chat publics
        """
        chats = Chat.objects.filter(public=True).exclude(
            Exists(
                ChatParticipation.objects.filter(user=user, chat_id=OuterRef("pk"))
            )
        )
        return chats

    @staticmethod
    def get_chat_by_id(id : int):
        """get_chat_by_id retourne l'objet Chat via son id

        Arguments:
            id -- identifiant du Chat

        Returns:
            L'objet Chat demandé ou None
        """
        return Chat.objects.filter(id=id).first()

    @staticmethod
    def allowed_to_participate(user : User, chat : Chat):
        return (
            chat.public
            or ChatParticipation.objects.filter(
                user=user,
                chat=chat
            ).exists()
        )

    @staticmethod
    def get_user_chats(user : User):
        chats = Chat.objects.filter(chatparticipation__user=user)
        return chats

    @staticmethod
    def get_allowed_identities(chat : Chat):
        allowed_identities = set(
            chat.participants.values_list("identity_id", flat=True)
        )
        return allowed_identities

    def store_chat_message(chat : Chat, sender : User):
        message = Message.objects.create(sender=sender, chat=chat)
        return message

    def store_message_cipher(message : Message, ciphertext : str, ephemeral_public_key : str, nonce : str, identity : Identity):
        message_cipher = MessageCipher.objects.create(ciphertext=ciphertext, ephemeral_public_key=ephemeral_public_key, nonce=nonce, identity=identity, message=message)
        return message_cipher
