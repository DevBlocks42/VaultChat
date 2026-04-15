import secrets
from . import IdentityService, UserService
from django.db import transaction
from django.conf import settings

class AuthService:

    @staticmethod
    @transaction.atomic
    def register_user(email : str, username : str, password : str, signing_public_key : str):
        """register_user enregistre un nouvel utilisateur

        Arguments:
            email -- adresse email
            username -- nom d'utilisateur
            password -- mot de passe
            signing_public_key -- clef publique de signature EDCSA

        Returns:
            l'objet User nouvellement créé
        """
        user = UserService.create_user(username=username, email=email, password=password)
        if user is not None:
            IdentityService.create_identity(user=user, signing_public_key=signing_public_key)
            return user
        return None

    @staticmethod 
    def generate_challenge():
        """generate_challenge génère un nonce cryptographique 

        Arguments:
            username -- nom de l'utilisateur pour qui on génère le nonce

        Returns:
            le nonce fraîchement généré
        """
        nonce = secrets.token_urlsafe(settings.CHALLENGE_NONCE_LENGTH)
        return nonce
