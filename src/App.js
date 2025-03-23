// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MoodMusicApp from './MoodMusicApp';
import SpotifyCallback from './components/SpotifyCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MoodMusicApp />} />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </Router>
  );
}

export default App;