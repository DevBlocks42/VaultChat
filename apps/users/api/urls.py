from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)
from .views import UserRegisterAPI, UserChallengeAPI

urlpatterns = [
    path('register', UserRegisterAPI.as_view()),
    path('challenge', UserChallengeAPI.as_view())
]