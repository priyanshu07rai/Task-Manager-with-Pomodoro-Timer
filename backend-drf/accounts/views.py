from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import RegisterSerializer

from django.contrib.auth import authenticate

# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "User Created"},
                status = status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status = status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):
    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(
            username = username,
            password= password
        )

        if user:
            return Response(
                {"message": "Login Successful"},
                status = status.HTTP_302_FOUND
            )

        return Response(
            {"error": "Invalid Credentials"},
            status = status.HTTP_400_BAD_REQUEST
        )