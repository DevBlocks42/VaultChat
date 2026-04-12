from ..models import User
from ..repositories import UserRepository

class UserService:

    def __init__(self):
        self.repo = UserRepository() 

    def save_user(self, user : User):
        return self.repo.save_user(user) 

    def create_user(self, username : str, email: str, password : str):
        return self.repo.create_user(username, email, password)