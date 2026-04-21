import secrets
import base64
from . import IdentityService, UserService
from django.db import transaction
from django.conf import settings
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import InvalidSignature 
from apps.users import utils

class AuthService:

    @staticmethod
    @transaction.atomic
    def register_user(email : str, username : str, password : str, signing_public_key : str, key_agreement_public_key : str):
        """register_user enregistre un nouvel utilisateur

        Arguments:
            email -- adresse email
            username -- nom d'utilisateur
            password -- mot de passe
            signing_public_key -- clef publique de signature EDCSA
            key_agreement_public_key -- clef publique d'accord de clef ECDH

        Returns:
            l'objet User nouvellement créé
        """
        user = UserService.create_user(username=username, email=email, password=password)
        if user is not None:
            IdentityService.create_identity(user=user, signing_public_key=signing_public_key, key_agreement_public_key=key_agreement_public_key)
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

    @staticmethod
    def verify_challenge(nonce, signature, signing_public_key):
        signature_bytes = base64.b64decode(signature) # Bytes
        signature_bytes = utils.raw_to_der(signature_bytes)
        der_public_key = serialization.load_der_public_key(base64.b64decode(signing_public_key)) # clef der encodée
        try:
            der_public_key.verify(
                signature_bytes,
                nonce.encode('UTF-8'),
                ec.ECDSA(hashes.SHA256())
            )
            return True
        except (InvalidSignature):
            return False 
        return False

