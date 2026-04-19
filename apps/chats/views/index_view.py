from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from ..services import ChatService

@login_required
def view(request):
    user = request.user
    if user is not None:
        public_chats = ChatService.get_available_public_chats(user=user)
        active_chats = ChatService.get_user_chats(user=user)
    return render(request, "chats/index.html", {
        'public_chats': public_chats,
        'active_chats': active_chats
    })