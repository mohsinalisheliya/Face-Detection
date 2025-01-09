const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const displaySize = { width: 640, height: 480 };

// Set up the canvas
canvas.width = displaySize.width;
canvas.height = displaySize.height;

// Flip the camera feed horizontally
video.style.transform = 'scaleX(-1)';  // Flip the video feed horizontally

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    console.log('Models loaded');
    startVideo();
}

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => {
            video.srcObject = stream;
        },
        err => {
            console.error('Error accessing webcam: ', err);
        }
    );
}

video.addEventListener('play', () => {
    const interval = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();
        canvas?.clear();
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Draw face detections and landmarks
        canvas?.drawDetections(resizedDetections);
        canvas?.drawFaceLandmarks(resizedDetections);

        // Draw a frame around the face (bounding box)
        resizedDetections.forEach(detection => {
            const { x, y, width, height } = detection.detection.box;
            const box = new faceapi.draw.DrawBox(
                new faceapi.Rect(x, y, width, height), 
                { label: 'Face' }
            );
            box.draw(canvas);
        });
    }, 100);
});

// Load models when the page is ready
loadModels();
