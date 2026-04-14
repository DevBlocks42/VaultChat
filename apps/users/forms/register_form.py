from django import forms
from django.contrib.auth.forms import UserCreationForm
from ..models import User

class RegisterForm(UserCreationForm):
    username = forms.CharField(
        label="Nom d'utilisateur ",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    email = forms.EmailField(
        required=True,
        label="Nom d'utilisateur ",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    password1 = forms.CharField(
        label="Mot de passe ",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    password2 = forms.CharField(
        label="Confirmation du Mot de passe ",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    signing_public_key = forms.CharField(
        widget=forms.HiddenInput
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")