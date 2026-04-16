from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from ..services import AuthService, UserService
from ..forms import LoginForm

def view(request):
    form = LoginForm()
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            signature = form.cleaned_data["signature"]
            challenge = request.session.get("auth_challenge")
            nonce = challenge.get('nonce')
            user = authenticate(request, username=username, password=password)
            if user is None:
                messages.warning(request, "Nom d'utilisateur, mot de passe ou signature incorrect.")
                return redirect('users-login')
            #UserService.read_user(username)
            signing_public_key = user.identity.signing_public_key
            if AuthService.verify_challenge(nonce, signature, signing_public_key):
                login(request, user)
                del request.session["auth_challenge"]
                messages.success(request, "Authentification réussie.")
                return redirect('users-dashboard')
            else:
                messages.warning(request, "Nom d'utilisateur, mot de passe ou signature incorrect.")
                return redirect('users-login')
    return render(request, "users/login.html", {
        'form': form
    })
