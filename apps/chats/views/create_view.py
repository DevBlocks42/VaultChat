from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from ..forms import *
from ..services import *

@login_required
def view(request):
    form = CreateChatForm()
    if request.method == 'POST':
        form = CreateChatForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            public = form.cleaned_data['public']
            chat = ChatService.create_chat(owner=request.user, name=name, public=public)
            if chat is not None:
                messages.success(request, "Nouvelle discussion créée avec succès.")
            else:
                messages.error(request, "Une erreur inattendue s'est produite lors de la création de la discussion.")
            return redirect("users-dashboard")
    return render(request, "chats/create-chat.html", {
        'form': form
    })