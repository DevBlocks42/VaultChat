from django import forms
from apps.users.models import User

class SettingsForm(forms.ModelForm):
    username = forms.CharField(
        label="Nouveau pseudonyme",
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        required=False
    )
    email = forms.CharField(
        label="Nouvelle adresse email",
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        required=False
    )
    password1 = forms.CharField(
        label="Nouveau mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        required=False
    )
    password2 = forms.CharField(
        label="Confirmation du mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        required=False
    )
    actual_password = forms.CharField(
        label="Mot de passe actuel *",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        required=True
    )
    class Meta:
        model = User
        fields = ["username", "email"]
    