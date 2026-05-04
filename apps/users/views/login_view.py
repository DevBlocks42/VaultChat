from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.conf import settings
from ..services import AuthService, UserService
from ..forms import LoginForm
import time

def view(request):
    form = LoginForm()
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            signature = form.cleaned_data["signature"]
            challenge = request.session.get("auth_challenge")
            issued_at = challenge.get('issued_at')
            nonce = challenge.get('nonce')
            auth_type = form.cleaned_data["auth_type"]
            print(auth_type)
            user = authenticate(request, username=username, password=password)
            if time.time() - issued_at > settings.CHALLENGE_TTL:
                messages.error(request, "Le challenge a expiré.")
                return redirect('users-login')
                del request.session["auth_challenge"]
            if user is None:
                messages.error(request, "Nom d'utilisateur, mot de passe ou signature incorrect.")
                return redirect('users-login')
            signing_public_key = user.identity.signing_public_key
            if AuthService.verify_challenge(nonce, signature, signing_public_key):
                login(request, user)
                del request.session["auth_challenge"]
                request.session["auth_type"] = auth_type 
                messages.success(request, "Authentification réussie.")
                return redirect('users-dashboard')
            else:
                messages.error(request, "Nom d'utilisateur, mot de passe ou signature incorrect.")
                return redirect('users-login')
    return render(request, "users/login.html", {
        'form': form
    })
