from django.urls import path, re_path
from . import views, consumers

urlpatterns = [
    path("", views.index, name="index"),
    path("menu", views.menu, name="menu"),
    path("call-screen", views.callScreen, name="callScreen"),
]

websocket_urlpatterns = [
    path("transcribe", consumers.TranscriptConsumer.as_asgi()),
]
