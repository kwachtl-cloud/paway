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
  const [testMessage, setTestMessage] = useState('Testing Pet Passport...')
  
  const handleTest = () => {
    setTestMessage('Button clicked! State works!')
    console.log('Pet Passport button clicked')
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack} style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}>← Back</button>
      <h1 style={{ color: '#6366f1', marginBottom: '20px' }}>📋 Pet Passport</h1>
      
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>{testMessage}</p>
      
      <button 
        onClick={handleTest}
        style={{
          padding: '15px',
          fontSize: '18px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px'
        }}
      >
        Test Button
      </button>
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
