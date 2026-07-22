// Quick test script for Firebase registration
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyC9zf8oO-stZFGmPUA8noKF3bsLvQr2yaI",
  authDomain: "paway-d9573.firebaseapp.com",
  projectId: "paway-d9573",
  storageBucket: "paway-d9573.firebasestorage.app",
  messagingSenderId: "647433414021",
  appId: "1:647433414021:web:744a61385afb609f3450ec"
}

console.log('🔥 Initializing Firebase...')
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

console.log('📧 Attempting to register test user...')
const testEmail = `test-${Date.now()}@paway.app`
const testPassword = 'test123456'

createUserWithEmailAndPassword(auth, testEmail, testPassword)
  .then((cred) => {
    console.log('✅ Registration successful!')
    console.log('User ID:', cred.user.uid)
    console.log('Email:', cred.user.email)
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Registration failed!')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    process.exit(1)
  })
