from django.db import models
from . import User

class Identity(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column="user_id", related_name="identity",)
    signing_public_key = models.CharField(max_length=255)

    class Meta:
        db_table = "identities"