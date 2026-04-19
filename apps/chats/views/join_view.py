from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import SuspiciousOperation
from ..services import ChatService

@login_required
def view(request):
    if request.method == "POST":
        chat_id = request.GET.get('id')
        chat = ChatService.get_chat_by_id(chat_id)
        user = request.user
        success = True
        if chat is None:
            messages.error(request, "La discussion requise n'a pas été trouvée.")
            success = False
        if not ChatService.allowed_to_participate(user, chat):
            success = False
            messages.error(request, "Vous n'avez pas la permission de rejoindre cette discussion.")
        if success:
            ChatService.participate_in_chat(user, chat)
            messages.success(request, "Vous avez rejoint une nouvelle discussion")
        return redirect("chats-index")
    else:
        raise SuspiciousOperation("Bad request")
        