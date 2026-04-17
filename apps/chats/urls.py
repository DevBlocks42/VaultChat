from django.urls import path
from .views import index_view, create_view

urlpatterns = [
    path('index', index_view.view , name='chats-index'),
    path('create', create_view.view, name='chats-create')
]
