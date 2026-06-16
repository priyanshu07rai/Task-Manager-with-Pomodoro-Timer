from dataclasses import fields

from django.contrib.auth.models import User
from django.db.models.fields.files import FieldFile

from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def NewAcc(self, validate_data):
        user = User.objects.create_user(
            username = validate_data['username'],
            email = validate_data['email'],
            password = validate_data['password'],
        )
    
        return user
