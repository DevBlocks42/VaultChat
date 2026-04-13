from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.users.services import UserService
from apps.users.api.serializers import UserSerializer


class UserAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id : int):
        """get récupère un utilisateur

        Arguments:
            request -- corps de requête HTTP
            user_id -- id de l'utilisateur

        Returns:
            l'objet User serializé
        """
        user = UserService.read_user(user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, user_id : int):
        """put met à jour un utilisateur

        Arguments:
            request -- corps de requête HTTP
            user_id -- id de l'utilisateur

        Returns:
            l'objet User serializé
        """
        username = request.data["username"]
        email = request.data["email"]
        password = request.data["password"]
        user = UserService.update_user(user_id=user_id, username=username, email=email, password=password)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """patch créer un utilisateur

        Arguments:
            request -- corps de requête HTTP

        Returns:
            l'objet User serializé
        """
        username = request.data["username"]
        email = request.data["email"]
        password = request.data["password"]
        password_confirm = request.data["password_confirm"]
        if password != password_confirm:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user = UserService.create_user(user_id=user_id, username=username, email=email, password=password)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        """delete supprime un utilisateur

        Arguments:
            request -- corps de requête HTTP
            user_id -- id de l'utilisateur

        Returns:
            une réponse HTTP 204 (NO CONTENT)
        """
        UserService.delete_user(user_id)
        return Response(status=status.HTTP_204_NO_CONTENT)