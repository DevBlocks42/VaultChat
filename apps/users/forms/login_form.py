from django import forms

class LoginForm(forms.Form):
    username = forms.CharField(
        label="Nom d'utilisateur ",
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        error_messages={
            'required': "Le nom d'utilisateur est requis.",
        }
    )
    password = forms.CharField(
        label="Mot de passe ",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        error_messages={
            'required': "Le mot de passe est requis.",
        }
    )
    signature = forms.CharField(widget=forms.HiddenInput(), error_messages={'required': "La signature du nonce est requise."})
    