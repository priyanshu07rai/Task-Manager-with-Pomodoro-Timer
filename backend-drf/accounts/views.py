from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework import status

@api_view(['POST'])
def register(request):

    username = request.data['username']
    email = request.data['email']
    password = request.data['password']

    if User.objects.filter(username=username).exists():
        return Response(
            {
                'error': 'Username already exists'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({
        'message':'User created'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):

    return Response({
        'message':'Success'
    })