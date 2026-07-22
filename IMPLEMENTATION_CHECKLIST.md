# 🔥 PAWAY AUTH IMPLEMENTATION - STEP-BY-STEP CHECKLIST
## Tomorrow Morning Batch Session - File-by-File Guide

**Estimated Total Time:** 2-3 hours  
**Order:** Follow steps sequentially  
**Status:** Ready to execute

---

## ⚡ QUICK START (5 minutes)

### Pre-Implementation Setup
- [ ] 1.1 - Open VS Code
- [ ] 1.2 - Click "Allow" on Copilot prompt
- [ ] 1.3 - Read this file completely
- [ ] 1.4 - Ensure Firebase console ready
- [ ] 1.5 - Coffee ready ☕

---

## 📦 PHASE 1: FIREBASE SETUP (15 minutes)

### Step 1.1 - Enable Firebase Auth Methods
**File:** Firebase Console (manual)
```
1. Go to: https://console.firebase.google.com/project/paway-d9573/authentication
2. Click "Sign-in method" tab
3. Enable "Email/Password" provider
4. (Optional) Enable "Google" provider
5. Save changes
```
**Verification:** Auth providers show "Enabled" status

### Step 1.2 - Update Firestore Security Rules
**File:** `firestore.rules` (CREATE NEW)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User's pets subcollection
    match /users/{userId}/pets/{petId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // SOS Alerts
    match /sos_alerts/{alertId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['viewedBy', 'reportedSightings'])
      );
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read, create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```
**Deploy:** `firebase deploy --only firestore:rules`

---

## 🔧 PHASE 2: CORE AUTH SERVICES (30 minutes)

### Step 2.1 - Add User Profile Functions to services.js
**File:** `src/firebase/services.js`
**Location:** After AUTH section (around line 50)

```javascript
// === USER PROFILES ===
export async function createUserProfile(uid, data) {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    uid,
    email: data.email,
    name: data.name,
    photoURL: data.photoURL || null,
    fcmToken: null,
    lastLocation: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      language: 'en',
      notifications: true,
    }
  })
  return uid
}

export async function getUserProfile(uid) {
  if (!uid) return null
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export async function updateUserProfile(uid, updates) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteUserAccount(uid) {
  // Delete user's pets
  const petsSnap = await getDocs(collection(db, 'users', uid, 'pets'))
  const petDeletes = petsSnap.docs.map(d => deleteDoc(d.ref))
  await Promise.all(petDeletes)
  
  // Delete user's SOS alerts
  const alertsQ = query(collection(db, 'sos_alerts'), where('userId', '==', uid))
  const alertsSnap = await getDocs(alertsQ)
  const alertDeletes = alertsSnap.docs.map(d => deleteDoc(d.ref))
  await Promise.all(alertDeletes)
  
  // Delete user document
  await deleteDoc(doc(db, 'users', uid))
}
```

### Step 2.2 - Update Auth Functions
**File:** `src/firebase/services.js`
**Location:** Modify existing registerUser function (around line 30)

```javascript
// REPLACE EXISTING registerUser function
export async function registerUser(email, password, name) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update display name
    await updateProfile(user, { displayName: name })
    
    // Create Firestore user profile
    await createUserProfile(user.uid, {
      email,
      name,
      photoURL: null
    })
    
    return user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}
