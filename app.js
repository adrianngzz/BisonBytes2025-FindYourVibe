let mediaRecorder;
let audioChunks = [];

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        // Send audio data to server for transcription
        sendAudioToServer(audioBlob);
        audioChunks = [];
    };

    mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert("An error occurred during recording. Please check the console for details.");
    };

    mediaRecorder.start();
    document.querySelector('button[onclick="startRecording()"]').disabled = true;
    document.querySelector('button[onclick="stopRecording()"]').disabled = false;
    console.log("Recording started...");
}

function stopRecording() {
    mediaRecorder.stop();
    document.querySelector('button[onclick="startRecording()"]').disabled = false;
    document.querySelector('button[onclick="stopRecording()"]').disabled = true;
    console.log("Recording stopped.");
}