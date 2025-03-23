// services/MusicServiceInterface.js

/**
 * Base class defining the interface for music streaming services
 * All music service implementations should extend this class
 */
class MusicServiceInterface {
    constructor() {
      // Ensure this class can't be instantiated directly
      if (this.constructor === MusicServiceInterface) {
        throw new Error("MusicServiceInterface is an abstract class and cannot be instantiated directly");
      }
    }
  
    /**
     * Initialize the service
     * @returns {Promise<void>}
     */
    async initialize() {
      throw new Error("Method 'initialize()' must be implemented by subclasses");
    }
  
    /**
     * Search for tracks by query
     * @param {string} query - The search query
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of track objects
     */
    async searchTracks(query, limit) {
      throw new Error("Method 'searchTracks()' must be implemented by subclasses");
    }
  
    /**
     * Get music recommendations based on mood
     * @param {string} mood - The mood (happy, sad, energetic, calm, neutral)
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of track objects
     */
    async getRecommendationsByMood(mood, limit) {
      throw new Error("Method 'getRecommendationsByMood()' must be implemented by subclasses");
    }
  
    /**
     * Play a specific track
     * @param {string} trackUri - The track URI/ID
     * @returns {Promise<boolean>} - Success status
     */
    async playTrack(trackUri) {
      throw new Error("Method 'playTrack()' must be implemented by subclasses");
    }
  
    /**
     * Pause current playback
     * @returns {Promise<boolean>} - Success status
     */
    async pausePlayback() {
      throw new Error("Method 'pausePlayback()' must be implemented by subclasses");
    }
  
    /**
     * Check if the service is authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
      throw new Error("Method 'isAuthenticated()' must be implemented by subclasses");
    }
  
    /**
     * Log out from the service
     * @returns {void}
     */
    logout() {
      throw new Error("Method 'logout()' must be implemented by subclasses");
    }
  }
  
  export default MusicServiceInterface;