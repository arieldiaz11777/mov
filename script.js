// Esperamos a que el documento esté completamente cargado
window.onload = function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('output');
    const status = document.getElementById('status');
    
    // Configuración de la cámara
    async function setupCamera() {
        try {
            // Accedemos a la cámara del usuario
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            
            // Enlazamos el video con la cámara
            video.srcObject = stream;
            video.play();
            
            // Cuando el video esté cargado, configuramos el canvas
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                status.textContent = "Cámara lista. Detectando movimiento...";
                detectMovement();
            };
        } catch (err) {
            console.error("Error al acceder a la cámara", err);
            status.textContent = "No se pudo acceder a la cámara.";
        }
    }

    // Función para detectar movimiento
    async function detectMovement() {
        const net = await bodyPix.load();
        const segmentation = await net.segmentPerson(video);
        const context = canvas.getContext('2d');
        
        // Dibujamos en el canvas lo que vemos en el video
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Aquí puedes añadir lógica para detectar el movimiento
        // El modelo de BodyPix segmenta el cuerpo, pero puedes expandirlo según lo necesites
        
        // Este código solo dibuja el contorno de la persona detectada
        const mask = segmentation.personMask;
        context.putImageData(mask, 0, 0);
        
        // Volver a ejecutar la detección cada 100ms
        setTimeout(detectMovement, 100);
    }

    // Iniciamos la cámara
    setupCamera();
};
