import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Heart, MessageCircle, MapPin, Bell, Mail, Lock, Eye, EyeOff, X } from 'lucide-react'
import { loginUser, registerUser, loginWithGoogle, resetPassword } from '../firebase/services'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Button from '../components/Button'

export default function WelcomeScreen() {
  const { navigate, setUser, t, lang, setLang } = useApp()
  const [mode, setMode] = useState('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const cred = await loginUser(email, password)
        setUser({ uid: cred.user.uid, name: cred.user.displayName || 'User', email: cred.user.email })
      } else if (mode === 'register') {
        const cred = await registerUser(email, password, name)
        setUser({ uid: cred.uid, name, email })
      }
      navigate('home')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    
    try {
      const user = await loginWithGoogle()
      setUser({
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL
      })
      navigate('home')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', ''))
    } finally {
      setLoading(false)
    }
  }

  const languages = [
    { code: 'pl', label: 'PL' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
  ]
  
  // Quick test login (DEV only)
  const handleTestLogin = () => {
    setUser({ 
      uid: 'test-user-123', 
      name: 'Test User', 
      email: 'test@paway.app',
      phone: '+48 123 456 789'
    })
    navigate('home')
  }

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return null
    if (pwd.length < 6) return { label: 'Weak', color: 'coral' }
    if (pwd.length < 10) return { label: 'Medium', color: 'amber' }
    return { label: 'Strong', color: 'teal' }
  }

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await resetPassword(resetEmail)
      setResetSuccess(true)
      setTimeout(() => {
        setShowResetModal(false)
        setResetSuccess(false)
        setResetEmail('')
      }, 3000)
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', ''))
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = mode === 'register' ? getPasswordStrength(password) : null

  // Login Screen
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-background">
        <DarkHeader 
          title="Log In"
          onBack={() => { setMode('welcome'); setError('') }}
          rightAction={
            <div className="flex items-center gap-1 bg-bg-darker rounded-lg p-1">
              {languages.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    lang === code ? 'bg-lime-2 text-lime-dark' : 'text-text-gray'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
        
        <WhiteCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-inter text-sm font-medium text-text-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card-2 rounded-xl font-inter text-sm border-0 focus:ring-2 focus:ring-lime-2 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-inter text-sm font-medium text-text-dark">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true)
                    setResetEmail(email)
                    setError('')
                  }}
                  className="font-inter text-xs text-lime-2 font-semibold hover:text-lime-1 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-card-2 rounded-xl font-inter text-sm border-0 focus:ring-2 focus:ring-lime-2 outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-gray"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-coral/10 text-coral px-4 py-3 rounded-xl text-sm font-inter">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-text-gray font-inter">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-card-2 rounded-xl font-inter text-sm font-semibold text-text-dark flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10V12.05H15.4818C15.2273 13.3 14.4636 14.3591 13.3182 15.0682V17.5773H16.7091C18.7091 15.7364 19.8 13.2182 19.8 10.2273Z" fill="#4285F4"/>
                <path d="M10 20C12.7 20 14.9636 19.1045 16.7091 17.5773L13.3182 15.0682C12.3545 15.6682 11.1455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.1636 4.36364 11.7364H0.854546V14.3318C2.59091 17.7955 6.04545 20 10 20Z" fill="#34A853"/>
                <path d="M4.36364 11.7364C4.14545 11.1364 4.02273 10.4818 4.02273 9.99997C4.02273 9.51815 4.14545 8.86361 4.36364 8.26361V5.66815H0.854546C0.309091 6.75906 0 7.93633 0 9.99997C0 12.0636 0.309091 13.2409 0.854546 14.3318L4.36364 11.7364Z" fill="#FBBC05"/>
                <path d="M10 3.97727C11.2682 3.97727 12.4091 4.41818 13.3045 5.2727L16.3318 2.24545C14.9591 0.981818 12.6955 0 10 0C6.04545 0 2.59091 2.20455 0.854546 5.66818L4.36364 8.26364C5.19091 5.83636 7.39545 3.97727 10 3.97727Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => { setMode('register'); setError('') }}
              className="w-full text-center text-sm text-text-gray font-inter mt-4"
            >
              Don't have an account? <span className="text-lime-2 font-semibold">Sign Up</span>
            </button>
          </form>
        </WhiteCard>
      </div>
    )
  }

  // Register Screen
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-background">
        <DarkHeader 
          title="Create Account"
          onBack={() => { setMode('welcome'); setError('') }}
          rightAction={
            <div className="flex items-center gap-1 bg-bg-darker rounded-lg p-1">
              {languages.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    lang === code ? 'bg-lime-2 text-lime-dark' : 'text-text-gray'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
        
        <WhiteCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-inter text-sm font-medium text-text-dark mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-card-2 rounded-xl font-inter text-sm border-0 focus:ring-2 focus:ring-lime-2 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-inter text-sm font-medium text-text-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card-2 rounded-xl font-inter text-sm border-0 focus:ring-2 focus:ring-lime-2 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-inter text-sm font-medium text-text-dark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-card-2 rounded-xl font-inter text-sm border-0 focus:ring-2 focus:ring-lime-2 outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-gray"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordStrength && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-card-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: passwordStrength.label === 'Weak' ? '33%' : passwordStrength.label === 'Medium' ? '66%' : '100%',
                        backgroundColor: `var(--${passwordStrength.color})`
                      }}
                    />
                  </div>
                  <span className="text-xs font-inter" style={{ color: `var(--${passwordStrength.color})` }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-coral/10 text-coral px-4 py-3 rounded-xl text-sm font-inter">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-text-gray font-inter">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-card-2 rounded-xl font-inter text-sm font-semibold text-text-dark flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10V12.05H15.4818C15.2273 13.3 14.4636 14.3591 13.3182 15.0682V17.5773H16.7091C18.7091 15.7364 19.8 13.2182 19.8 10.2273Z" fill="#4285F4"/>
                <path d="M10 20C12.7 20 14.9636 19.1045 16.7091 17.5773L13.3182 15.0682C12.3545 15.6682 11.1455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.1636 4.36364 11.7364H0.854546V14.3318C2.59091 17.7955 6.04545 20 10 20Z" fill="#34A853"/>
                <path d="M4.36364 11.7364C4.14545 11.1364 4.02273 10.4818 4.02273 9.99997C4.02273 9.51815 4.14545 8.86361 4.36364 8.26361V5.66815H0.854546C0.309091 6.75906 0 7.93633 0 9.99997C0 12.0636 0.309091 13.2409 0.854546 14.3318L4.36364 11.7364Z" fill="#FBBC05"/>
                <path d="M10 3.97727C11.2682 3.97727 12.4091 4.41818 13.3045 5.2727L16.3318 2.24545C14.9591 0.981818 12.6955 0 10 0C6.04545 0 2.59091 2.20455 0.854546 5.66818L4.36364 8.26364C5.19091 5.83636 7.39545 3.97727 10 3.97727Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className="w-full text-center text-sm text-text-gray font-inter mt-4"
            >
              Already have an account? <span className="text-lime-2 font-semibold">Log In</span>
            </button>
          </form>
        </WhiteCard>
      </div>
    )
  }

  // Welcome Screen (Initial View)
  const features = [
    {
      icon: Heart,
      color: 'coral',
      title: 'SOS Alerts',
      description: 'Instant help when your pet goes missing'
    },
    {
      icon: MessageCircle,
      color: 'blue-1',
      title: 'Community',
      description: 'Connect with other pet owners nearby'
    },
    {
      icon: MapPin,
      color: 'teal',
      title: 'Live Tracking',
      description: 'Know where your pet is at all times'
    },
    {
      icon: Bell,
      color: 'amber',
      title: 'Smart Reminders',
      description: 'Never miss vet appointments or medication'
    }
  ]

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-4 z-20">
        <div className="flex items-center gap-1 bg-bg-darker rounded-lg p-1">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                lang === code ? 'bg-lime-2 text-lime-dark' : 'text-text-gray'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Safe area top */}
      <div className="h-10" />
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 pt-12">
        {/* Logo */}
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-lime-1 to-lime-2 flex items-center justify-center mb-8 shadow-lg">
          <span className="text-6xl">🐾</span>
        </div>
        
        {/* Title */}
        <h1 className="font-poppins font-bold text-3xl text-card text-center mb-3">
          Welcome to Paway
        </h1>
        <p className="font-inter text-text-gray text-center text-sm max-w-xs mb-12">
          Your pet's safety and happiness in one app
        </p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div 
                key={idx}
                className="bg-bg-darker/50 backdrop-blur-sm rounded-2xl p-4 border border-border/10"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `var(--${feature.color})` + '20' }}
                >
                  <Icon size={20} style={{ color: `var(--${feature.color})` }} />
                </div>
                <h3 className="font-poppins font-semibold text-card text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="font-inter text-text-faint text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <Button 
          variant="primary"
          className="w-full"
          onClick={() => setMode('register')}
        >
          Get Started
        </Button>
        <Button 
          variant="ghost"
          className="w-full text-card hover:bg-card/10"
          onClick={() => setMode('login')}
        >
          I already have an account
        </Button>
        
        {/* DEV ONLY */}
        <button
          onClick={handleTestLogin}
          className="w-full text-xs text-text-faint/50 hover:text-text-faint transition-colors pt-2"
        >
          Dev: Skip Login →
        </button>
      </div>
      
      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-poppins font-semibold text-lg text-text-dark">
                Reset Password
              </h3>
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setResetSuccess(false)
                  setError('')
                }}
                className="w-8 h-8 rounded-lg bg-card-2 flex items-center justify-center hover:bg-border transition-colors"
              >
                <X size={18} className="text-text-gray" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {resetSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-teal" />
                  </div>
                  <h4 className="font-poppins font-semibold text-text-dark mb-2">
                    Email Sent!
                  </h4>
                  <p className="font-inter text-sm text-text-gray">
                    Check your inbox for a password reset link.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <p className="font-inter text-sm text-text-gray mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  <div>
                    <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-card-2 rounded-xl font-inter text-sm border-0 focus:ring-2 focus:ring-lime-2 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-coral/10 text-coral px-4 py-3 rounded-xl text-sm font-inter">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowResetModal(false)
                        setError('')
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Sending...' : 'Send Link'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
