from ..models import *
from django.db import transaction

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
        chatParticipation = chatParticipation.objects.create(user=user, chat=chat, owns=False)
        return chatParticipation