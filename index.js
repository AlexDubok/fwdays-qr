const video = document.createElement("video");
const canvasElement = document.getElementById('canvas');
const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');
const canvas = canvasElement.getContext('2d');
const linkContainer = document.querySelector('.link-container');
const constraints = {
    video: {
        facingMode: "environment",
    }
};

linkContainer.addEventListener('click', clearLinkContainer);
startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', handleStopClick);

TEXT_START = 'Start Camera';
TEXT_STOP = 'Stop Camera';

function handleStopClick(e) {
    clearLinkContainer();
    if (video.srcObject && video.srcObject.active) {
        return stopCamera();
    }
}

function stopCamera() {
    video.srcObject.getTracks().forEach(track => track.stop());
}

function startCamera(params) {
    clearLinkContainer();

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();
        requestAnimationFrame(tick);
    });
}

function clearLinkContainer() {
    linkContainer.innerHTML = '';
}

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.hidden = false;
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            linkContainer.hidden = false;
            linkContainer.innerText = code.data;
            
            const url = new URL(code.data, 'https://fwdays.com');
            if (url.href) {
                linkContainer.innerHTML = `<a href="${url.href}"target="_blank">${url.href}</a>`
            }
        }
    }
    requestAnimationFrame(tick);
}