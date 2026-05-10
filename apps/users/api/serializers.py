from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.users.validators import validate_signing_public_key
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):

    signing_public_key = serializers.CharField(validators=[validate_signing_public_key])
    key_agreement_public_key = serializers.CharField()
    password2 = serializers.CharField()

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "signing_public_key", "key_agreement_public_key")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                "Les mots de passes ne correspondent pas."
            )
        validate_password(attrs["password"])
        validate_signing_public_key(attrs['signing_public_key'])
        return attrs