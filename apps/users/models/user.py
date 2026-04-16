from django.db import models
from django.contrib.auth.models import AbstractBaseUser, UserManager

class User(AbstractBaseUser):
    email = models.EmailField(max_length=50, null=False, unique=True, verbose_name="adresse email")
    username = models.CharField(max_length=32, null=False, unique=True, verbose_name="nom d'utilisateur")
    USERNAME_FIELD = "username"
    objects = UserManager() 
    
    class Meta:
        db_table = "users"