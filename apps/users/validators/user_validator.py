import base64
from django.core.exceptions import ValidationError
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec


def validate_signing_public_key(value: str):
    try:
        key_der = base64.b64decode(value, validate=True)
    except Exception:
        raise ValidationError("Encodage de clé publique invalide (base64).")
    try:
        public_key = serialization.load_der_public_key(key_der)
    except Exception:
        raise ValidationError("Clé publique invalide (format SPKI/DER).")
    if not isinstance(public_key, ec.EllipticCurvePublicKey):
        raise ValidationError("La clé n'est pas une clé ECDSA valide.")
    if not isinstance(public_key.curve, ec.SECP256R1):
        raise ValidationError("Courbe invalide : attendu SECP256R1 (P-256).")
    return value