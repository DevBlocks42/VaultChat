from django.shortcuts import render, redirect
from ..services import AuthService
from ..forms import RegisterForm

def view(request):
    register_form = RegisterForm()
    if request.method == "POST":
        register_form = RegisterForm(request.POST)
        if register_form.is_valid():
            username = register_form.cleaned_data['username']
            email = register_form.cleaned_data['email']
            password = register_form.cleaned_data['password1']
            signing_public_key = register_form.cleaned_data['signing_public_key']
            key_agreement_public_key = register_form.cleaned_data['key_agreement_public_key']
            new_user = AuthService.register_user(email=email, username=username, password=password, signing_public_key=signing_public_key, key_agreement_public_key=key_agreement_public_key)
            if new_user is not None:
                return redirect("users-login")
    return render(request, "users/register.html", {
        'form': register_form
    })
