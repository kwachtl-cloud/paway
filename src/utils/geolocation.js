import { Geolocation } from '@capacitor/geolocation';

/**
 * Get current position using Capacitor Geolocation API
 * Falls back to browser API if Capacitor is not available
 */
export const getCurrentPosition = async () => {
  try {
    // Try Capacitor first (mobile)
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      },
      timestamp: position.timestamp
    };
  } catch (error) {
    // Fallback to browser API (web)
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
    }
    throw new Error('Geolocation not available');
  }
};

/**
 * Check if geolocation permissions are granted
 */
export const checkGeolocationPermissions = async () => {
  try {
    const permissions = await Geolocation.checkPermissions();
    return permissions.location === 'granted';
  } catch (error) {
    // Browser fallback
    return 'geolocation' in navigator;
  }
};

/**
 * Request geolocation permissions
 */
export const requestGeolocationPermissions = async () => {
  try {
    const permissions = await Geolocation.requestPermissions();
    return permissions.location === 'granted';
  } catch (error) {
    console.error('Error requesting geolocation permissions:', error);
    return false;
  }
};
