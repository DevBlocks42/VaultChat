from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature

def raw_to_der(signature_raw: bytes):
    half = len(signature_raw) // 2
    r = int.from_bytes(signature_raw[:half], "big")
    s = int.from_bytes(signature_raw[half:], "big")
    return encode_dss_signature(r, s)