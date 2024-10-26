from channels.generic.websocket import AsyncWebsocketConsumer
from deepgram import Deepgram
from typing import Dict
from environs import Env

env = Env()
env.read_env()


class TranscriptConsumer(AsyncWebsocketConsumer):
    dg_client = Deepgram(env("DEEPGRAM_API_KEY"))

    async def receive(self, bytes_data):
        self.socket.send(bytes_data)

    async def get_transcript(self, data: Dict) -> None:
        if "channel" in data:
            transcript = data["channel"]["alternatives"][0]["transcript"]

            if transcript:
                await self.send(transcript)

    async def connect_to_deepgram(self):
        try:
            self.socket = await self.dg_client.transcription.live(
                {
                    "punctuate": True,
                    "interim_results": False,
                    "smart_format": True,
                    "language": "es",
                    "model": "nova",
                    "ssl": False,
                }
            )
            self.socket.registerHandler(
                self.socket.event.CLOSE,
                lambda c: print(f"Connection closed with code {c}."),
            )
            self.socket.registerHandler(
                self.socket.event.TRANSCRIPT_RECEIVED, self.get_transcript
            )

        except Exception as e:
            raise Exception(f"Could not open socket: {e}")

    async def connect(self):
        await self.connect_to_deepgram()
        await self.accept()
