// services/YouTubeMusicService.js
import axios from 'axios';
import MusicServiceInterface from './MusicServiceInterface';

class YouTubeMusicService extends MusicServiceInterface {
  constructor() {
    super();
    this.accessToken = null;
    this.tokenExpiryTime = null;
    this.apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    this.apiBase = 'https://www.googleapis.com/youtube/v3';
    this.youtubePlayer = null;
    this.isPlayerReady = false;
  }

  async initialize() {
    // Load YouTube IFrame API
    if (!window.YT) {
      await new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
        
        // If the script fails to load within 10 seconds, reject
        setTimeout(() => reject(new Error('YouTube API load timeout')), 10000);
      });
    }
    
    if (!document.getElementById('youtube-player')) {
      // Create a hidden div for the YouTube player
      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player';
      playerDiv.style.position = 'absolute';
      playerDiv.style.top = '-9999px';
      playerDiv.style.left = '-9999px';
      document.body.appendChild(playerDiv);
    }

    // Initialize the player
    return new Promise((resolve, reject) => {
      try {
        this.youtubePlayer = new window.YT.Player('youtube-player', {
          height: '240',
          width: '320',
          playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1
          },
          events: {
            'onReady': () => {
              this.isPlayerReady = true;
              resolve();
            },
            'onError': (event) => {
              console.error('YouTube player error:', event);
              reject(new Error('YouTube player initialization error'));
            }
          }
        });
      } catch (error) {
        console.error('YouTube player creation error:', error);
        reject(error);
      }
    });
  }

  async searchTracks(query, limit = 5) {
    try {
      const response = await axios.get(`${this.apiBase}/search`, {
        params: {
          part: 'snippet',
          maxResults: limit,
          q: query + ' music',
          type: 'video',
          videoCategoryId: '10', // Music category
          key: this.apiKey
        }
      });

      return response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        albumArt: item.snippet.thumbnails.high.url,
        uri: item.id.videoId
      }));
    } catch (error) {
      console.error("Error searching YouTube Music tracks", error);
      throw new Error(`YouTube Music search failed: ${error.message}`);
    }
  }

  async getRecommendationsByMood(mood, limit = 3, genre = null) {
    try {
      // Expanded mood-to-search term mapping
      const moodSearchTerms = {
        happy: 'happy upbeat music',
        sad: 'sad emotional music',
        energetic: 'energetic dance music',
        calm: 'calm relaxing music',
        neutral: 'popular music',
        angry: 'angry intense music',
        anxious: 'tense dramatic music',
        tired: 'chill sleep music',
        bored: 'exciting catchy music'
      };
      
      // Get the base search term for the mood
      const moodTerm = moodSearchTerms[mood] || moodSearchTerms.neutral;
      
      // If a genre is provided, include it in the search
      const searchTerm = genre 
        ? `${moodTerm} ${genre}`
        : moodTerm;
      
      // Add "music video" to ensure we get music results
      const finalSearchTerm = `${searchTerm} music video`;
      
      return await this.searchTracks(finalSearchTerm, limit);
    } catch (error) {
      console.error("Error getting YouTube Music recommendations", error);
      throw new Error(`YouTube Music recommendations failed: ${error.message}`);
    }
  }

  async playTrack(videoId) {
    try {
      if (!this.isPlayerReady) {
        await this.initialize();
      }
      
      this.youtubePlayer.loadVideoById(videoId);
      this.youtubePlayer.playVideo();
      
      return true;
    } catch (error) {
      console.error("Error playing YouTube track", error);
      throw new Error(`YouTube playback failed: ${error.message}`);
    }
  }

  async pausePlayback() {
    try {
      if (!this.isPlayerReady) {
        throw new Error('YouTube player not initialized');
      }
      
      this.youtubePlayer.pauseVideo();
      
      return true;
    } catch (error) {
      console.error("Error pausing YouTube playback", error);
      throw new Error(`YouTube pause failed: ${error.message}`);
    }
  }

  isAuthenticated() {
    // YouTube Music API doesn't require authentication for basic search and playback
    return true;
  }

  logout() {
    // Not needed for YouTube Music as we're not using authenticated endpoints
    if (this.youtubePlayer) {
      this.youtubePlayer.stopVideo();
    }
  }
}

export default YouTubeMusicService;