```

### Step 2.3 - Update getPets to Use User UID
**File:** `src/firebase/services.js`
**Location:** Find getPets function (around line 200)

```javascript
// REPLACE EXISTING getPets function
export async function getPets(userId) {
  if (!userId) {
    console.warn('getPets called without userId')
    return []
  }
  
  try {
    const petsSnap = await getDocs(collection(db, 'users', userId, 'pets'))
    return petsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.warn('Firebase unavailable for getPets, using localStorage:', error.message)
    
    // Fallback to localStorage
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    return allPets.filter(pet => pet.ownerId === userId)
  }
}
```

### Step 2.4 - Update addPet to Use User UID
**File:** `src/firebase/services.js`
**Location:** Find addPet function (around line 230)

```javascript
// REPLACE EXISTING addPet function
export async function addPet(userId, petData) {
  if (!userId) throw new Error('userId required to add pet')
  
  try {
    const petRef = await addDoc(collection(db, 'users', userId, 'pets'), {
      ...petData,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return petRef.id
  } catch (error) {
    console.warn('Firebase unavailable for addPet, using localStorage:', error.message)
    
    // Fallback to localStorage
    const allPets = JSON.parse(localStorage.getItem('paway_pets') || '[]')
    const newPet = {
      id: Date.now().toString(),
      ...petData,
      ownerId: userId,
      createdAt: new Date().toISOString()
    }
    allPets.push(newPet)
    localStorage.setItem('paway_pets', JSON.stringify(allPets))
    return newPet.id
  }
}
```

### Step 2.5 - Update updatePet and deletePet
**File:** `src/firebase/services.js`

```javascript
// UPDATE updatePet - add userId parameter
export async function updatePet(userId, petId, updates) {
  if (!userId) throw new Error('userId required')
  return updateDoc(doc(db, 'users', userId, 'pets', petId), {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

// UPDATE deletePet - add userId parameter
export async function deletePet(userId, petId) {
  if (!userId) throw new Error('userId required')
  return deleteDoc(doc(db, 'users', userId, 'pets', petId))
}
```

---

## 🎨 PHASE 3: AUTH UI SCREENS (45 minutes)

### Step 3.1 - Create WelcomeScreen
**File:** `src/screens/WelcomeScreen.jsx` (CREATE NEW)

```jsx
import { PawPrint, Heart, MapPin, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function WelcomeScreen() {
  const { navigate } = useApp()

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-primary/10 to-background">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="mb-8 bg-primary rounded-full p-6">
          <PawPrint size={64} className="text-white" />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Welcome to Paway
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Your pet's digital companion
        </p>
        
        {/* Features */}
        <div className="w-full max-w-md space-y-4 mb-12">
          <div className="flex items-center gap-4 bg-card p-4 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-full">
              <Heart className="text-primary" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Pet Passport</h3>
              <p className="text-sm text-muted-foreground">Manage your pet's profile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-card p-4 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-full">
              <MapPin className="text-primary" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Find Lost Pets</h3>
              <p className="text-sm text-muted-foreground">SOS alerts for nearby pets</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-card p-4 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="text-primary" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Safe & Secure</h3>
              <p className="text-sm text-muted-foreground">Your data is protected</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <button
          onClick={() => navigate('register')}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg active:scale-95 transition-transform"
        >
          Get Started
        </button>
        
        <button
          onClick={() => navigate('login')}
          className="w-full py-4 bg-card border-2 border-primary text-primary rounded-xl font-semibold text-lg active:scale-95 transition-transform"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  )
}
```

### Step 3.2 - Create LoginScreen
**File:** `src/screens/LoginScreen.jsx` (CREATE NEW)

```jsx
import { useState } from 'react'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebase'

export default function LoginScreen() {
  const { navigate } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // AppContext will handle navigation after auth state changes
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border">
        <button onClick={() => navigate('welcome')} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-10">Login</h1>
      </div>
      
      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-muted-foreground mb-8">Login to continue</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary font-medium"
              onClick={() => {/* TODO: Implement forgot password */}}
            >
              Forgot Password?
            </button>
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('register')}
              className="text-primary font-semibold"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Step 3.3 - Create RegisterScreen
**File:** `src/screens/RegisterScreen.jsx` (CREATE NEW)

```jsx
import { useState } from 'react'
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { registerUser } from '../firebase/services'

export default function RegisterScreen() {
  const { navigate } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = () => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 6) return { strength: 1, text: 'Weak', color: 'bg-red-500' }
    if (password.length < 10) return { strength: 2, text: 'Medium', color: 'bg-yellow-500' }
    return { strength: 3, text: 'Strong', color: 'bg-green-500' }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!agreeToTerms) {
      setError('Please accept the terms and conditions')
      return
    }
    
    setLoading(true)
    try {
      await registerUser(email, password, name)
      // AppContext will handle navigation after auth state changes
    } catch (err) {
      console.error('Registration error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength()

  return (
    <div className="flex flex-col h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <button onClick={() => navigate('welcome')} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-10">Register</h1>
      </div>
      
      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-muted-foreground mb-8">Join Paway community</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength */}
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.strength / 3) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{strength.text}</span>
              </div>
            )}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                disabled={loading}
              />
              {confirmPassword && password === confirmPassword && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
          </div>
          
          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1"
              disabled={loading}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <button type="button" className="text-primary font-medium">
                Terms & Conditions
              </button>
              {' '}and{' '}
              <button type="button" className="text-primary font-medium">
                Privacy Policy
              </button>
            </label>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        {/* Login Link */}
        <div className="mt-6 text-center pb-8">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="text-primary font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔒 PHASE 4: ROUTE PROTECTION (20 minutes)

### Step 4.1 - Update AppContext with Auth State
**File:** `src/context/AppContext.jsx`
**Location:** Enhance existing user state management

```javascript
// ADD these imports at top
import { getUserProfile } from '../firebase/services'

// MODIFY useEffect for auth state (around line 25)
useEffect(() => {
  let unsubscribe

  try {
    import('../firebase/firebase').then(({ auth }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('🔑 Firebase user authenticated:', firebaseUser.uid)
            
            // Fetch full user profile from Firestore
            const profile = await getUserProfile(firebaseUser.uid)
            
            setUser({
              uid: firebaseUser.uid,
              name: profile?.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              photoURL: profile?.photoURL || firebaseUser.photoURL || null,
              ...profile
            })
            
            // Navigate to home if on auth screens
            if (['welcome', 'login', 'register'].includes(currentScreen)) {
              setCurrentScreen('home')
            }
          } else {
            console.log('🔑 No Firebase user')
            setUser(null)
            
            // Navigate to welcome if not on auth screens
            if (!['welcome', 'login', 'register'].includes(currentScreen)) {
              setCurrentScreen('welcome')
            }
          }
        })
      }).catch(err => {
        console.warn('⚠️ Firebase auth import failed:', err)
      })
    }).catch(err => {
      console.warn('⚠️ Firebase import failed:', err)
    })
  } catch (error) {
    console.error('Auth setup error:', error)
  }

  return () => {
    if (unsubscribe) unsubscribe()
  }
}, [])
```

### Step 4.2 - Update navigate function for protection
**File:** `src/context/AppContext.jsx`
**Location:** navigate function (around line 70)

```javascript
// UPDATE navigate function
const navigate = useCallback((screen, params = {}) => {
  console.log('🧭 Navigating to:', screen, params)
  
  // Protected screens require auth
  const protectedScreens = [
    'home', 'pet-passport', 'park-radar', 'sos', 'messages', 
    'profile', 'bookings', 'tracker', 'services', 'category',
    'booking', 'booking-detail', 'chat', 'provider-profile',
    'sos-detail', 'notifications', 'saved', 'search'
  ]
  
  if (protectedScreens.includes(screen) && !user) {
    console.log('🔒 Screen requires auth, redirecting to login')
    setCurrentScreen('login')
    return
  }
  
  setCurrentScreen(screen)
  if (Object.keys(params).length > 0) {
    setScreenParams(params)
  }
}, [user])
```

---

## 🎯 PHASE 5: UPDATE EXISTING SCREENS (40 minutes)

### Step 5.1 - Update HomeScreen
**File:** `src/screens/HomeScreen.jsx`
**Location:** Top of component

```javascript
// ADD user greeting and avatar
// Replace existing header section (around line 90)

