/**
 * Push Notifications & FCM Token Management
 * Handles registration, permissions, and token storage
 */

import { PushNotifications } from '@capacitor/push-notifications'
import { isNativePlatform } from './platform'

/**
 * Initialize push notifications and request permissions
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export async function initializePushNotifications() {
  // Only on native platforms
  if (!isNativePlatform()) {
    console.log('Push notifications only available on native platforms')
    return null
  }

  try {
    // Request permission
    const permissionResult = await PushNotifications.requestPermissions()
    
    if (permissionResult.receive !== 'granted') {
      console.log('Push notification permission denied')
      return null
    }

    // Register with FCM/APNs
    await PushNotifications.register()
    
    return new Promise((resolve, reject) => {
      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        reject(new Error('FCM token registration timeout'))
      }, 10000)

      // Listen for registration success
      PushNotifications.addListener('registration', (token) => {
        clearTimeout(timeout)
        console.log('Push registration success, token:', token.value)
        resolve(token.value)
      })

      // Listen for registration error
      PushNotifications.addListener('registrationError', (error) => {
        clearTimeout(timeout)
        console.error('Push registration error:', error)
        reject(error)
      })
    })
  } catch (error) {
    console.error('Error initializing push notifications:', error)
    return null
  }
}

/**
 * Set up push notification listeners for incoming messages
 * @param {Function} onNotificationReceived - Callback when notification arrives
 */
export function setupPushNotificationListeners(onNotificationReceived) {
  if (!isNativePlatform()) {
    return
  }

  try {
    // Notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification)
      if (onNotificationReceived) {
        onNotificationReceived(notification)
      }
    })

    // Notification action performed (user tapped notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification)
      
      // Extract alert data from notification
      const data = notification.notification.data
      
      if (data?.alertId) {
        // Navigate to SOS detail screen
        if (onNotificationReceived) {
          onNotificationReceived({
            type: 'sos_alert',
            alertId: data.alertId,
            action: 'tap'
          })
        }
      }
    })
  } catch (error) {
    console.error('Error setting up push notification listeners:', error)
  }
}

/**
 * Remove all push notification listeners
 */
export async function removePushNotificationListeners() {
  if (!isNativePlatform()) {
    return
  }

  try {
    await PushNotifications.removeAllListeners()
    console.log('Push notification listeners removed')
  } catch (error) {
    console.error('Error removing push notification listeners:', error)
  }
}

/**
 * Get current FCM token (if already registered)
 * @returns {Promise<string|null>} Current token or null
 */
export async function getCurrentFCMToken() {
  if (!isNativePlatform()) {
    return null
  }

  try {
    // Check if we have permission
    const permStatus = await PushNotifications.checkPermissions()
    
    if (permStatus.receive !== 'granted') {
      return null
    }

    // Try to get token (may require re-registration)
    return await initializePushNotifications()
  } catch (error) {
    console.error('Error getting current FCM token:', error)
    return null
  }
}
