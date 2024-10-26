from django.urls import path, re_path
from . import views, consumers

urlpatterns = [
    path("call-screen", views.callScreen, name="callScreen"),
]

websocket_urlpatterns = [
    path("transcribe", consumers.TranscriptConsumer.as_asgi()),
]
