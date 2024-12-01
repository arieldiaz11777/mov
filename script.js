window.onload = async function () {
    const video = document.getElementById('video');
    const canvas = document.getElementById('output');
    const status = document.getElementById('status');
    const context = canvas.getContext('2d');

    // Configuración de la cámara
    async function setupCamera() {
        try {
            // Acceder a la cámara del usuario
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            // Verificamos si obtuvimos el stream
            if (!stream) {
                throw new Error("No se pudo acceder al stream de la cámara.");
            }

            // Enlazamos el video con la cámara
            video.srcObject = stream;
            video.play();

            // Cuando el video esté listo, configuramos el canvas
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                status.textContent = "Cámara lista. Detectando movimiento...";
                detectMovement();
            };
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            if (err.name === "NotReadableError") {
                status.textContent = "La cámara no está disponible o está en uso por otro programa.";
            } else if (err.name === "NotAllowedError") {
                status.textContent = "Permiso denegado para acceder a la cámara.";
            } else {
                status.textContent = "Error al inicializar la cámara: " + err.message;
            }
        }
    }

    // Función para detectar movimiento
    async function detectMovement() {
        try {
            // Cargamos el modelo de BodyPix
            const net = await bodyPix.load();

            // Realizamos la segmentación del cuerpo en el video
            const segmentation = await net.segmentPerson(video);
            
            // Limpiamos el canvas y dibujamos el video
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Dibujar la máscara de la persona detectada
            const mask = segmentation.personMask;
            context.putImageData(mask, 0, 0);

            // Vuelve a detectar movimiento cada 100ms
            setTimeout(detectMovement, 100);

        } catch (err) {
            console.error("Error durante la detección:", err);
            status.textContent = "Error durante la detección: " + err.message;
        }
    }

    // Inicializar la cámara
    setupCamera();
};
