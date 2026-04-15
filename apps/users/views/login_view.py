from django.shortcuts import render
from ..services import AuthService
from ..forms import LoginForm

def view(request):
    form = LoginForm()
    return render(request, "users/login.html", {
        'form': form
    })
