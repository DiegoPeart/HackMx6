from django.urls import path, re_path
from . import views, consumers

urlpatterns = [
    path("", views.index, name="index"),
]

websocket_urlpatterns = [
    path("transcribe", consumers.TranscriptConsumer.as_asgi()),
]
