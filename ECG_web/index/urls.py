from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('preview/', views.PreViewImage),
    path('pdfUpload/', views.PDFfileLoad),
    path('newUpload/', views.newDataUpload)
]
