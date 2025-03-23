// services/MusicServiceFactory.js
import SpotifyService from './SpotifyService';
import YouTubeMusicService from './YouTubeMusicService';

/**
 * Factory class for creating music service instances
 */
class MusicServiceFactory {
  static #spotifyInstance = null;
  static #youtubeMusicInstance = null;

  /**
   * Get a service instance by name
   * @param {string} serviceName - The service name ('spotify' or 'youtube')
   * @returns {MusicServiceInterface} A music service instance
   */
  static getService(serviceName) {
    switch (serviceName.toLowerCase()) {
      case 'spotify':
        if (!this.#spotifyInstance) {
          this.#spotifyInstance = new SpotifyService();
        }
        return this.#spotifyInstance;
      
      case 'youtube':
        if (!this.#youtubeMusicInstance) {
          this.#youtubeMusicInstance = new YouTubeMusicService();
        }
        return this.#youtubeMusicInstance;
      
      default:
        throw new Error(`Unknown music service: ${serviceName}`);
    }
  }

  /**
   * Get the preferred service based on availability and authentication
   * @returns {MusicServiceInterface} The best available music service
   */
  static getPreferredService() {
    // Try Spotify first
    const spotifyService = this.getService('spotify');
    if (spotifyService.isAuthenticated()) {
      return spotifyService;
    }
    
    // Fall back to YouTube Music
    return this.getService('youtube');
  }
}

export default MusicServiceFactory;