import { useState, useEffect } from 'react'
import { useApp } from './context/AppContext'

function WelcomeScreen() {
  const { navigate, setUser } = useApp()

  const handleStart = () => {
    setUser({ uid: 'guest', name: 'Guest User' })
    navigate('home')
  }

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #6366f1, #8b5cf6)'
    }}>
      <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '20px' }}>🐾 Paway</h1>
      <p style={{ color: 'white', fontSize: '18px', marginBottom: '40px' }}>Pet Super-App</p>
      <button 
        onClick={handleStart}
        style={{
          padding: '15px 30px',
          fontSize: '20px',
          background: 'white',
          color: '#6366f1',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Start
      </button>
    </div>
  )
}

function HomeScreen() {
  const { navigate } = useApp()

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#6366f1', marginBottom: '20px' }}>🏠 Home</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={() => navigate('sos')}
          style={{
            padding: '15px',
            fontSize: '18px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          🚨 SOS
        </button>
        <button 
          onClick={() => navigate('park-radar')}
          style={{
            padding: '15px',
            fontSize: '18px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          🗺️ Park Radar
        </button>
        <button 
          onClick={() => navigate('pet-passport')}
          style={{
            padding: '15px',
            fontSize: '18px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          📋 Pet Passport
        </button>
      </div>
    </div>
  )
}

function SOSScreen() {
  const { goBack } = useApp()
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack} style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}>← Back</button>
      <h1 style={{ color: '#ef4444' }}>🚨 SOS Screen</h1>
      <p>SOS functionality will be added here</p>
    </div>
  )
}

function ParkRadarScreen() {
  const { goBack } = useApp()
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack} style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}>← Back</button>
      <h1 style={{ color: '#10b981' }}>🗺️ Park Radar Screen</h1>
      <p>Park Radar functionality will be added here</p>
    </div>
  )
}

function PetPassportScreen() {
  const { goBack } = useApp()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    console.log('📋 Pet Passport mounting...')
    
    // Give it a moment to settle
    setTimeout(() => {
      try {
        console.log('📋 Attempting to read localStorage...')
        const stored = localStorage.getItem('paway_pets')
        console.log('📋 localStorage read result:', stored ? 'found' : 'empty')
        
        if (stored) {
          const petsData = JSON.parse(stored)
          console.log('📋 Parsed pets:', petsData.length)
          setPets(petsData)
        } else {
          console.log('📋 No pets found, creating sample pet...')
          const samplePet = {
            id: 'sample_1',
            name: 'Max',
            species: 'dog',
            breed: 'Golden Retriever',
            age: '3 years'
          }
          localStorage.setItem('paway_pets', JSON.stringify([samplePet]))
          setPets([samplePet])
          console.log('📋 Sample pet created')
        }
      } catch (error) {
        console.error('📋 Error in Pet Passport:', error)
        setPets([])
      } finally {
        setLoading(false)
      }
    }, 100)
  }, [])
  
  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={goBack} style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}>← Back</button>
        <h1 style={{ color: '#6366f1', marginBottom: '20px' }}>📋 Pet Passport</h1>
        <p>Loading...</p>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack} style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}>← Back</button>
      <h1 style={{ color: '#6366f1', marginBottom: '20px' }}>📋 Pet Passport</h1>
      
      {pets.length === 0 ? (
        <p style={{ color: '#666' }}>No pets found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pets.map(pet => (
            <div key={pet.id} style={{
              padding: '15px',
              background: 'white',
              border: '2px solid #6366f1',
              borderRadius: '12px'
            }}>
              <h3 style={{ color: '#6366f1', margin: '0 0 10px 0' }}>{pet.name}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Species:</strong> {pet.species}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Breed:</strong> {pet.breed}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Age:</strong> {pet.age}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const { currentScreen, user } = useApp()

  console.log('App render, currentScreen:', currentScreen, 'user:', !!user)

  if (!user) {
    return <WelcomeScreen />
  }

  const screens = {
    'home': <HomeScreen />,
    'sos': <SOSScreen />,
    'park-radar': <ParkRadarScreen />,
    'pet-passport': <PetPassportScreen />,
  }

  return screens[currentScreen] || <HomeScreen />
}

export default App
