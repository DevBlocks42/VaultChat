from django.urls import path
from .views.login_view import view as login_view
from .views.register_view import view as register_view

urlpatterns = [
    path('login', login_view , name='users-login'),
    path('register', register_view , name='users-register')
]
