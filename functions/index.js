/**
 * Firebase Cloud Functions for Paway App
 * Handles push notifications for SOS alerts based on geolocation
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { geohashQueryBounds, distanceBetween } = require('geofire-common');

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Send push notifications when new SOS alert is created
 * Triggers on: sos_alerts/{alertId}
 */
exports.sendSOSNotifications = onDocumentCreated(
  'sos_alerts/{alertId}',
  async (event) => {
    try {
      // Get the newly created alert data
      const alertData = event.data.data();
      const alertId = event.params.alertId;

      console.log(`🚨 New SOS Alert: ${alertId}`, alertData);

      // Validate required fields
      if (!alertData?.location?.lat || !alertData?.location?.lng) {
        console.error('❌ Alert missing location data');
        return null;
      }

      const {
        petName,
        petType,
        description,
        photos,
        location,
        contactPhone,
        userId,
        userName,
      } = alertData;

      const alertLat = location.lat;
      const alertLng = location.lng;
      const radiusInKm = 10; // 10km notification radius
      const radiusInM = radiusInKm * 1000;

      console.log(`📍 Alert location: ${alertLat}, ${alertLng}`);
      console.log(`📡 Notification radius: ${radiusInKm}km`);

      // Get geohash bounds for the radius
      const bounds = geohashQueryBounds([alertLat, alertLng], radiusInM);
      console.log(`🔍 Geohash bounds: ${bounds.length} queries`);

      // Query users within geohash bounds
      const usersInRadius = [];
      
      for (const bound of bounds) {
        const usersRef = db.collection('users');
        const q = usersRef
          .orderBy('lastLocation.geohash')
          .startAt(bound[0])
          .endAt(bound[1]);

        const snapshot = await q.get();
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          
          // Skip the user who created the alert
          if (doc.id === userId) {
            return;
          }

          // Validate user has location and FCM token
          if (!userData.lastLocation?.lat || !userData.lastLocation?.lng) {
            return;
          }

          if (!userData.fcmToken) {
            console.log(`⚠️ User ${doc.id} has no FCM token`);
            return;
          }

          // Calculate actual distance
          const userLat = userData.lastLocation.lat;
          const userLng = userData.lastLocation.lng;
          const distanceKm = distanceBetween([alertLat, alertLng], [userLat, userLng]);

          // Only include if within radius (in km)
          if (distanceKm <= radiusInKm) {
            usersInRadius.push({
              uid: doc.id,
              fcmToken: userData.fcmToken,
              distance: distanceKm.toFixed(2),
            });
          }
        });
      }

      console.log(`👥 Found ${usersInRadius.length} users in ${radiusInKm}km radius`);

      if (usersInRadius.length === 0) {
        console.log('ℹ️ No users to notify');
        return null;
      }

      // Prepare notification payload
      const notificationTitle = `🚨 PILNE: Zaginął ${petType || 'zwierzak'} w Twojej okolicy!`;
      const notificationBody = `${petName || 'Zwierzak'} zaginął ${
        usersInRadius[0]?.distance || '?'
      }km od Ciebie. ${description ? description.substring(0, 100) : 'Kliknij aby pomóc'}`;

      // Prepare messages for all users
      const messages = usersInRadius.map((user) => ({
        token: user.fcmToken,
        notification: {
          title: notificationTitle,
          body: notificationBody,
          imageUrl: photos?.[0] || undefined, // First photo if available
        },
        data: {
          alertId: alertId,
          type: 'sos_alert',
          petName: petName || '',
          petType: petType || '',
          distance: user.distance.toString(),
          latitude: alertLat.toString(),
          longitude: alertLng.toString(),
          contactPhone: contactPhone || '',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'sos_alerts',
            priority: 'max',
            defaultSound: true,
            defaultVibrateTimings: true,
            visibility: 'public',
            color: '#E74C3C', // Red for emergency
            icon: 'ic_stat_notification',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1,
            },
          },
        },
      }));

      // Send notifications in batches of 500 (FCM limit)
      const batchSize = 500;
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        
        try {
          const response = await messaging.sendEach(batch);
          
          successCount += response.successCount;
          failureCount += response.failureCount;

          // Log failed tokens for debugging
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`❌ Failed to send to user ${usersInRadius[i + idx].uid}:`, resp.error);
              
              // TODO: Handle invalid tokens (remove from database)
              if (resp.error?.code === 'messaging/invalid-registration-token' ||
                  resp.error?.code === 'messaging/registration-token-not-registered') {
                console.log(`🗑️ Should remove invalid token for user ${usersInRadius[i + idx].uid}`);
              }
            }
          });
        } catch (error) {
          console.error('❌ Error sending batch:', error);
          failureCount += batch.length;
        }
      }

      console.log(`✅ Notifications sent successfully: ${successCount}`);
      console.log(`❌ Notifications failed: ${failureCount}`);

      // Update alert with notification stats
      await db.collection('sos_alerts').doc(alertId).update({
        notificationsSent: successCount,
        notificationsFailed: failureCount,
        notificationsSentAt: new Date(),
      });

      return {
        success: true,
        sent: successCount,
        failed: failureCount,
        totalUsers: usersInRadius.length,
      };
    } catch (error) {
      console.error('❌ Error in sendSOSNotifications:', error);
      throw error;
    }
  }
);

