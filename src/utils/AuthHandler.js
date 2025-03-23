// utils/AuthHandler.js
import MusicServiceFactory from '../services/MusicServiceFactory';

/**
 * Handles authentication with music streaming services
 */
class AuthHandler {
  /**
   * Initiate login flow for a specific service
   * @param {string} serviceName - Name of the service ('spotify' or 'youtube')
   */
  static initiateLogin(serviceName) {
    try {
      const service = MusicServiceFactory.getService(serviceName);
      
      if (serviceName.toLowerCase() === 'spotify') {
        // For Spotify, redirect to authorization page
        window.location.href = service.getLoginUrl();
      } else if (serviceName.toLowerCase() === 'youtube') {
        // YouTube Music doesn't require OAuth for basic functionality in our implementation
        return true;
      }
    } catch (error) {
      console.error(`Error initiating ${serviceName} login:`, error);
      throw error;
    }
  }

  /**
   * Handle the redirect from authentication service
   * @param {string} serviceName - Name of the service
   * @param {URLSearchParams} queryParams - URL query parameters from redirect
   * @returns {Promise<boolean>} Authentication success status
   */
  static async handleAuthRedirect(serviceName, queryParams) {
    try {
      if (serviceName.toLowerCase() === 'spotify') {
        const code = queryParams.get('code');
        if (!code) {
          const error = queryParams.get('error');
          throw new Error(`Spotify authorization failed: ${error || 'No authorization code received'}`);
        }
        
        const spotifyService = MusicServiceFactory.getService('spotify');
        return await spotifyService.handleRedirect(code);
      }
      
      return false;
    } catch (error) {
      console.error(`Error handling ${serviceName} redirect:`, error);
      throw error;
    }
  }

  /**
   * Check if a service is authenticated
   * @param {string} serviceName - Name of the service
   * @returns {boolean} Authentication status
   */
  static isAuthenticated(serviceName) {
    try {
      const service = MusicServiceFactory.getService(serviceName);
      return service.isAuthenticated();
    } catch (error) {
      console.error(`Error checking authentication for ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Log out from a service
   * @param {string} serviceName - Name of the service
   */
  static logout(serviceName) {
    try {
      const service = MusicServiceFactory.getService(serviceName);
      service.logout();
    } catch (error) {
      console.error(`Error logging out from ${serviceName}:`, error);
      throw error;
    }
  }
}

export default AuthHandler;