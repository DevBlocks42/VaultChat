from django.urls import path
from .views import index_view, create_view, join_view, chat_view

urlpatterns = [
    path('index', index_view.view , name='chats-index'),
    path('create', create_view.view, name='chats-create'),
    path('join', join_view.view, name='chats-join'),
    path('chat', chat_view.view, name='chats-chat')
]
