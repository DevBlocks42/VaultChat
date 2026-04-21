from django.db import models
from django.conf import settings
from django.utils import timezone

class Chat(models.Model):
    name = models.CharField(max_length=settings.MAX_CHAT_NAME_LENGTH, null=False, unique=True)
    public = models.BooleanField(default=False)
    created_at = models.DateTimeField(null=False, default=timezone.now)
    class Meta:
        db_table = "chats"