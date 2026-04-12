from django.urls import path
from .views.login_view import view as login_view

urlpatterns = [
    path('login', login_view , name='users-login'),
]
