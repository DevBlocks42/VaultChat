from django.urls import path
from .views.login_view import view as login_view
from .views.settings_view import view as settings_view
from .views.register_view import view as register_view
from .views.dashboard_view import view as dashboard_view
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('login', login_view , name='users-login'),
    path('logout', auth_views.LogoutView.as_view() , name='users-logout'),
    path('register', register_view , name='users-register'),
    path('dashboard', dashboard_view , name='users-dashboard'),
    path('settings', settings_view, name='users-settings')
]
