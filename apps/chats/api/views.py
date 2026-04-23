from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.users.services import AuthService, UserService
from apps.users.api.serializers import UserRegisterSerializer
import time


class ChatMessageAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # serializer 
            # response
        return Response()


        

        