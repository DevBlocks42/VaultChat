from django.shortcuts import render, redirect
from apps.users.forms import SettingsForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.users.services import UserService
from django.contrib.auth import update_session_auth_hash

@login_required
def view(request):
    user = request.user
    old_username = user.username
    print(old_username)
    form = SettingsForm(instance=user)
    if request.method == "POST":
        form = SettingsForm(request.POST, instance=user)
        if form.is_valid():
            form_data = form.cleaned_data
            if not user.check_password(form_data.get('actual_password')):
                messages.error(request, "Le mot de passe est incorrect.")
                return redirect("users-settings")
            if form_data.get('password1') != form_data.get('password2'):
                messages.error(request, "Le nouveau mot de passe et sa confirmation sont différents.")
                return redirect("users-settings")
            if form_data.get('password1'):
                try:
                    validate_password(form_data.get('password1'), user=user)
                except ValidationError as e:
                    for error in e.messages:
                        messages.error(request, error)
                    return redirect("users-settings")
                newUser = UserService.update_user(user.id, form_data.get('username'), form_data.get('email'), form_data.get('password1'))
                update_session_auth_hash(request, user)
            else:
                newUser = UserService.update_user(user.id, form_data.get('username'), form_data.get('email'), None)
            if newUser is not None:
                new_username = ""
                if form_data.get('username') != old_username:
                    new_username = newUser.username
                messages.success(request, "Vos informations personnelles ont été mises à jour.")
                return render(request, "users/settings.html", {
                    'form': form,
                    'old_username': old_username,
                    'new_username': new_username
                })
                #return redirect("users-settings")
            

    return render(request, "users/settings.html", {
        'form': form
    })