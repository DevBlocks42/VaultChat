from django.db import models
from django.utils import timezone
from . import Chat
from apps.users.models import User

class Message(models.Model):
    created_at = models.DateTimeField(null=False, default=timezone.now)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, null=False, related_name="messages")
    class Meta:
        db_table = "messages"
