// services/SpotifyService.js
import axios from 'axios';
import MusicServiceInterface from './MusicServiceInterface';

class SpotifyService extends MusicServiceInterface {
  constructor() {
    super();
    this.accessToken = null;
    this.tokenExpiryTime = null;
    this.clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI || window.location.origin + '/callback';
    this.apiBase = 'https://api.spotify.com/v1';
    this.authBase = 'https://accounts.spotify.com/authorize';
    this.tokenUrl = 'https://accounts.spotify.com/api/token';
    this.scopes = [
      'user-read-private',
      'user-read-email',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];
    
    // Initialize the Spotify Web Playback SDK
    this.player = null;
    this.deviceId = null;
  }

  getLoginUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      show_dialog: true
    });
    
    return `${this.authBase}?${params.toString()}`;
  }

  async handleRedirect(code) {
    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.setTokenData(response.data);
      localStorage.setItem('spotify_auth_data', JSON.stringify({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiryTime: Date.now() + (response.data.expires_in * 1000)
      }));
      
      return true;
    } catch (error) {
      console.error("Error handling Spotify authorization", error);
      throw new Error(`Spotify authorization failed: ${error.message}`);
    }
  }

  async refreshToken() {
    try {
      const authData = JSON.parse(localStorage.getItem('spotify_auth_data') || '{}');
      const { refreshToken } = authData;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.setTokenData(response.data);
      localStorage.setItem('spotify_auth_data', JSON.stringify({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken, // In case no new refresh token is provided
        expiryTime: Date.now() + (response.data.expires_in * 1000)
      }));
      
      return true;
    } catch (error) {
      console.error("Error refreshing token", error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  setTokenData(data) {
    this.accessToken = data.access_token;
    this.tokenExpiryTime = Date.now() + (data.expires_in * 1000);
  }

  async ensureTokenValid() {
    // Check if token needs refreshing (with 5 min buffer)
    const authData = JSON.parse(localStorage.getItem('spotify_auth_data') || '{}');
    
    if (!authData.accessToken) {
      throw new Error('Not authenticated with Spotify');
    }
    
    this.accessToken = authData.accessToken;
    this.tokenExpiryTime = authData.expiryTime;
    
    if (Date.now() > this.tokenExpiryTime - 300000) { // 5 min buffer
      await this.refreshToken();
    }
  }

  async initializePlayer() {
    // Ensure the Spotify Web Playback SDK script is loaded
    if (!window.Spotify) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    await this.ensureTokenValid();
    
    return new Promise((resolve, reject) => {
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.player = new window.Spotify.Player({
          name: 'Mood Music Player',
          getOAuthToken: cb => { 
            cb(this.accessToken); 
          }
        });

        // Error handling
        this.player.addListener('initialization_error', ({ message }) => {
          console.error('Spotify player initialization error:', message);
          reject(new Error(`Player initialization error: ${message}`));
        });
        
        this.player.addListener('authentication_error', ({ message }) => {
          console.error('Spotify player authentication error:', message);
          reject(new Error(`Player authentication error: ${message}`));
        });
        
        this.player.addListener('account_error', ({ message }) => {
          console.error('Spotify player account error:', message);
          reject(new Error(`Player account error: ${message}`));
        });
        
        this.player.addListener('playback_error', ({ message }) => {
          console.error('Spotify player playback error:', message);
          reject(new Error(`Player playback error: ${message}`));
        });

        // Ready
        this.player.addListener('ready', ({ device_id }) => {
          console.log('Spotify player ready with device ID', device_id);
          this.deviceId = device_id;
          resolve(device_id);
        });

        // Connect to the player
        this.player.connect();
      };
    });
  }

  async searchTracks(query, limit = 5) {
    try {
      await this.ensureTokenValid();

      const response = await axios.get(`${this.apiBase}/search`, {
        params: {
          q: query,
          type: 'track',
          limit
        },
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        uri: track.uri
      }));
    } catch (error) {
      console.error("Error searching Spotify tracks", error);
      throw new Error(`Track search failed: ${error.message}`);
    }
  }

  async getRecommendationsByMood(mood, limit = 3, genre = null) {
    try {
      await this.ensureTokenValid();
      
      // Expanded mood parameters to include more emotional states
      const moodParameters = {
        happy: { min_valence: 0.7, target_energy: 0.8, target_tempo: 120 },
        sad: { max_valence: 0.4, target_energy: 0.4, target_tempo: 80 },
        energetic: { min_energy: 0.8, target_valence: 0.6, min_tempo: 120 },
        calm: { max_energy: 0.4, target_valence: 0.5, max_tempo: 100 },
        neutral: { target_valence: 0.5, target_energy: 0.5 },
        angry: { target_energy: 0.8, min_tempo: 130, target_valence: 0.3 },
        anxious: { target_energy: 0.6, min_tempo: 110, max_valence: 0.5 },
        tired: { max_energy: 0.3, max_tempo: 85, target_valence: 0.4 },
        bored: { target_energy: 0.7, target_valence: 0.6, target_tempo: 115 }
      };
      
      // If mood doesn't match our predefined moods, default to neutral
      const params = moodParameters[mood] || moodParameters.neutral;
      
      // Prepare seed tracks, genres and artists
      let seedTracks = [];
      let seedGenres = [];
      let seedArtists = [];
      
      // If genre is provided, use it as a seed genre
      if (genre) {
        // Map user-friendly genres to Spotify genre seeds
        const genreMap = {
          "rock": "rock",
          "pop": "pop",
          "hip hop": "hip-hop",
          "rap": "hip-hop",
          "classical": "classical",
          "jazz": "jazz",
          "blues": "blues",
          "country": "country",
          "electronic": "electronic",
          "dance": "dance",
          "edm": "edm",
          "r&b": "r-n-b",
          "soul": "soul",
          "folk": "folk",
          "indie": "indie",
          "metal": "metal",
          "punk": "punk",
          "alternative": "alt-rock",
          "reggae": "reggae",
          "ambient": "ambient",
          "techno": "techno",
          "house": "house",
          "disco": "disco",
          "funk": "funk",
          "latin": "latin"
        };
        
        // Add the genre seed if it maps to a valid Spotify genre
        if (genreMap[genre.toLowerCase()]) {
          seedGenres.push(genreMap[genre.toLowerCase()]);
        }
      }
      
      // Get tracks for seeds based on mood-related search terms
      const searchTerms = {
        happy: "happy upbeat",
        sad: "sad melancholy",
        energetic: "energetic upbeat dance",
        calm: "calm relaxing ambient",
        neutral: "popular",
        angry: "angry intense",
        anxious: "tense nervous",
        tired: "chill sleepy",
        bored: "exciting catchy"
      };
      
      // If we have a genre preference, include it in the search
      const searchQuery = genre 
        ? `${searchTerms[mood] || searchTerms.neutral} ${genre}`
        : searchTerms[mood] || searchTerms.neutral;
      
      const searchResults = await this.searchTracks(searchQuery, 2);
      
      // Extract seed tracks from search results
      if (searchResults.length > 0) {
        seedTracks = searchResults.map(track => track.id);
        
        // If we don't have genre seeds, we can also use artist seeds
        if (seedGenres.length === 0 && seedTracks.length < 3) {
          // Extract unique artist IDs from search results
          const artistIds = searchResults.flatMap(track => {
            const artistId = track.uri.split(':')[2].split(',')[0];
            return artistId ? [artistId] : [];
          });
          
          // Add up to 2 artist seeds
          seedArtists = [...new Set(artistIds)].slice(0, 2);
        }
      }
      
      // Prepare request parameters for recommendations
      const recommendationParams = {
        limit,
        ...params
      };
      
      // Add seeds (Spotify requires at least one seed type)
      if (seedTracks.length > 0) {
        recommendationParams.seed_tracks = seedTracks.join(',');
      }
      
      if (seedGenres.length > 0) {
        recommendationParams.seed_genres = seedGenres.join(',');
      }
      
      if (seedArtists.length > 0) {
        recommendationParams.seed_artists = seedArtists.join(',');
      }
      
      // If we don't have any seeds yet, use generic popular genres
      if (!recommendationParams.seed_tracks && !recommendationParams.seed_genres && !recommendationParams.seed_artists) {
        recommendationParams.seed_genres = 'pop,rock,hip-hop';
      }
      
      // Now get recommendations using our seeds and mood parameters
      const recommendationsResponse = await axios.get(`${this.apiBase}/recommendations`, {
        params: recommendationParams,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return recommendationsResponse.data.tracks.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        uri: track.uri,
        previewUrl: track.preview_url  // Include preview URL if available
      }));
    } catch (error) {
      console.error("Error getting Spotify recommendations", error);
      throw new Error(`Recommendations retrieval failed: ${error.message}`);
    }
  }

  async playTrack(trackUri) {
    try {
      await this.ensureTokenValid();
      
      if (!this.deviceId) {
        await this.initializePlayer();
      }
      
      await axios.put(
        `${this.apiBase}/me/player/play?device_id=${this.deviceId}`, 
        { uris: [trackUri] },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error("Error playing track", error);
      throw new Error(`Playback failed: ${error.message}`);
    }
  }

  async pausePlayback() {
    try {
      await this.ensureTokenValid();
      
      if (!this.deviceId) {
        throw new Error('Spotify player not initialized');
      }
      
      await axios.put(
        `${this.apiBase}/me/player/pause?device_id=${this.deviceId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error("Error pausing playback", error);
      throw new Error(`Pause failed: ${error.message}`);
    }
  }

  isAuthenticated() {
    const authData = JSON.parse(localStorage.getItem('spotify_auth_data') || '{}');
    return !!authData.accessToken && Date.now() < authData.expiryTime;
  }

  logout() {
    localStorage.removeItem('spotify_auth_data');
    this.accessToken = null;
    this.tokenExpiryTime = null;
    
    if (this.player) {
      this.player.disconnect();
      this.player = null;
      this.deviceId = null;
    }
  }
}

export default SpotifyService;