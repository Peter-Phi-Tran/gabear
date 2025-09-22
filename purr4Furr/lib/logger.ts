/**
 * Logger utility for handling errors without exposing details to users
 * Only logs in development mode to help with debugging
 */

export const logger = {
  /**
   * Log errors for development debugging without exposing to users
   */
  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[DEV] ${message}:`, error);
    }
  },

  /**
   * Log info for development debugging
   */
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEV] ${message}:`, data);
    }
  },

  /**
   * Log warnings for development debugging
   */
  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[DEV] ${message}:`, data);
    }
  }
};