from ..models import Identity, User

class IdentityService():

    @staticmethod
    def create_identity(user : User, signing_public_key : str):
        identity = Identity(user=user, signing_public_key=signing_public_key)
        return identity

    def get_identity(id : int):
        identity = Identity.objects.filter(id=id).first()
        return identity
