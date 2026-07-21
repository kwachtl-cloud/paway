import { isNativePlatform, withTimeout } from '../utils/platform'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common'
import { auth, db, storage } from './firebase'

// === AUTH ===
export async function registerUser(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    name,
    role: 'owner',
    coins: 100,
    createdAt: serverTimestamp(),
  })
  return cred.user
}

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  return signOut(auth)
}

// === USERS ===
export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateUser(uid, data) {
  return updateDoc(doc(db, 'users', uid), data)
}

/**
 * Update user's FCM token for push notifications
 * @param {string} uid - User ID
 * @param {string} fcmToken - Firebase Cloud Messaging token
 */
export async function updateUserFCMToken(uid, fcmToken) {
  if (!fcmToken) {
    console.warn('No FCM token provided')
    return Promise.resolve()
  }

  try {
    return updateDoc(doc(db, 'users', uid), {
      fcmToken,
      fcmTokenUpdatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating FCM token:', error)
    // Don't fail silently - this is important for notifications
    throw error
  }
}

// === GEOLOCATION ===
export async function updateUserLocation(uid, lat, lng) {
  const hash = geohashForLocation([lat, lng])
  
  try {
    return updateDoc(doc(db, 'users', uid), {
      lastLocation: {
        lat,
        lng,
        geohash: hash,
        updatedAt: serverTimestamp(),
      }
    })
  } catch (error) {
    console.warn('Firebase unavailable for updateUserLocation, skipping:', error.message)
    // Silent fail for location updates in localStorage mode
    return Promise.resolve()
  }
}

export async function getUsersInRadius(centerLat, centerLng, radiusInKm = 5) {
  const radiusInM = radiusInKm * 1000
  const bounds = geohashQueryBounds([centerLat, centerLng], radiusInM)
  
  const promises = bounds.map((b) => {
    const q = query(
      collection(db, 'users'),
      orderBy('lastLocation.geohash'),
      where('lastLocation.geohash', '>=', b[0]),
      where('lastLocation.geohash', '<=', b[1])
    )
    return getDocs(q)
  })
  
  const snapshots = await Promise.all(promises)
  const matchingDocs = []
  
  for (const snap of snapshots) {
    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const loc = data.lastLocation
      
      if (!loc) continue
      
      const distanceInKm = distanceBetween([loc.lat, loc.lng], [centerLat, centerLng])
      const distanceInM = distanceInKm * 1000
      
      if (distanceInM <= radiusInM) {
        matchingDocs.push({ id: docSnap.id, ...data, distance: distanceInKm })
      }
    }
  }
  
  return matchingDocs
}

// === PETS ===
export async function addPet(ownerUid, petData) {
  const petId = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const pet = {
    id: petId,
    ...petData,
    owner_uid: ownerUid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // On mobile, save to localStorage immediately (instant)
  if (isNativePlatform()) {
    console.log('📱 Mobile: Saving pet to localStorage (instant)')
    const existingPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    existingPets.push(pet)
    localStorage.setItem('paway_pets', JSON.stringify(existingPets))
    return petId
  }
  
  // On web, try Firebase with timeout
  try {
    const docRef = await withTimeout(
      addDoc(collection(db, 'pets'), {
        ...petData,
        owner_uid: ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      3000,
      () => {
        // Fallback to localStorage
        const existingPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
        existingPets.push(pet)
        localStorage.setItem('paway_pets', JSON.stringify(existingPets))
        return { id: petId }
      }
    )
    return docRef.id
  } catch (error) {
    console.warn('Firebase unavailable, using localStorage:', error.message)
    const existingPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    existingPets.push(pet)
    localStorage.setItem('paway_pets', JSON.stringify(existingPets))
    return petId
  }
}

export async function getPets(ownerUid) {
  if (!ownerUid) return []
  
  // Read from localStorage for instant loading
  const getFromLocalStorage = () => {
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    return allPets
      .filter(p => p.owner_uid === ownerUid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  // On mobile, use localStorage as primary (instant loading)
  if (isNativePlatform()) {
    console.log('📱 Mobile: Loading pets from localStorage (instant)')
    return getFromLocalStorage()
  }
  
  // On web, try Firebase first with timeout
  try {
    const q = query(
      collection(db, 'pets'), 
      where('owner_uid', '==', ownerUid),
      orderBy('createdAt', 'desc')
    )
    const snap = await withTimeout(getDocs(q), 3000, getFromLocalStorage)
    return snap.docs ? snap.docs.map((d) => ({ id: d.id, ...d.data() })) : snap
  } catch (error) {
    console.warn('Firebase unavailable, using localStorage:', error.message)
    return getFromLocalStorage()
  }
}

export async function getPet(petId) {
  try {
    const snap = await getDoc(doc(db, 'pets', petId))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    console.warn('Firebase unavailable, using localStorage')
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    return allPets.find(p => p.id === petId) || null
  }
}

export async function updatePet(petId, data) {
  // On mobile, update localStorage immediately
  if (isNativePlatform()) {
    console.log('📱 Mobile: Updating pet in localStorage (instant)')
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    const index = allPets.findIndex(p => p.id === petId)
    if (index !== -1) {
      allPets[index] = {
        ...allPets[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem('paway_pets', JSON.stringify(allPets))
    }
    return
  }
  
  // On web, try Firebase with timeout
  try {
    await withTimeout(
      updateDoc(doc(db, 'pets', petId), {
        ...data,
        updatedAt: serverTimestamp(),
      }),
      3000,
      () => {
        // Fallback
        const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
        const index = allPets.findIndex(p => p.id === petId)
        if (index !== -1) {
          allPets[index] = { ...allPets[index], ...data, updatedAt: new Date().toISOString() }
          localStorage.setItem('paway_pets', JSON.stringify(allPets))
        }
      }
    )
  } catch (error) {
    console.warn('Firebase unavailable, using localStorage')
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    const index = allPets.findIndex(p => p.id === petId)
    if (index !== -1) {
      allPets[index] = { ...allPets[index], ...data, updatedAt: new Date().toISOString() }
      localStorage.setItem('paway_pets', JSON.stringify(allPets))
    }
  }
}

export async function deletePet(petId) {
  // On mobile, delete from localStorage immediately
  if (isNativePlatform()) {
    console.log('📱 Mobile: Deleting pet from localStorage (instant)')
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    const filtered = allPets.filter(p => p.id !== petId)
    localStorage.setItem('paway_pets', JSON.stringify(filtered))
    return
  }
  
  // On web, try Firebase with timeout
  try {
    await withTimeout(
      deleteDoc(doc(db, 'pets', petId)),
      3000,
      () => {
        // Fallback
        const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
        const filtered = allPets.filter(p => p.id !== petId)
        localStorage.setItem('paway_pets', JSON.stringify(filtered))
      }
    )
  } catch (error) {
    console.warn('Firebase unavailable, using localStorage')
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    const filtered = allPets.filter(p => p.id !== petId)
    localStorage.setItem('paway_pets', JSON.stringify(filtered))
  }
}

// === SERVICES / PROVIDERS ===
export async function getServices(type) {
  const q = query(collection(db, 'services'), where('type', '==', type))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const legacyIdMap = {
  '1': 'sitter1',
  '2': 'sitter2',
  '3': 'sitter3',
  '4': 'vet1',
  'groomer1': 'groomer1',
  'groomer2': 'groomer2',
  'sitter1': 'sitter1',
  'sitter2': 'sitter2',
  'sitter3': 'sitter3',
  'vet1': 'vet1',
  'vet2': 'vet2',
}

export async function getService(providerUid) {
  // Try direct ID first
  let snap = await getDoc(doc(db, 'services', providerUid))
  if (snap.exists()) return { id: snap.id, ...snap.data() }

  // Try legacy ID mapping
  const mappedId = legacyIdMap[providerUid]
  if (mappedId && mappedId !== providerUid) {
    snap = await getDoc(doc(db, 'services', mappedId))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
  }

  return null
}

export async function addService(providerUid, serviceData) {
  return setDoc(doc(db, 'services', providerUid), {
    ...serviceData,
    createdAt: serverTimestamp(),
  })
}

export async function updateService(providerUid, data) {
  return updateDoc(doc(db, 'services', providerUid), data)
}

// === BOOKINGS ===
export async function createBooking(bookingData) {
  return addDoc(collection(db, 'bookings'), {
    ...bookingData,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function getUserBookings(userUid) {
  const q = query(
    collection(db, 'bookings'),
    where('user_uid', '==', userUid)
  )
  const snap = await getDocs(q)
  // Sort manually until index is created
  const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return bookings.sort((a, b) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  })
}

export async function updateBookingStatus(bookingId, status) {
  return updateDoc(doc(db, 'bookings', bookingId), { status })
}

// === STORAGE ===
// Helper function to compress/resize image before converting to base64
function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Resize if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with compression
        canvas.toBlob(
          (blob) => {
            const compressedReader = new FileReader()
            compressedReader.onloadend = () => resolve(compressedReader.result)
            compressedReader.onerror = reject
            compressedReader.readAsDataURL(blob)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file, path) {
  try {
    console.log('🔄 Uploading image to Firebase Storage:', path)
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    console.log('✅ Firebase upload success:', url.substring(0, 50) + '...')
    return url
  } catch (error) {
    console.warn('⚠️ Firebase Storage unavailable, compressing and using base64:', error.message)
    // Fallback to compressed base64 data URL for local dev
    try {
      const compressed = await compressImage(file, 800, 0.7)
      console.log('✅ Image compressed to base64:', (compressed.length / 1024).toFixed(1) + ' KB')
      return compressed
    } catch (compressionError) {
      console.error('❌ Image compression failed:', compressionError)
      throw compressionError
    }
  }
}

export async function uploadPetPhoto(userId, petId, file, index = 0) {
  const fileName = `${petId}_${index}_${Date.now()}.jpg`
  const path = `users/${userId}/pets/${fileName}`
  return uploadImage(file, path)
}

export async function deletePetPhoto(photoUrl) {
  try {
    const photoRef = ref(storage, photoUrl)
    await deleteObject(photoRef)
    return true
  } catch (error) {
    console.error('Error deleting photo:', error)
    return false
  }
}

// === SOS ALERTS ===
export async function sendSOSAlert({ 
  userId, 
  userName, 
  petId,
  petName, 
  petPhoto,
  petBreed,
  lat, 
  lng,
  description,
  contactPhone,
  lastSeenTime
}) {
  console.log('🚨 sendSOSAlert called with:', { userId, petName, lat, lng })
  
  let hash
  try {
    hash = geohashForLocation([lat, lng])
    console.log('📍 Geohash calculated:', hash)
  } catch (geoError) {
    console.error('❌ Geohash error:', geoError)
    hash = 'unknown'
  }
  
  try {
    const alertRef = await addDoc(collection(db, 'sos_alerts'), {
      userId,
      userName,
      petId,
      petName,
      petPhoto: petPhoto || null,
      petBreed: petBreed || null,
      location: { 
        lat, 
        lng,
        geohash: hash 
      },
      description: description || '',
      contactPhone: contactPhone || '',
      lastSeenTime: lastSeenTime || null,
      status: 'active',
      createdAt: serverTimestamp(),
      notifiedUsers: [],
      viewedBy: [],
      reportedSightings: [],
    })

    console.log('✅ Firebase SOS alert sent:', alertRef.id)

    // Cloud Function will handle finding users and sending notifications
    return { 
      alertId: alertRef.id, 
      nearbyCount: 0, // Will be updated by Cloud Function
      nearbyUsers: []
    }
  } catch (error) {
    console.warn('Firebase unavailable, using localStorage for SOS alert:', error.message)
    
    // Fallback to localStorage
    const alertId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Don't store full base64 photo in localStorage (quota limit)
    // Store only small thumbnail or reference to pet
    let photoRef = null
    if (petPhoto && petPhoto.startsWith('data:')) {
      // Skip base64 photos in localStorage to save space
      photoRef = `pet:${petId}` // Reference to pet, will fetch photo from pets when displaying
    } else {
      photoRef = petPhoto // If it's a URL, keep it
    }
    
    const alert = {
      id: alertId,
      userId,
      userName,
      petId,
      petName,
      petPhoto: photoRef,
      petBreed: petBreed || null,
      location: { 
        lat, 
        lng,
        geohash: hash 
      },
      description: description || '',
      contactPhone: contactPhone || '',
      lastSeenTime: lastSeenTime || null,
      status: 'active',
      createdAt: new Date().toISOString(),
      notifiedUsers: [],
      viewedBy: [],
      reportedSightings: [],
      notifiedCount: 0
    }
    
    try {
      const existingAlerts = JSON.parse(localStorage.getItem('paway_sos_alerts') || '[]')
      existingAlerts.push(alert)
      localStorage.setItem('paway_sos_alerts', JSON.stringify(existingAlerts))
      console.log('✅ SOS alert saved to localStorage:', alertId)
    } catch (storageError) {
      console.error('❌ localStorage quota exceeded, clearing old alerts:', storageError)
      // Clear old alerts and try again
      localStorage.setItem('paway_sos_alerts', JSON.stringify([alert]))
      console.log('✅ SOS alert saved after clearing old data:', alertId)
    }
    
    return { 
      alertId: alertId, 
      nearbyCount: 0,
      nearbyUsers: [] 
    }
  }
}

export async function getActiveSOSAlerts(maxDistanceKm = 50) {
  const q = query(
    collection(db, 'sos_alerts'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)
  const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return alerts
}

export async function getSOSAlertsNearby(centerLat, centerLng, radiusInKm = 10) {
  try {
    const radiusInM = radiusInKm * 1000
    const bounds = geohashQueryBounds([centerLat, centerLng], radiusInM)
    
    const promises = bounds.map((b) => {
      const q = query(
        collection(db, 'sos_alerts'),
        where('status', '==', 'active'),
        orderBy('location.geohash'),
        where('location.geohash', '>=', b[0]),
        where('location.geohash', '<=', b[1])
      )
      return getDocs(q)
    })
    
    const snapshots = await Promise.all(promises)
    const matchingAlerts = []
    
    for (const snap of snapshots) {
      for (const docSnap of snap.docs) {
        const data = docSnap.data()
        const loc = data.location
        
        if (!loc) continue
        
        const distanceInKm = distanceBetween([loc.lat, loc.lng], [centerLat, centerLng])
        const distanceInM = distanceInKm * 1000
        
        if (distanceInM <= radiusInM) {
          matchingAlerts.push({ 
            id: docSnap.id, 
            ...data, 
            distance: distanceInKm 
          })
        }
      }
    }
    
    // Sort by creation time
    return matchingAlerts.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
  } catch (error) {
    console.warn('Firebase unavailable for getSOSAlertsNearby, using localStorage:', error.message)
    
    // Fallback to localStorage
    const allAlerts = JSON.parse(localStorage.getItem('paway_sos_alerts') || '[]')
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    
    // Helper to resolve pet photo from reference
    const resolvePhoto = (alert) => {
      if (!alert.petPhoto) return null
      
      // If photo is a reference like "pet:petId", fetch from pets
      if (alert.petPhoto.startsWith('pet:')) {
        const petId = alert.petPhoto.substring(4)
        const pet = allPets.find(p => p.id === petId)
        return pet?.photos?.[0] || null
      }
      
      return alert.petPhoto
    }
    
    // Filter by status and distance
    const matchingAlerts = allAlerts
      .filter(alert => alert.status === 'active')
      .map(alert => {
        if (!alert.location?.lat || !alert.location?.lng) return null
        
        const distanceInKm = distanceBetween(
          [alert.location.lat, alert.location.lng], 
          [centerLat, centerLng]
        )
        
        return {
          ...alert,
          petPhoto: resolvePhoto(alert), // Resolve photo reference
          distance: distanceInKm
        }
      })
      .filter(alert => alert && alert.distance <= radiusInKm)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return matchingAlerts
  }
}

export async function getSOSAlert(alertId) {
  try {
    const snap = await getDoc(doc(db, 'sos_alerts', alertId))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    console.warn('Firebase unavailable for getSOSAlert, using localStorage')
    
    const allAlerts = JSON.parse(localStorage.getItem('paway_sos_alerts') || '[]')
    const alert = allAlerts.find(a => a.id === alertId)
    
    if (!alert) return null
    
    // Resolve photo reference if needed
    if (alert.petPhoto?.startsWith('pet:')) {
      const petId = alert.petPhoto.substring(4)
      const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
      const pet = allPets.find(p => p.id === petId)
      alert.petPhoto = pet?.photos?.[0] || null
    }
    
    return alert
  }
}

export async function resolveSOSAlert(alertId) {
  return updateDoc(doc(db, 'sos_alerts', alertId), { 
    status: 'resolved', 
    resolvedAt: serverTimestamp() 
  })
}

export async function reportSighting(alertId, userId, userName, lat, lng, note) {
  const alertRef = doc(db, 'sos_alerts', alertId)
  const alert = await getDoc(alertRef)
  
  if (!alert.exists()) return false
  
  const sighting = {
    userId,
    userName,
    location: { lat, lng },
    note: note || '',
    reportedAt: new Date().toISOString()
  }
  
  const currentSightings = alert.data().reportedSightings || []
  
  await updateDoc(alertRef, {
    reportedSightings: [...currentSightings, sighting]
  })
  
  return true
}

export async function markAlertAsViewed(alertId, userId) {
  const alertRef = doc(db, 'sos_alerts', alertId)
  const alert = await getDoc(alertRef)
  
  if (!alert.exists()) return false
  
  const currentViewers = alert.data().viewedBy || []
  if (!currentViewers.includes(userId)) {
    await updateDoc(alertRef, {
      viewedBy: [...currentViewers, userId]
    })
  }
  
  return true
}

// === CONVERSATIONS ===
export async function createConversation(participantIds, participantDetails) {
  const ref = await addDoc(collection(db, 'conversations'), {
    participants: participantIds,
    participantDetails,
    lastMessage: null,
    unreadCount: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserConversations(userUid) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userUid)
  )
  const snap = await getDocs(q)
  const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return convs.sort((a, b) => {
    const aTime = a.updatedAt?.seconds || 0
    const bTime = b.updatedAt?.seconds || 0
    return bTime - aTime
  })
}

export async function getOrCreateConversation(currentUid, otherUid, otherDetails) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', currentUid)
  )
  const snap = await getDocs(q)
  const existing = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .find((c) => c.participants.includes(otherUid))
  if (existing) return existing.id
  return createConversation(
    [currentUid, otherUid],
    { [currentUid]: {}, [otherUid]: otherDetails }
  )
}

export function subscribeToConversation(conversationId, callback) {
  return onSnapshot(doc(db, 'conversations', conversationId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

export async function markConversationRead(conversationId, userUid) {
  return updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${userUid}`]: 0,
  })
}

// === MESSAGES ===
export async function sendMessage(conversationId, senderId, senderName, text) {
  const msgRef = await addDoc(
    collection(db, 'conversations', conversationId, 'messages'),
    {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
    }
  )
  const convRef = doc(db, 'conversations', conversationId)
  await updateDoc(convRef, {
    lastMessage: { text, senderId, timestamp: serverTimestamp() },
    updatedAt: serverTimestamp(),
  })
  const convSnap = await getDoc(convRef)
  if (convSnap.exists()) {
    const conv = convSnap.data()
    const otherParticipants = (conv.participants || []).filter((id) => id !== senderId)
    const updates = {}
    otherParticipants.forEach((id) => {
      updates[`unreadCount.${id}`] = increment(1)
    })
    if (Object.keys(updates).length > 0) {
      await updateDoc(convRef, updates)
    }
  }
  return msgRef.id
}

export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(100)
  )
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(msgs)
  })
}

export async function getUserProfile(uid) {
  if (!uid) return null
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) return snap.data()
  const svcSnap = await getDoc(doc(db, 'services', uid))
  if (svcSnap.exists()) {
    const data = svcSnap.data()
    return { name: data.name, image: data.image, role: data.type || 'provider' }
  }
  return null
}

// === NEARBY DOGS ===
export async function getNearbyDogs() {
  const q = query(collection(db, 'nearby_dogs'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// === PET PLACES (Parks, Clinics, Pet-friendly locations) ===

export async function getPetPlaces(centerLat, centerLng, radiusInKm = 10) {
  const allPlaces = JSON.parse(localStorage.getItem('paway_pet_places') || '[]')
  
  // If no location provided, return all places
  if (centerLat === undefined || centerLng === undefined) {
    console.log('📍 No location, returning all', allPlaces.length, 'places')
    return allPlaces
  }
  
  return allPlaces
    .map(place => {
      if (!place.location?.lat || !place.location?.lng) return null
      const distanceInKm = distanceBetween([place.location.lat, place.location.lng], [centerLat, centerLng])
      return { ...place, distance: distanceInKm }
    })
    .filter(place => place && place.distance <= radiusInKm)
    .sort((a, b) => a.distance - b.distance)
}

export async function getPlace(placeId) {
  const allPlaces = JSON.parse(localStorage.getItem('paway_pet_places') || '[]')
  return allPlaces.find(p => p.id === placeId) || null
}

export async function checkInToPark(userId, userName, petId, petName, petPhoto, placeId, placeName, lat, lng, durationHours = 2) {
  const hash = geohashForLocation([lat, lng])
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)
  const checkinId = `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const photoRef = (petPhoto && petPhoto.startsWith('data:')) ? `pet:${petId}` : petPhoto
  
  const checkin = {
    id: checkinId, userId, userName, petId, petName,
    petPhoto: photoRef, placeId, placeName,
    location: { lat, lng, geohash: hash },
    checkedInAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    active: true,
  }
  
  const existingCheckins = JSON.parse(localStorage.getItem('paway_park_checkins') || '[]')
  existingCheckins.push(checkin)
  localStorage.setItem('paway_park_checkins', JSON.stringify(existingCheckins))
  
  // Broadcast change for real-time sync
  window.dispatchEvent(new CustomEvent('parkCheckinsUpdated', { detail: { placeId } }))
  
  return { checkinId, expiresAt: expiresAt.toISOString() }
}

export async function getActiveCheckinsForPlace(placeId) {
  const now = new Date().toISOString()
  const allCheckins = JSON.parse(localStorage.getItem('paway_park_checkins') || '[]')
  const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
  
  const resolvePhoto = (checkin) => {
    if (!checkin.petPhoto) return null
    if (checkin.petPhoto.startsWith('pet:')) {
      const petId = checkin.petPhoto.substring(4)
      const pet = allPets.find(p => p.id === petId)
      return pet?.photos?.[0] || null
    }
    return checkin.petPhoto
  }
  
  return allCheckins
    .filter(c => c.placeId === placeId && c.active && c.expiresAt > now)
    .map(c => ({ ...c, petPhoto: resolvePhoto(c) }))
    .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
}

export async function getPetById(petId) {
  const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
  return allPets.find(p => p.id === petId) || null
}