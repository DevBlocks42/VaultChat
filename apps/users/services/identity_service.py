from ..models import Identity, User

class IdentityService():

    @staticmethod
    def create_identity(user : User, signing_public_key : str):
        """create_identity créer une nouvelle identité

        Arguments:
            user -- utilisateur associé
            signing_public_key -- clef de signature Ed25519

        Returns:
            l'objet Identity fraîchement créé
        """
        identity = Identity(user=user, signing_public_key=signing_public_key)
        identity.save()
        return identity

    def read_identity(id : int):
        """read_identity récupère une identité

        Arguments:
            id -- id d'identité

        Returns:
            l'objet Identity spécifié
        """
        identity = Identity.objects.filter(id=id).first()
        return identity