<div className="bg-primary text-white p-6 rounded-b-3xl">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      {/* User Avatar */}
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User size={24} className="text-white" />
        )}
      </div>
      
      {/* User Greeting */}
      <div>
        <p className="text-sm text-white/80">Welcome back,</p>
        <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
      </div>
    </div>
    
    {/* Existing icons */}
    <div className="flex gap-2">
      <button onClick={() => navigate('notifications')} className="relative p-2 bg-white/10 rounded-full">
        <Bell size={20} />
      </button>
      <button onClick={() => navigate('profile')} className="p-2 bg-white/10 rounded-full">
        <Menu size={20} />
      </button>
    </div>
  </div>
  
  {/* Rest of header content... */}
</div>
```

### Step 5.2 - Update PetPassportScreen
**File:** `src/screens/PetPassportScreen.jsx`
**Location:** useEffect for loading pets

```javascript
// UPDATE useEffect to use user.uid
useEffect(() => {
  if (user?.uid) {
    getPets(user.uid).then(userPets => {
      setPets(userPets)
      if (userPets.length > 0 && !selectedPet) {
        setSelectedPet(userPets[0])
      }
    }).catch(err => {
      console.error('Error loading pets:', err)
    })
  }
}, [user])

// UPDATE handleAddPet function
const handleAddPet = async (petData) => {
  if (!user?.uid) {
    alert('Please login to add pets')
    return
  }
  
  try {
    const petId = await addPet(user.uid, petData)
    const newPets = await getPets(user.uid)
    setPets(newPets)
    const newPet = newPets.find(p => p.id === petId)
    if (newPet) setSelectedPet(newPet)
  } catch (error) {
    console.error('Error adding pet:', error)
    alert('Failed to add pet. Please try again.')
  }
}
```

### Step 5.3 - Update ProfileScreen
**File:** `src/screens/ProfileScreen.jsx`
**Location:** Add logout button and user info

```javascript
// ADD at top of file
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/firebase'

