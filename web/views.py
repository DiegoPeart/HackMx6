import boto3
import time

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from environs import Env
from botocore.config import Config

config = Config(retries=dict(max_attempts=10))
env = Env()
env.read_env()

brt = boto3.client("bedrock-runtime")

oldtime = 0


def index(request):
    return render(request, "index.html")


def menu(request):
    return render(request, "menu.html")


def callScreen(request):
    if request.method == "GET":
        return render(request, "call-screen.html")
    elif request.method == "POST":
        return JsonResponse({"response": callAnalysis(request.POST.get("message"))})


def callAnalysis(message):
    global oldtime
    if not oldtime:
        oldtime = time.time()
        print("First message")
    elif time.time() - oldtime > 10:
        try:
            response = brt.converse(
                modelId=env("MODEL_ID"),
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": "El siguiente mensaje será la transcripción de una llamada efectuándose en tiempo real. Necesito que analices su contenido, y si determinas que esta podría ser una estafa o fraude, indícalo con una breve alerta. Si no puedes determinarlo, indica que no lo es. Recuerda ser lo más breve y conciso posible.",
                            },
                            {"text": message},
                        ],
                    }
                ],
            )
            print(message)
            print(response["output"]["message"]["content"][0]["text"])
            return response["output"]["message"]["content"][0]["text"]
        except Exception as e:
            print(f"ERROR: Can't invoke model. Reason: {e}")
    else:
        print("waiting...")
