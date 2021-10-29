from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

def index(request):
  return render(request, 'ani/index.html')

def title(request):
  return render(request, 'ani/title.html')

def code(request):
  return render(request, 'ani/code.html')

def canvas(request):
  return render(request, 'ani/canvas.html')
