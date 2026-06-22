from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.register),
     path('protected-view/', views.protected_view),
]
