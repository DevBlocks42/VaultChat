from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import MessageCreateSerializer
from apps.chats.services import ChatService
from django.db import transaction
import time


class ChatMessageAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MessageCreateSerializer(data=request.data)
        user = request.user
        serializer.is_valid(raise_exception=True)
        chat = serializer.validated_data['chat']
        if ChatService.allowed_to_participate(user, chat):
            ciphertexts = serializer.validated_data['ciphertexts']
            try:
                with transaction.atomic():
                    message = ChatService.store_chat_message(chat, user)
                    if not message:
                        raise Exception("Ressource non créée")
                    for cipher in ciphertexts:
                        message_cipher = ChatService.store_message_cipher(
                            message, 
                            cipher['ciphertext'], 
                            cipher['ephemeral_public_key'], 
                            cipher['nonce'],
                            cipher['identity']
                        )
            except Exception:
                return Response(
                    {"detail": "Internal Server Error"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )            
        else:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(
            {
                "chat_id": chat.id,
                "ciphertexts_count": len(ciphertexts)
            },
            status=status.HTTP_201_CREATED
        )