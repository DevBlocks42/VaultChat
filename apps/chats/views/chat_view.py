from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from ..services import ChatService

@login_required
def view(request):
    user = request.user
    chat_id = request.GET.get('id')
    chat = ChatService.get_chat_by_id(chat_id)
    if chat is not None:
        if not ChatService.allowed_to_participate(user, chat):
            messages.error(request, "Erreur, vous n'avez pas la permission de participer à cette discussion.")
            return redirect("chats-index")
        else:
            return render(request, "chats/chat.html", {
                'chat': chat
            })
    else: 
        messages.error(request, "La discussion requise n'a pas été trouvée.")
        return redirect("chats-index")

    