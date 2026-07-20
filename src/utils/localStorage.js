// LocalStorage utilities for Paway

// Get localStorage usage info
export function getStorageInfo() {
  const keys = Object.keys(localStorage)
  const info = {}
  let totalSize = 0
  
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    const size = new Blob([value]).size
    info[key] = {
      size,
      sizeKB: (size / 1024).toFixed(2),
      items: key.includes('paway_') ? JSON.parse(value || '[]').length : '-'
    }
    totalSize += size
  })
  
  return {
    keys: info,
    total: totalSize,
    totalKB: (totalSize / 1024).toFixed(2),
    totalMB: (totalSize / 1024 / 1024).toFixed(2),
    limit: '5-10 MB (browser dependent)'
  }
}

// Clean old SOS alerts (keep only last 10)
export function cleanOldAlerts() {
  try {
    const alerts = JSON.parse(localStorage.getItem('paway_sos_alerts') || '[]')
    
    // Keep only last 10 active alerts
    const sorted = alerts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
    
    localStorage.setItem('paway_sos_alerts', JSON.stringify(sorted))
    
    console.log('🧹 Cleaned old alerts, kept:', sorted.length)
    return sorted.length
  } catch (error) {
    console.error('Error cleaning alerts:', error)
    return 0
  }
}

// Debug: Log storage usage
export function logStorageUsage() {
  const info = getStorageInfo()
  console.log('💾 localStorage usage:')
  console.log(`  Total: ${info.totalKB} KB (${info.totalMB} MB)`)
  Object.keys(info.keys).forEach(key => {
    const keyInfo = info.keys[key]
    console.log(`  ${key}: ${keyInfo.sizeKB} KB${keyInfo.items !== '-' ? ` (${keyInfo.items} items)` : ''}`)
  })
}

// Initialize pet places
function initializePetPlacesData() {
  const existing = localStorage.getItem('paway_pet_places')
  
  if (!existing || existing === '[]') {
    // Lazy import to avoid circular dependency
    import('../data/petPlaces').then(module => {
      module.initializePetPlaces()
    })
  }
}

// Initialize sample pet if none exist (for easier testing)
function initializeSamplePet() {
  const existing = localStorage.getItem('paway_pets')
  
  if (!existing || existing === '[]') {
    const samplePet = {
      id: 'sample_pet_1',
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      age: '3 years',
      gender: 'male',
      weight: '30 kg',
      chipNumber: '123456789012345',
      medicalInfo: 'Vaccinated, no allergies',
      behaviorTags: ['friendly', 'energetic', 'playful'],
      photos: [],
      owner_uid: 'guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    localStorage.setItem('paway_pets', JSON.stringify([samplePet]))
    console.log('🐕 Initialized sample pet: Max')
  }
}

// Initialize - run on app start
export function initLocalStorage() {
  // Clean old alerts on startup
  cleanOldAlerts()
  
  // Initialize pet places seed data
  initializePetPlacesData()
  
  // Initialize sample pet for easier testing
  initializeSamplePet()
  
  // Log current usage
  if (import.meta.env.DEV) {
    logStorageUsage()
  }
}
