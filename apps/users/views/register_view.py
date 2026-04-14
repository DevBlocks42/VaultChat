from django.shortcuts import render
from ..services import UserService
from ..forms import RegisterForm

user_service = UserService()

def view(request):
    register_form = RegisterForm()
    return render(request, "users/register.html", {
        'form': register_form
    })
