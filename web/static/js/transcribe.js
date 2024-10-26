const startButton = document.getElementById("startButton");
let mediaRecorder;
let isRecording = false;
let dataJson = {};
let inicio;
let fin;

function startRecording() {
    var fullMessage = "";

    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            if (!MediaRecorder.isTypeSupported("audio/webm")) {
                return alert("Browser not supported");
            }

            mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });
            var socket = new WebSocket("ws://localhost:8000/transcribe");
            socket.onopen = () => {
                inicio = Date.now();
                document.querySelector("#status").textContent = "Grabando...";
                console.log({ event: "onopen" });
                mediaRecorder.addEventListener("dataavailable", async (event) => {
                    if (event.data.size > 0 && socket.readyState == 1) {
                        socket.send(event.data);
                    }
                });
                mediaRecorder.start(250);
            };

            socket.onmessage = (message) => {
                const received = message.data;
                if (received) {
                    document.querySelector("#transcript").textContent += " " + received;
                    fullMessage += received;
                    if (Math.floor(inicio / 1000) + 5 < Math.floor(Date.now() / 1000)) {
                        inicio = Date.now();

                        var csrf_token = Cookies.get("csrftoken");
                        $.ajaxSetup({
                            headers: { "X-CSRFToken": csrf_token },
                        });
                        $.ajax({
                            url: "",
                            type: "POST",
                            data: { fullMessage: fullMessage },
                            dataType: "json",
                            success: function (data) {
                                var dataJson = JSON.parse(data.response);
                                $("#servicios").text(dataJson["servicios_a_enviar"]);
                                $("#nombre").text(dataJson["nombre"]);
                                $("#telefono").text(dataJson["telefono"]);
                                $("#ubicacion").text(dataJson["ubicacion"]);
                                $("#razones").text(dataJson["razones_de_emergencia"]);
                                // $('#servicios').text(time <i class="bi bi-robot"></i>: ' + data.response["servicios_a_enviar"]);
                            },
                        });
                    }
                }
            };

            mediaRecorder.onstop = () => {
                socket.close();
            };

            mediaRecorder.onerror = (error) => {
                console.error("Error: ", error);
            };
            isRecording = true;
        })
        .catch((error) => {
            console.error("Error accessing microphone: ", error);
        });
}
