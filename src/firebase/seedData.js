import { db } from './firebase'
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'

// Dane do dodania
const services = [
  // Groomers
  {
    id: 'groomer1',
    name: 'Marek',
    type: 'groomer',
    rating: 4.8,
    reviews: 89,
    price: 35,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    location: { address: 'Warszawa, Mokotów', lat: 52.21, lng: 21.02 },
    tags: ['All breeds', 'Gentle handling', 'Mobile service'],
    description: {
      pl: 'Profesjonalny groomer z dojazdem. Komfort Twojego pupila jest dla mnie priorytetem.',
      en: 'Professional groomer with mobile service. Your pet comfort is my priority.',
      de: 'Professioneller Hundefriseur mit mobilem Service.'
    }
  },
  {
    id: 'groomer2',
    name: 'Kasia',
    type: 'groomer',
    rating: 4.9,
    reviews: 124,
    price: 40,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    location: { address: 'Kraków, Stare Miasto', lat: 50.06, lng: 19.94 },
    tags: ['Small breeds', 'Creative grooming', 'Spa treatments'],
    description: {
      pl: 'Kreatywna groomerka z 8-letnim doświadczeniem. Specjalizuję się w małych rasach.',
      en: 'Creative groomer with 8 years of experience. Specializing in small breeds.',
      de: 'Kreative Groomerin mit 8 Jahren Erfahrung.'
    }
  },
  // Sitters
  {
    id: 'sitter1',
    name: 'Olivia',
    type: 'sitter',
    rating: 5.0,
    reviews: 48,
    price: 25,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    location: { address: 'Warsaw, Poland', lat: 52.23, lng: 21.01 },
    tags: ['Dog lover', 'Cat friendly', 'Home with yard'],
    description: {
      pl: 'Cześć! Jestem Olivia, prawdziwa miłośniczka zwierząt z 6-letnim doświadczeniem w opiece nad psami i kotami.',
      en: 'Hi! I\'m Olivia, a true animal lover with 6 years of experience caring for dogs and cats.',
      de: 'Hi! Ich bin Olivia, eine echte Tierliebhaberin mit 6 Jahren Erfahrung.'
    }
  },
  {
    id: 'sitter2',
    name: 'Daniel',
    type: 'sitter',
    rating: 5.0,
    reviews: 32,
    price: 20,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    location: { address: 'Kraków, Poland', lat: 50.08, lng: 20.01 },
    tags: ['Dog lover', 'Active', 'Garden access'],
    description: {
      pl: 'Profesjonalny opiekun zwierząt z doświadczeniem we wszystkich rasach. Uwielbiam aktywny wypoczynek z psami.',
      en: 'Professional pet sitter with experience in all breeds. I love outdoor activities with dogs.',
      de: 'Professioneller Tierbetreuer mit Erfahrung in allen Rassen.'
    }
  },
  {
    id: 'sitter3',
    name: 'Anna',
    type: 'sitter',
    rating: 4.9,
    reviews: 67,
    price: 22,
    image: 'https://images.unsplash.com/photo-1544005313-94f3aca71e2d?w=300&h=300&fit=crop',
    location: { address: 'Gdańsk, Wrzeszcz', lat: 54.37, lng: 18.61 },
    tags: ['Cat specialist', 'Senior pets', 'Medication admin'],
    description: {
      pl: 'Specjalizuję się w opiece nad kotami i starszymi psami. Mogę podawać leki.',
      en: 'Specializing in cats and senior dogs. Can administer medication.',
      de: 'Spezialisiert auf Katzen und Seniorenhunde. Kann Medikamente verabreichen.'
    }
  },
  // Vets
  {
    id: 'vet1',
    name: 'Dr. Ewa',
    type: 'vet',
    rating: 5.0,
    reviews: 203,
    price: 50,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    location: { address: 'Gdańsk, Wrzeszcz', lat: 54.36, lng: 18.63 },
    tags: ['Emergency care', 'Surgery', 'Exotic animals'],
    description: {
      pl: 'Lekarz weterynarii z 10-letnim doświadczeniem. Przyjmuję również zwierzęta egzotyczne.',
      en: 'Veterinarian with 10 years of experience. Also treating exotic animals.',
      de: 'Tierärztin mit 10 Jahren Erfahrung.'
    }
  },
  {
    id: 'vet2',
    name: 'Dr. Jan',
    type: 'vet',
    rating: 4.9,
    reviews: 156,
    price: 45,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    location: { address: 'Warszawa, Żoliborz', lat: 52.26, lng: 20.99 },
    tags: ['Dermatology', 'Allergies', 'Nutrition'],
    description: {
      pl: 'Specjalista dermatologii weterynaryjnej. Pomagam przy alergiach i problemach skórnych.',
      en: 'Veterinary dermatology specialist. Helping with allergies and skin issues.',
      de: 'Spezialist für veterinärmedizinische Dermatologie.'
    }
  }
]

const pets = [
  {
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    weight: 32,
    medicalInfo: 'No allergies, vaccinations up to date',
    noseIdHash: 'a3f5c8d9e2b1',
    owner_uid: 'sitter1' // temporary
  },
  {
    name: 'Whiskers',
    species: 'Cat',
    breed: 'British Shorthair',
    weight: 5,
    medicalInfo: 'Chicken allergy',
    noseIdHash: 'b7e2f1c4d8a3',
    owner_uid: 'sitter1' // temporary
  },
  {
    name: 'Luna',
    species: 'Dog',
    breed: 'Border Collie',
    weight: 18,
    medicalInfo: 'Healthy, very active',
    noseIdHash: 'c8d3e2f5a1b9',
    owner_uid: 'sitter2' // temporary
  }
]

const nearbyDogs = [
  {
    name: 'Max',
    breed: 'Golden Retriever',
    mood: 'play',
    distance: 120,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop',
    lat: 52.235,
    lng: 21.015
  },
  {
    name: 'Luna',
    breed: 'Border Collie',
    mood: 'quiet',
    distance: 250,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&h=100&fit=crop',
    lat: 52.24,
    lng: 21.03
  },
  {
    name: 'Charlie',
    breed: 'Beagle',
    mood: 'play',
    distance: 340,
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11c01b1f?w=100&h=100&fit=crop',
    lat: 52.22,
    lng: 20.99
  }
]

async function seedDatabase() {
  console.log('Starting to seed database...')
  
  // Add services/providers
  for (const service of services) {
    try {
      await setDoc(doc(db, 'services', service.id), {
        ...service,
        createdAt: serverTimestamp()
      })
      console.log(`Added service: ${service.name}`)
    } catch (err) {
      console.error(`Error adding ${service.name}:`, err)
    }
  }
  
  // Add pets
  for (const pet of pets) {
    try {
      const docRef = await addDoc(collection(db, 'pets'), {
        ...pet,
        createdAt: serverTimestamp()
      })
      console.log(`Added pet: ${pet.name} with ID: ${docRef.id}`)
    } catch (err) {
      console.error(`Error adding pet ${pet.name}:`, err)
    }
  }
  
  // Add nearby dogs (these could go to a separate collection or be stored differently)
  // For now, we'll add them to a 'nearby_dogs' collection
  for (const dog of nearbyDogs) {
    try {
      const docRef = await addDoc(collection(db, 'nearby_dogs'), {
        ...dog,
        createdAt: serverTimestamp()
      })
      console.log(`Added nearby dog: ${dog.name} with ID: ${docRef.id}`)
    } catch (err) {
      console.error(`Error adding dog ${dog.name}:`, err)
    }
  }
  
  console.log('Database seeding completed!')
}

// Run the seeding
seedDatabase()

export { seedDatabase }
