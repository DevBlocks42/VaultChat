from django import forms
from django.conf import settings
from ..models import Chat

class CreateChatForm(forms.ModelForm):
    name = forms.CharField(
        label="Titre de la discussion",
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        error_messages={
            'unique': "Le nom de la dicussion est déjà utilisé, veuillez en choisir un autre.",
            'required': "Vous devez obligatoirement saisir un nom pour créer la nouvelle disucssion.",
            'max_length': "La taille du nom de la discussion ne doit pas dépasser " + str(settings.MAX_CHAT_NAME_LENGTH) + " caractères."
        }
    )
    public = forms.BooleanField(
        required=False,
        label="Publique (oui, non)",
        widget=forms.CheckboxInput(attrs={'class': 'form-check'})
    )

    class Meta:
        model = Chat 
        fields = ["name"]