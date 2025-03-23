// utils/ErrorHandler.js

/**
 * ErrorHandler class for handling music service errors
 */
class ErrorHandler {
    /**
     * Common error codes
     */
    static ERROR_CODES = {
      AUTHENTICATION_FAILED: 'auth_failed',
      PLAYBACK_FAILED: 'playback_failed',
      SEARCH_FAILED: 'search_failed',
      API_ERROR: 'api_error',
      NETWORK_ERROR: 'network_error',
      PERMISSION_DENIED: 'permission_denied',
      LICENSE_RESTRICTION: 'license_restriction',
      PLAYER_ERROR: 'player_error',
      UNKNOWN_ERROR: 'unknown_error'
    };
  
    /**
     * Handle API errors and categorize them
     * @param {Error} error - The original error
     * @returns {Object} Normalized error object with code and message
     */
    static handleApiError(error) {
      // Default error structure
      const normalizedError = {
        code: this.ERROR_CODES.UNKNOWN_ERROR,
        message: error.message || 'Unknown error occurred',
        originalError: error
      };
  
      // Check if it's an Axios error
      if (error.isAxiosError) {
        if (!navigator.onLine) {
          return {
            ...normalizedError,
            code: this.ERROR_CODES.NETWORK_ERROR,
            message: 'Network connection lost. Please check your internet connection.'
          };
        }
  
        // Handle HTTP status codes
        const status = error.response?.status;
        
        if (status === 401 || status === 403) {
          return {
            ...normalizedError,
            code: this.ERROR_CODES.AUTHENTICATION_FAILED,
            message: 'Authentication failed. Please log in again.'
          };
        }
        
        if (status === 429) {
          return {
            ...normalizedError,
            code: this.ERROR_CODES.API_ERROR,
            message: 'Rate limit exceeded. Please try again later.'
          };
        }
        
        if (status >= 500) {
          return {
            ...normalizedError,
            code: this.ERROR_CODES.API_ERROR,
            message: 'Music service is currently unavailable. Please try again later.'
          };
        }
      }
  
      // Check for specific error messages
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('authentication') || errorMsg.includes('unauthorized') || errorMsg.includes('token')) {
        return {
          ...normalizedError,
          code: this.ERROR_CODES.AUTHENTICATION_FAILED,
          message: 'Authentication issue. Please log in again.'
        };
      }
      
      if (errorMsg.includes('playback') || errorMsg.includes('playing')) {
        return {
          ...normalizedError,
          code: this.ERROR_CODES.PLAYBACK_FAILED,
          message: 'Unable to play this track. Please try another track.'
        };
      }
      
      if (errorMsg.includes('license') || errorMsg.includes('rights') || errorMsg.includes('copyright')) {
        return {
          ...normalizedError,
          code: this.ERROR_CODES.LICENSE_RESTRICTION,
          message: 'This track is not available due to licensing restrictions.'
        };
      }
      
      if (errorMsg.includes('permission') || errorMsg.includes('access denied')) {
        return {
          ...normalizedError,
          code: this.ERROR_CODES.PERMISSION_DENIED,
          message: 'Permission denied. The app may need additional permissions.'
        };
      }
      
      if (errorMsg.includes('search') || errorMsg.includes('query')) {
        return {
          ...normalizedError,
          code: this.ERROR_CODES.SEARCH_FAILED,
          message: 'Search failed. Please try a different search term.'
        };
      }
      
      if (errorMsg.includes('player') || errorMsg.includes('sdk')) {
        return {
          ...normalizedError,
          code: this.ERROR_CODES.PLAYER_ERROR,
          message: 'Player error. Please reload the application.'
        };
      }
  
      return normalizedError;
    }
  
    /**
     * Handle playback errors specifically
     * @param {Error} error - The original error
     * @param {Function} fallbackCallback - Optional callback for fallback action
     * @returns {Object} Normalized error with fallback suggestion
     */
    static handlePlaybackError(error, fallbackCallback = null) {
      const normalizedError = this.handleApiError(error);
      
      // Add fallback information for playback errors
      if ([
        this.ERROR_CODES.PLAYBACK_FAILED, 
        this.ERROR_CODES.LICENSE_RESTRICTION,
        this.ERROR_CODES.PLAYER_ERROR
      ].includes(normalizedError.code)) {
        normalizedError.hasFallback = true;
        normalizedError.fallbackMessage = 'Would you like to try playing this with another service?';
        normalizedError.fallbackCallback = fallbackCallback;
      }
      
      return normalizedError;
    }
  
    /**
     * Log error details for debugging
     * @param {string} context - Where the error occurred
     * @param {Error} error - The error object
     */
    static logError(context, error) {
      console.error(`[${context}] Error:`, error);
      
      // In a production app, you might want to log to a service like Sentry
      // if (process.env.NODE_ENV === 'production' && window.Sentry) {
      //   window.Sentry.captureException(error);
      // }
    }
  }
  
  export default ErrorHandler;