import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Heart, MessageCircle, MapPin, Bell, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { loginUser, registerUser } from '../firebase/services'
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
              <label className="block font-inter text-sm font-medium text-text-dark mb-2">
                Password
              </label>
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
    </div>
  )
}
