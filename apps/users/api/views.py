from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.users.services import AuthService, UserService
from apps.users.api.serializers import UserRegisterSerializer
import time


class UserRegisterAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            password2 = serializer.validated_data['password2']
            signing_public_key = serializer.validated_data['signing_public_key']
            key_agreement_public_key = serializer.validated_data['key_agreement_public_key']
            user = AuthService.register_user(email, username, password, signing_public_key, key_agreement_public_key)
            if user is not None:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserChallengeAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        user = UserService.read_user(username)
        nonce = AuthService.generate_challenge()
        request.session["auth_challenge"] = {
            "username": user.username if user is not None else None,
            "nonce": nonce,
            "issued_at": time.time()
        }
        return Response({'nonce': nonce}, status=status.HTTP_200_OK)
        

        