// ADD inside component
const handleLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await signOut(auth)
      navigate('welcome')
    } catch (error) {
      console.error('Logout error:', error)
      alert('Logout failed. Please try again.')
    }
  }
}

// ADD user profile section at top of screen (before menu items)
<div className="bg-card p-6 rounded-2xl mb-6">
  <div className="flex items-center gap-4 mb-4">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
      {user?.photoURL ? (
        <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <User size={32} className="text-primary" />
      )}
    </div>
    <div>
      <h3 className="font-bold text-lg">{user?.name || 'User'}</h3>
      <p className="text-sm text-muted-foreground">{user?.email}</p>
    </div>
  </div>
  
  <button
    onClick={handleLogout}
    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold active:scale-95 transition-transform"
  >
    Logout
  </button>
</div>
```

### Step 5.4 - Update SOSScreen
**File:** `src/screens/SOSScreen.jsx`
**Location:** Auto-fill user info

```javascript
// UPDATE handleSendAlert function
const handleSendAlert = async () => {
  if (!user?.uid) {
    alert('Please login to send SOS alerts')
    navigate('login')
    return
  }
  
  // Validation...
  
  const alertData = {
    userId: user.uid,
    userName: user.name || 'Anonymous',
    userEmail: user.email || '',
    petId: selectedPet.id,
    petName: selectedPet.name,
    petPhoto: selectedPet.photos?.[0] || null,
    petBreed: selectedPet.breed,
    lat: location.lat,
    lng: location.lng,
    description,
    contactPhone: user.phone || contactPhone,  // Use user's phone if available
    lastSeenTime
  }
  
  // Rest of function...
}
```

---

## 📱 PHASE 6: NAVIGATION SETUP (15 minutes)

### Step 6.1 - Update App.jsx (or main.jsx)
**File:** `src/App.jsx`
**Location:** Add screen routes

```javascript
// ADD new imports
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'

