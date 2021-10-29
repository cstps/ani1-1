
from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index ), 
    path('title/', views.title, name ='title' ), 
    path('code/', views.code, name ='code' ), 
    path('canvas/', views.canvas, name ='canvas' ), 
]