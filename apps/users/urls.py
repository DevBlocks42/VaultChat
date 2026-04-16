from django.urls import path
from .views.login_view import view as login_view
from .views.register_view import view as register_view
from .views.dashboard_view import view as dashboard_view

urlpatterns = [
    path('login', login_view , name='users-login'),
    path('register', register_view , name='users-register'),
    path('dashboard', dashboard_view , name='users-dashboard')
]
