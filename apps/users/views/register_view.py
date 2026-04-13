from django.shortcuts import render
from ..services import UserService

user_service = UserService()

def view(request):
    return render(request, "users/register.html")
