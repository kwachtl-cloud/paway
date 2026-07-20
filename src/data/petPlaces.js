// Seed data for pet-friendly places in Wrocław

import { geohashForLocation } from 'geofire-common'

export const petPlacesSeedData = [
  {
    id: 'park_1',
    name: 'Wybieg dla psów - Park Szczytnicki',
    type: 'dog_park',
    description: 'Przestronny, ogrodzony wybieg w popularnym parku',
    location: {
      lat: 51.1143,
      lng: 17.0758,
      geohash: geohashForLocation([51.1143, 17.0758]),
      address: 'Park Szczytnicki, Wrocław'
    },
    amenities: ['fenced', 'large_area', 'water', 'waste_bags', 'seating'],
    hours: '6:00 - 22:00',
    rating: 4.7,
    photos: []
  },
  {
    id: 'park_2',
    name: 'Wybieg - Park Grabiszyński',
    type: 'dog_park',
    description: 'Nowoczesny wybieg z podziałem na strefy',
    location: {
      lat: 51.0892,
      lng: 16.9979,
      geohash: geohashForLocation([51.0892, 16.9979]),
      address: 'Park Grabiszyński, Wrocław'
    },
    amenities: ['fenced', 'separate_areas', 'agility', 'water', 'waste_bags', 'lighting'],
    hours: '24/7',
    rating: 4.8,
    photos: []
  },
  {
    id: 'park_3',
    name: 'Wybieg - Park Południowy',
    type: 'dog_park',
    description: 'Duży wybieg z torem przeszkód',
    location: {
      lat: 51.0845,
      lng: 17.0245,
      geohash: geohashForLocation([51.0845, 17.0245]),
      address: 'Park Południowy, Wrocław'
    },
    amenities: ['fenced', 'agility', 'water', 'waste_bags', 'parking'],
    hours: '24/7',
    rating: 4.6,
    photos: []
  },
  {
    id: 'park_4',
    name: 'Wybieg - Park Pilczyce',
    type: 'dog_park',
    description: 'Ogrodzony wybieg przy Odrze',
    location: {
      lat: 51.0945,
      lng: 17.0128,
      geohash: geohashForLocation([51.0945, 17.0128]),
      address: 'Park Pilczyce, Wrocław'
    },
    amenities: ['fenced', 'scenic', 'water', 'waste_bags'],
    hours: '6:00 - 22:00',
    rating: 4.5,
    photos: []
  },
  {
    id: 'park_5',
    name: 'Wybieg - Park Stanisławowski',
    type: 'dog_park',
    description: 'Wybieg w centrum miasta',
    location: {
      lat: 51.1078,
      lng: 17.0203,
      geohash: geohashForLocation([51.1078, 17.0203]),
      address: 'Park Stanisławowski, Wrocław'
    },
    amenities: ['fenced', 'water', 'waste_bags', 'seating'],
    hours: '24/7',
    rating: 4.4,
    photos: []
  },
  {
    id: 'clinic_1',
    name: 'Klinika Weterynaryjna 24h - VetHelp',
    type: 'vet_24h',
    description: 'Całodobowa pomoc weterynaryjna z izbą przyjęć',
    location: {
      lat: 51.1120,
      lng: 17.0450,
      geohash: geohashForLocation([51.1120, 17.0450]),
      address: 'ul. Kwidzyńska 6, Wrocław'
    },
    amenities: ['emergency', '24h', 'surgery', 'xray', 'pharmacy', 'parking'],
    hours: '24/7',
    phone: '+48 71 333 44 55',
    rating: 4.8,
    photos: []
  },
  {
    id: 'clinic_2',
    name: 'Przychodnia Wet24 Wrocław',
    type: 'vet_24h',
    description: 'Całodobowa klinika ze specjalistami',
    location: {
      lat: 51.0989,
      lng: 17.0315,
      geohash: geohashForLocation([51.0989, 17.0315]),
      address: 'ul. Powstańców Śląskich 123, Wrocław'
    },
    amenities: ['emergency', '24h', 'specialists', 'ultrasound', 'pharmacy'],
    hours: '24/7',
    phone: '+48 71 789 01 23',
    rating: 4.7,
    photos: []
  },
  {
    id: 'cafe_1',
    name: 'Psi Bufet - Pet Cafe',
    type: 'pet_cafe',
    description: 'Kawiarnia z menu dla psów i ogródkiem',
    location: {
      lat: 51.1095,
      lng: 17.0329,
      geohash: geohashForLocation([51.1095, 17.0329]),
      address: 'Rynek Wrocławski 38, Wrocław'
    },
    amenities: ['dog_menu', 'water_bowls', 'outdoor_seating', 'wifi', 'treats'],
    hours: '9:00 - 20:00',
    rating: 4.6,
    photos: []
  }
]

// Initialize pet places in localStorage
export function initializePetPlaces() {
  const existing = localStorage.getItem('paway_pet_places')
  
  if (!existing || existing === '[]') {
    localStorage.setItem('paway_pet_places', JSON.stringify(petPlacesSeedData))
    console.log('🌳 Initialized', petPlacesSeedData.length, 'pet-friendly places')
  }
}
