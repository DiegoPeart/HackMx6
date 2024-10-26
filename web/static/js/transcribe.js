const startButton = document.getElementById("startButton");
let mediaRecorder;
let isRecording = false;
let fin;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function startRecording() {
    var fullMessage = "";
    $("#transcript").text("");
    $("#summary").text("");

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!MediaRecorder.isTypeSupported("audio/webm")) {
            return alert("Browser not supported");
        }

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm",
        });
        var socket = new WebSocket("ws://localhost:8000/transcribe");
        socket.onopen = () => {
            document.querySelector("#status").textContent = "Monitoreando tus llamadas...";
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
                $.ajaxSetup({
                    headers: { "X-CSRFToken": getCookie("csrftoken") },
                });
                $.ajax({
                    url: "",
                    type: "POST",
                    data: { message: fullMessage },
                    dataType: "json",
                    success: function (data) {
                        $("#summary").text(data.response);
                        console.log(data);
                    },
                }).catch(function (error) {
                    console.log(error);
                });
            }
        };

        mediaRecorder.onstop = () => {
            socket.close();
            isRecording = false;
            startButton.textContent = "Iniciar";
            startButton.classList.add("btn-secondary");
            startButton.classList.remove("btn-danger");
            document.querySelector("#status").textContent = "";
        };

        mediaRecorder.onerror = (error) => {
            console.error("Error: ", error);
        };
        startButton.textContent = "Detener";
        startButton.classList.remove("btn-secondary");
        startButton.classList.add("btn-danger");
        isRecording = true;
    });
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
}

startButton.addEventListener("click", () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});
