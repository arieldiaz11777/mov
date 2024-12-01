const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');

async function setupCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
            throw new Error("No se encontraron cámaras conectadas.");
        }

        console.log("Cámaras detectadas:", videoDevices);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: videoDevices[0].deviceId },
            audio: false,
        });

        video.srcObject = stream;
        await new Promise((resolve) => (video.onloadedmetadata = resolve));
        video.play();

        await new Promise((resolve) => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                resolve();
            } else {
                video.onloadeddata = resolve;
            }
        });

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        statusText.innerText = "Cámara inicializada correctamente.";
        console.log("Cámara inicializada.");
    } catch (err) {
        console.error("Error al inicializar la cámara:", err);
        statusText.innerText = "Error: No se pudo acceder a la cámara.";
        alert("Asegúrate de que la cámara está conectada y los permisos están habilitados.");
    }
}

function detectMotion() {
    if (!video.videoWidth || !video.videoHeight) {
        console.warn("Dimensiones del video no disponibles. Reintentando en 500 ms...");
        setTimeout(detectMotion, 500);
        return;
    }

    bodyPix.load()
        .then(net => {
            statusText.innerText = "Modelo cargado. Detectando movimiento...";
            console.log("Modelo cargado correctamente.");

            function detect() {
                if (!video.videoWidth || !video.videoHeight) {
                    console.warn("Dimensiones del video no disponibles durante la detección.");
                    requestAnimationFrame(detect);
                    return;
                }

                net.segmentPerson(video, {
                    flipHorizontal: false,
                    internalResolution: "medium",
                    segmentationThreshold: 0.7,
                })
                    .then(segmentation => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const mask = bodyPix.toColoredPartMask(segmentation);
                        bodyPix.drawMask(canvas, video, mask, 0.7, 0, false);
                        requestAnimationFrame(detect);
                    })
                    .catch(err => {
                        console.error("Error durante la detección:", err);
                    });
            }

            detect();
        })
        .catch(err => {
            console.error("Error al cargar el modelo:", err);
            statusText.innerText = "Error: No se pudo cargar el modelo.";
        });
}

(async function main() {
    await setupCamera();
    detectMotion();
})();
