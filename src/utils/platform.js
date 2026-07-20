import { Capacitor } from '@capacitor/core';

/**
 * Check if running in native mobile app (not web browser)
 */
export const isNativePlatform = () => {
  try {
    return Capacitor?.isNativePlatform() || false;
  } catch (error) {
    return false;
  }
};

/**
 * Check if running on web
 */
export const isWeb = () => {
  try {
    return Capacitor?.getPlatform() === 'web';
  } catch (error) {
    return true; // Default to web if Capacitor not available
  }
};

/**
 * Get current platform (ios, android, web)
 */
export const getPlatform = () => {
  try {
    return Capacitor?.getPlatform() || 'web';
  } catch (error) {
    return 'web';
  }
};

/**
 * Execute a Firebase query with timeout
 * Falls back to localStorage if timeout or error
 */
export const withTimeout = async (promise, timeoutMs = 3000, fallback = null) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  
  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    console.warn('Firebase timeout or error, using fallback:', error.message);
    if (fallback) return fallback();
    throw error;
  }
};
