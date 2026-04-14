import base64
from django.core.exceptions import ValidationError
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

def validate_signing_public_key(value : str):
    try:
        key_bytes = base64.b64decode(value, validate=True)
    except Exception:
        raise ValidationError("Encodage de clé publique invalide (base64).")

    if len(key_bytes) != 32:
        raise ValidationError("Taille de clé publique de invalide.")

    try:
        Ed25519PublicKey.from_public_bytes(key_bytes)
    except Exception:
        raise ValidationError("Clé Ed25519 invalide (structure)")

    return value