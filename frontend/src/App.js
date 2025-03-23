import React, { useState, useEffect } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('');

  // Setup speech recognition (Web Speech API)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Web Speech API is not supported by this browser.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1][0].transcript;
      setTranscript(lastResult);
      // Here you can send transcript to your backend or Dialogflow API
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
    };

    // Start speech recognition on button click
    document.getElementById('startBtn').addEventListener('click', () => {
      recognition.start();
    });
  }, []);

  // Simple music playback using Web Audio API
  const playMusic = () => {
    // Create a basic oscillator as a placeholder for playing a tone
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1); // play for 1 second
  };

  return (
    <div className="App">
      <h1>Hackathon Music Chatbot</h1>
      <button id="startBtn">Start Voice Recognition</button>
      <p><strong>Transcript:</strong> {transcript}</p>
      <button onClick={playMusic}>Play Sample Music</button>
      <div>
        <h2>Chatbot Message</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default App;