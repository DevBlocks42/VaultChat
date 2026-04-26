from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)
from .views import ChatMessageAPI, ChatIdentityAPI

urlpatterns = [
    path('send', ChatMessageAPI.as_view()),
    path('identities', ChatIdentityAPI.as_view())
]