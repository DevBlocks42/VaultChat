from django import forms
from django.conf import settings
from django.contrib.auth.forms import UserCreationForm
from ..models import User
from ..validators import validate_signing_public_key


class RegisterForm(UserCreationForm):
    username = forms.CharField(
        label="Nom d'utilisateur ",
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        error_messages={
            'max_length': f"Le nom d'utilisateur ne peut pas dépasser {settings.MAX_USERNAME_LENGTH} caractères",
            'unique': "Ce nom d'utilisateur est déjà utilisé." 
        }
    )
    email = forms.EmailField(
        required=True,
        label="Adresse email ",
        widget=forms.EmailInput(attrs={'class': 'form-control'}),
        error_messages={
            'max_length': f"L'adresse email ne peut pas dépasser {settings.MAX_EMAIL_LENGTH} caractères",
            'unique': "Ce nom d'utilisateur est déjà utilisé." 
        }
    )
    password1 = forms.CharField(
        label="Mot de passe ",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
    )
    password2 = forms.CharField(
        label="Confirmation du Mot de passe ",
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    signing_public_key = forms.CharField(
        label="Clef publique de signature",
        widget=forms.HiddenInput,
        error_messages={
            'required': "La clef publique est requise."
        },
        validators=[validate_signing_public_key]
    )
    key_agreement_public_key = forms.CharField(
        widget=forms.HiddenInput,
        error_messages={
            'required': "La clef publique est requise."
        }
        #TODO validators
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")