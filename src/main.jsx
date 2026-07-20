import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontSize: '24px', 
      fontWeight: 'bold',
      color: '#6366f1'
    }}>
      <h1>Paway Test</h1>
      <p>If you see this, React is working!</p>
      <button 
        onClick={() => alert('Button works!')}
        style={{
          padding: '10px 20px',
          fontSize: '18px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        Test Button
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
