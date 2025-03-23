# Mood Music App

A React application that uses speech recognition to have a conversation with users, analyze their mood, and recommend appropriate music through Spotify or YouTube Music.

## Features

- Voice-based interaction using Web Speech API
- Mood analysis based on conversation
- Integration with Spotify API for music recommendations and playback
- YouTube Music fallback when Spotify is unavailable
- OAuth authentication for Spotify
- Error handling and service switching
- Responsive UI with playback controls

## Project Structure

```
mood-music-app/
├── node_modules/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js (Router setup)
│   ├── MoodMusicApp.jsx (Main application)
│   ├── components/
│   │   └── SpotifyCallback.jsx (OAuth callback handler)
│   ├── services/
│   │   ├── MusicServiceInterface.js (Abstract class for music services)
│   │   ├── MusicServiceFactory.js (Factory for creating service instances)
│   │   ├── SpotifyService.js (Spotify API integration)
│   │   └── YouTubeMusicService.js (YouTube Music integration)
│   ├── utils/
│   │   ├── AuthHandler.js (Authentication helper)
│   │   ├── ErrorHandler.js (Error handling utilities)
│   │   └── MoodAnalyzer.js (Text-based mood analysis)
│   ├── index.js
│   └── index.css
├── .env (Environment variables - not in repo)
├── .env.example (Example environment variables)
├── package.json
└── README.md
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your API credentials:
   ```
   # Spotify API Credentials
   REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
   REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

   # YouTube API Key
   REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. Start the development server:
   ```
   npm start
   ```

## API Credentials

### Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Set the redirect URI to `http://localhost:3000/callback`
4. Copy your Client ID and Client Secret to the `.env` file

### YouTube API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the YouTube Data API v3
4. Create an API Key
5. Copy the API Key to the `.env` file

## Usage

1. Click "Start Conversation" to begin
2. Speak to the app about how you're feeling
3. End the conversation when you're ready
4. The app will analyze your mood and recommend songs
5. Play the songs directly in the app

## License

MIT