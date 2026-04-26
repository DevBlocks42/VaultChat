from django.db import models
from django.conf import settings
from apps.users.models import Identity
from . import Message

class MessageCipher(models.Model):
    ciphertext = models.TextField(null=False, blank=False)
    ephemeral_public_key = models.TextField(blank=False, null=False)
    nonce = models.CharField(max_length=settings.MESSAGE_NONCE_LENGTH, null=False, blank=False)
    identity = models.ForeignKey(Identity, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    class Meta:
        db_table = "message_ciphers"
        unique_together = ("identity", "message")