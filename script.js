document.getElementById('videoUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const videoPlayer = document.getElementById('videoPlayer');
    
    videoPlayer.src = URL.createObjectURL(file);
    videoPlayer.load();
    
    videoPlayer.onloadedmetadata = function() {
        document.getElementById('endTime').value = formatTime(videoPlayer.duration);
    };
});

document.getElementById('cutButton').addEventListener('click', function() {
    const videoPlayer = document.getElementById('videoPlayer');
    const startTime = parseTime(document.getElementById('startTime').value);
    const endTime = parseTime(document.getElementById('endTime').value);
    const duration = endTime - startTime;

    if (duration > 0 && startTime >= 0 && endTime <= videoPlayer.duration) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoPlayer.videoWidth;
        canvas.height = videoPlayer.videoHeight;

        const outputVideo = document.getElementById('outputVideo');
        const outputStream = canvas.captureStream();
        const mediaRecorder = new MediaRecorder(outputStream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            outputVideo.src = URL.createObjectURL(blob);
            outputVideo.load();
            document.getElementById('downloadButton').href = outputVideo.src;
        };

        videoPlayer.currentTime = startTime;
        videoPlayer.play();

        mediaRecorder.start();

        videoPlayer.ontimeupdate = function() {
            if (videoPlayer.currentTime >= endTime) {
                videoPlayer.pause();
                mediaRecorder.stop();
            }
            ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
        };
    } else {
        alert('Tempo de início ou fim inválido.');
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function parseTime(timeStr) {
    const [minutesStr, secondsStr] = timeStr.split(':').map(Number);
    const minutes = isNaN(minutesStr) ? 0 : minutesStr;
    const seconds = isNaN(secondsStr) ? 0 : secondsStr;
    return (minutes * 60) + seconds;
}

function applyTimeMask(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito

    if (value.length <= 2) {
        // Caso tenha apenas dois dígitos ou menos
        value = value.padStart(2, '0');
        input.value = `00:${value}`;
    } else if (value.length <= 4) {
        // Caso tenha até quatro dígitos
        value = value.padStart(4, '0');
        input.value = `${value.slice(0, 2)}:${value.slice(2)}`;
    } else {
        // Caso tenha mais de quatro dígitos
        value = value.slice(0, 4);
        input.value = `${value.slice(0, 2)}:${value.slice(2)}`;
    }
}

document.getElementById('startTime').addEventListener('input', function(event) {
    applyTimeMask(event);
    // Atualizar valor para o formato `mm:ss`
    if (event.target.value.length > 0) {
        event.target.value = event.target.value.replace(/^0+/, '');
    }
});
document.getElementById('endTime').addEventListener('input', function(event) {
    applyTimeMask(event);
    // Atualizar valor para o formato `mm:ss`
    if (event.target.value.length > 0) {
        event.target.value = event.target.value.replace(/^0+/, '');
    }
});