// ADD to screen mapping object (around line 30)
const screens = {
  welcome: WelcomeScreen,
  login: LoginScreen,
  register: RegisterScreen,
  home: HomeScreen,
  // ... rest of screens
}
```

### Step 6.2 - Set Initial Screen
**File:** `src/context/AppContext.jsx`
**Location:** Initial state

```javascript
// CHANGE initial screen state
const [currentScreen, setCurrentScreen] = useState('welcome')  // Changed from 'home'
```

---

## ✅ PHASE 7: TESTING & VERIFICATION (30 minutes)

### Step 7.1 - Build and Test
```bash
npm run build
npm run dev
```

### Step 7.2 - Test Registration
- [ ] Open app → shows WelcomeScreen
- [ ] Click "Get Started" → RegisterScreen
- [ ] Fill form with valid data
- [ ] Create account
- [ ] Check Firebase Auth console for new user
- [ ] Check Firestore for /users/{uid} document
- [ ] Should redirect to HomeScreen

### Step 7.3 - Test Login
- [ ] Logout from ProfileScreen
- [ ] Should redirect to WelcomeScreen
- [ ] Click "Login"
- [ ] Enter valid credentials
- [ ] Should login successfully
- [ ] Should redirect to HomeScreen

### Step 7.4 - Test Route Protection
- [ ] Logout
- [ ] Try to manually navigate to protected screens
- [ ] Should redirect to login
- [ ] Login again
- [ ] Should access all screens

### Step 7.5 - Test Data Isolation
- [ ] Create 2 test accounts
- [ ] Add pets to account 1
- [ ] Logout and login to account 2
- [ ] Should NOT see account 1's pets
- [ ] Add pets to account 2
- [ ] Logout and login back to account 1
- [ ] Should only see account 1's pets

---

## 🚀 PHASE 8: DEPLOY (15 minutes)

### Step 8.1 - Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Step 8.2 - Commit Changes
```bash
git add -A
git commit -m "FEAT: Full Auth Flow & Multi-User System

- Added WelcomeScreen, LoginScreen, RegisterScreen
- Implemented user registration with Firestore profiles
- Added route protection for all screens
- User data isolation per UID
- Pets scoped to /users/{uid}/pets
- SOS Alerts include user ownership
- Logout functionality
- Updated Firestore security rules
- User greeting in HomeScreen
- Profile screen with user info"

git push
```

### Step 8.3 - Build APK
```bash
# GitHub Actions will auto-build
# Or build locally:
cd android
./gradlew assembleDebug
```

---

## 🎯 COMPLETION CHECKLIST

- [ ] All new files created
- [ ] All existing files updated
- [ ] Firebase Auth enabled
- [ ] Firestore rules deployed
- [ ] App builds successfully
- [ ] No console errors
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Route protection works
- [ ] Data isolation verified
- [ ] Pets scoped to users
- [ ] SOS alerts have user info
- [ ] Committed to Git
- [ ] APK built
- [ ] Tested on 2 devices

---

## 📊 ESTIMATED TIME BREAKDOWN

| Phase | Task | Time |
|-------|------|------|
| 1 | Firebase Setup | 15 min |
| 2 | Core Auth Services | 30 min |
| 3 | Auth UI Screens | 45 min |
| 4 | Route Protection | 20 min |
| 5 | Update Existing Screens | 40 min |
| 6 | Navigation Setup | 15 min |
| 7 | Testing | 30 min |
| 8 | Deploy | 15 min |
| **TOTAL** | | **~3 hours** |

---

**READY TO EXECUTE TOMORROW! 🚀**

**Next Steps:**
1. Sleep well 😴
2. Tomorrow morning: Open VS Code
3. Click "Allow" once
4. Follow this checklist step-by-step
5. Test thoroughly
6. Deploy APK
7. Celebrate! 🎉
