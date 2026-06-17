from django.urls import path

from .views import *

urlpatterns = [
    path("register/", RegisterView.as_view(), name = 'Register_Page'),
    path("login/", LoginView.as_view(), name='Login_Page'),
]
