const admin = require('firebase-admin');
const serviceAccount = require('./paway-d9573-firebase-adminsdk-r92zn-edb0e8f9f1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkFCMTokens() {
  console.log('\n🔍 Sprawdzam FCM tokeny użytkowników...\n');
  
  const usersSnapshot = await db.collection('users').get();
  
  console.log('📱 Użytkownicy i FCM Tokeny:\n');
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`User: ${data.email || doc.id}`);
    console.log(`  FCM Token: ${data.fcmToken ? '✅ ' + data.fcmToken.substring(0, 50) + '...' : '❌ BRAK'}`);
    console.log(`  Location: ${data.lastLocation ? `✅ [${data.lastLocation.lat}, ${data.lastLocation.lng}]` : '❌ BRAK'}`);
    console.log(`  Geohash: ${data.lastLocation?.geohash || '❌ BRAK'}`);
    console.log('');
  });
  
  console.log('\n🚨 Sprawdzam ostatnie SOS Alerty...\n');
  
  const alertsSnapshot = await db.collection('sos_alerts')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();
  
  console.log(`Znaleziono ${alertsSnapshot.size} alertów:\n`);
  alertsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Alert ID: ${doc.id}`);
    console.log(`  Pet: ${data.petName}`);
    console.log(`  Owner: ${data.userId}`);
    console.log(`  Location: [${data.location.lat}, ${data.location.lng}]`);
    console.log(`  Geohash: ${data.location.geohash}`);
    console.log(`  Created: ${data.createdAt?.toDate()}`);
    console.log(`  Notifications Sent: ${data.notificationsSent || 0}`);
    console.log(`  Notifications Failed: ${data.notificationsFailed || 0}`);
    console.log('');
  });
  
  process.exit(0);
}

checkFCMTokens().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
