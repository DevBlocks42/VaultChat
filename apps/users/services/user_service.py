from django.contrib.auth import get_user_model

User = get_user_model()

class UserService:

    @staticmethod
    def save_user(user : User):
        """save_user sauvegarde un utilisateur

        Arguments:
            user -- utilisateur

        Returns:
            l'objet User fraîchement sauvegardé ou None
        """
        if user is not None:
            user.save()
        return user 

    @staticmethod
    def create_user(username : str, email : str, password : str):
        """create_user créer un nouvel utilisateur

        Arguments:
            username -- nom d'utilisateur
            email -- adresse email
            password -- mot de passe en clair

        Returns:
            l'objet User fraîchement créé ou None
        """
        user = User(username=username, email=email)
        user.set_password(password)
        if user is not None:
            user.save()
            return user 
        return None

    @staticmethod
    def read_user(user_id : int):
        """read_user récupère un utilisateur

        Arguments:
            user_id -- id de l'utilisateur

        Returns:
            l'objet User demandé ou None
        """
        return User.objects.filter(id=user_id).first()

    @staticmethod
    def update_user(user_id : int, username : str, email : str, password : str):
        """update_user met à jour un utilisateur

        Arguments:
            user_id -- id de l'utilisateur
            username -- nouveau nom d'utilisateur
            email -- nouvelle adresse email
            password -- nouveau mot de passe en clair

        Returns:
            l'utilisateur fraîchement mis à jour
        """
        user = User.objects.filter(id=user_id).first()
        if user is not None and user:
            user.username = username
            user.email = email 
            user.set_password(password)
            user.save()
            return user
        return None

    @staticmethod
    def delete_user(user_id : int):
        """delete_user supprime un utilisateur

        Arguments:
            user_id -- id de l'utilisateur

        Returns:
            True ou None
        """
        user = User.objects.filter(id=user_id).first()
        if user is not None and user: 
            user.delete()
        return None