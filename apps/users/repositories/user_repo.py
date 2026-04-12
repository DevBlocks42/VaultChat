from apps.users.models import User


class UserRepository:
    
    @staticmethod
    def save_user(user : User):
        user.save()
        return user 

    @staticmethod 
    def create_user(username : str, email: str, password : str):
        user = User.objects.create_user(username=username, email=email, password=password)
        if user is not None:
            user.save()
            return user 
        return None