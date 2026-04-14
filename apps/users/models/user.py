from django.db import models
from django.contrib.auth.models import AbstractBaseUser

class User(AbstractBaseUser):
    email = models.EmailField(max_length=50, null=False, unique=True)
    username = models.CharField(max_length=32, null=False, unique=True)
    USERNAME_FIELD = "username"

    class Meta:
        db_table = "users"