/**
 * Send push notifications when new hazard is reported
 * Triggers on: hazards/{hazardId}
 */
exports.sendHazardNotification = onDocumentCreated(
  'hazards/{hazardId}',
  async (event) => {
    try {
      // Get the newly created hazard data
      const hazardData = event.data.data();
      const hazardId = event.params.hazardId;

      console.log(`⚠️ New Hazard Reported: ${hazardId}`, hazardData);

      // Validate required fields
      if (!hazardData?.location?.lat || !hazardData?.location?.lng) {
        console.error('❌ Hazard missing location data');
        return null;
      }

      const {
        type,
        description,
        location,
        reportedBy,
        reporterName,
      } = hazardData;

      const hazardLat = location.lat;
      const hazardLng = location.lng;
      const radiusInKm = 5; // 5km notification radius for hazards
      const radiusInM = radiusInKm * 1000;

      console.log(`📍 Hazard location: ${hazardLat}, ${hazardLng}`);
      console.log(`📡 Notification radius: ${radiusInKm}km`);

      // Map hazard types to readable Polish labels
      const hazardLabels = {
        bait: 'Rozsypana trutka / niebezpieczny pokarm',
        glass: 'Rozbite szkło',
        wildlife: 'Dzikie zwierzęta (dzik, lis)',
        reactive_dog: 'Reaktywny / agresywny pies',
        other: 'Inne zagrożenie',
      };

      const hazardLabel = hazardLabels[type] || 'Zagrożenie';

      // Get geohash bounds for the radius
      const bounds = geohashQueryBounds([hazardLat, hazardLng], radiusInM);
      console.log(`🔍 Geohash bounds: ${bounds.length} queries`);

      // Query users within geohash bounds
      const usersInRadius = [];
      
      for (const bound of bounds) {
        const usersRef = db.collection('users');
        const q = usersRef
          .orderBy('lastLocation.geohash')
          .startAt(bound[0])
          .endAt(bound[1]);

        const snapshot = await q.get();
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          
          // Skip the user who reported the hazard
          if (doc.id === reportedBy) {
            return;
          }

          // Validate user has location and FCM token
          if (!userData.lastLocation?.lat || !userData.lastLocation?.lng) {
            return;
          }

          if (!userData.fcmToken) {
            console.log(`⚠️ User ${doc.id} has no FCM token`);
            return;
          }

          // Calculate actual distance
          const userLat = userData.lastLocation.lat;
          const userLng = userData.lastLocation.lng;
          const distanceKm = distanceBetween([hazardLat, hazardLng], [userLat, userLng]);

          // Only include if within radius (in km)
          if (distanceKm <= radiusInKm) {
            usersInRadius.push({
              uid: doc.id,
              fcmToken: userData.fcmToken,
              distance: distanceKm.toFixed(2),
            });
          }
        });
      }

      console.log(`👥 Found ${usersInRadius.length} users in ${radiusInKm}km radius`);

      if (usersInRadius.length === 0) {
        console.log('ℹ️ No users to notify');
        return null;
      }

      // Prepare notification payload
      const notificationTitle = '⚠️ OSTRZEŻENIE: Nowe zagrożenie w okolicy!';
      const notificationBody = `${hazardLabel} — sprawdź bezpieczną trasę w Paway! (${
        usersInRadius[0]?.distance || '?'
      }km od Ciebie)`;

      // Prepare messages for all users
      const messages = usersInRadius.map((user) => ({
        token: user.fcmToken,
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        data: {
          hazardId: hazardId,
          type: 'hazard_alert',
          hazardType: type,
          hazardLabel: hazardLabel,
          description: description || '',
          distance: user.distance.toString(),
          latitude: hazardLat.toString(),
          longitude: hazardLng.toString(),
          reporterName: reporterName || 'Anonymous',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'hazard_alerts',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
            visibility: 'public',
            color: '#FF7A6B', // Coral for hazards
            icon: 'ic_stat_notification',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1,
            },
          },
        },
      }));

      // Send notifications in batches of 500 (FCM limit)
      const batchSize = 500;
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        
        try {
          const response = await messaging.sendEach(batch);
          
          successCount += response.successCount;
          failureCount += response.failureCount;

          // Log failed tokens for debugging
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`❌ Failed to send to user ${usersInRadius[i + idx].uid}:`, resp.error);
              
              // TODO: Handle invalid tokens (remove from database)
              if (resp.error?.code === 'messaging/invalid-registration-token' ||
                  resp.error?.code === 'messaging/registration-token-not-registered') {
                console.log(`🗑️ Should remove invalid token for user ${usersInRadius[i + idx].uid}`);
              }
            }
          });
        } catch (error) {
          console.error('❌ Error sending batch:', error);
          failureCount += batch.length;
        }
      }

      console.log(`✅ Hazard notifications sent successfully: ${successCount}`);
      console.log(`❌ Hazard notifications failed: ${failureCount}`);

      // Update hazard with notification stats
      await db.collection('hazards').doc(hazardId).update({
        notificationsSent: successCount,
        notificationsFailed: failureCount,
        notificationsSentAt: new Date(),
      });

      return {
        success: true,
        sent: successCount,
        failed: failureCount,
        totalUsers: usersInRadius.length,
      };
    } catch (error) {
      console.error('❌ Error in sendHazardNotification:', error);
      throw error;
    }
  }
);


