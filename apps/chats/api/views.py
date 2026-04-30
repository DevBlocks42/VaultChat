from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import MessageCreateSerializer, MessageCipherRetrieveSerializer, ChatIdentitySerializer
from apps.chats.services import ChatService, MessageService
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
                    chat_identities = ChatService.get_allowed_identities(chat)
                    for cipher in ciphertexts:
                        if not cipher['identity'].id in chat_identities:
                            raise PermissionDenied("Forbidden")
                        message_cipher = ChatService.store_message_cipher(
                            message, 
                            cipher['ciphertext'], 
                            cipher['ephemeral_public_key'], 
                            cipher['nonce'],
                            cipher['identity']
                        )
            except Exception as e:
                print("ERROR:", e)
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

class ChatRetrieveMessagesAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        chat_id = request.query_params.get("chat_id")
        chat = ChatService.get_chat_by_id(chat_id)
        if chat is None:
            return Response({"detail": "Not Found"}, status=status.HTTP_404_NOT_FOUND)
        if not ChatService.allowed_to_participate(user, chat):
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )
        ciphertexts = MessageService.get_recipient_message_ciphertexts(chat, user.identity)
        if ciphertexts is None:
            return Response(
                {},
                status=204
            )
        serializer = MessageCipherRetrieveSerializer(ciphertexts, many=True)
        return Response({'ciphertexts': serializer.data, 'username': user.username}, status=status.HTTP_200_OK)
        


class ChatIdentityAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        chat_id = request.data.get("chat_id")
        chat = ChatService.get_chat_by_id(chat_id)
        if chat is None:
            return Response({"detail": "Not Found"}, status=status.HTTP_404_NOT_FOUND)
        if not ChatService.allowed_to_participate(user, chat):
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )
        chat_identities = ChatService.get_chat_identities(chat)
        serializer = ChatIdentitySerializer(chat_identities, many=True)
        return Response({'identities': serializer.data}, status=status.HTTP_200_OK)
