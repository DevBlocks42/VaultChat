from django.db import models
from django.conf import settings
from apps.users.models import User
from .chat import Chat

class ChatParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_participations")
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    owns = models.BooleanField(default=False)
    class Meta:
        db_table = "chats_participation"