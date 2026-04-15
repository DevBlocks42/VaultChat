from django import forms

class LoginForm(forms.Form):
    username = forms.CharField(
        label="Nom d'utilisateur ",
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        error_messages={
            'required': "Le nom d'utilisateur est requis.",
        }
    )
    password1 = forms.CharField(
        label="Mot de passe ",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
    )
    