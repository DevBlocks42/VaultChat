from . import IdentityService, UserService
from django.db import transaction

class AuthService:

    @staticmethod
    @transaction.atomic
    def register_user(email : str, username : str, password : str, signing_public_key : str):
        """register_user enregistre un nouvel utilisateur

        Arguments:
            email -- adresse email
            username -- nom d'utilisateur
            password -- mot de passe
            signing_public_key -- clef publique de signature ed25519

        Returns:
            l'objet User nouvellement créé
        """
        user = UserService.create_user(username=username, email=email, password=password)
        if user is not None:
            IdentityService.create_identity(user=user, signing_public_key=signing_public_key)
            return user
        return None