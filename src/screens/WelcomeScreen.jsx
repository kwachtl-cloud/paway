import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PawPrint, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react'
import { loginUser, registerUser } from '../firebase/services'

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
      } else {
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

  if (mode === 'login' || mode === 'register') {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { setMode('welcome'); setError('') }} className="w-10 h-10 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex items-center gap-1 bg-card rounded-xl p-1 shadow-sm border border-border">
            {languages.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-all ${
                  lang === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-display text-foreground mb-2">
            {mode === 'login' ? t('welcomeBack') : t('createAccount')}
          </h1>
          <p className="text-body text-muted-foreground">
            {mode === 'login' ? t('loginToContinue') : t('joinCommunity')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          {mode === 'register' && (
            <div className="mb-3">
              <input
                type="text"
                placeholder={t('yourName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>
          )}
          <div className="mb-3">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                <Mail size={18} className="text-muted-foreground" />
              </div>
              <input
                type="email"
                placeholder={t('emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-14 relative z-10"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                <Lock size={18} className="text-muted-foreground" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-14 pr-12 relative z-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-20 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-caption px-4 py-2.5 rounded-xl mb-4">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full mb-4"
          >
            {loading ? t('loading') : mode === 'login' ? t('login') : t('createAccount')}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          className="text-center text-body text-muted-foreground pb-6"
        >
          {mode === 'login' ? (
            <>{t('dontHaveAccount')} <span className="text-primary font-semibold">{t('signUp')}</span></>
          ) : (
            <>{t('alreadyHaveAccount')} <span className="text-primary font-semibold">{t('login')}</span></>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 animate-fade-in">
      {/* Language Switcher */}
      <div className="absolute top-6 right-4">
        <div className="flex items-center gap-1 bg-card rounded-xl p-1 shadow-sm border border-border">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-all ${
                lang === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-center mb-3">
          <PawPrint size={32} className="text-primary" />
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20" />
          </div>
        </div>
        <h1 className="text-display text-foreground tracking-tight">Paway</h1>
      </div>

      <p className="text-body mb-2 font-light">{t('tagline')}</p>
      <p className="text-caption text-muted-foreground text-center max-w-[260px] leading-relaxed mb-10">
        {t('findTrustedSitters')}
      </p>

      <div className="relative w-64 h-48 mb-10">
        <div className="absolute inset-0 bg-secondary rounded-full opacity-40" />
        <svg viewBox="0 0 200 160" className="w-full h-full">
          <ellipse cx="75" cy="120" rx="35" ry="25" fill="#E8E0D5" />
          <circle cx="75" cy="85" r="25" fill="#E8E0D5" />
          <ellipse cx="55" cy="75" rx="8" ry="12" fill="#4A5D4E" />
          <ellipse cx="95" cy="75" rx="8" ry="12" fill="#E8E0D5" />
          <circle cx="68" cy="82" r="3" fill="#1A1A1A" />
          <circle cx="82" cy="82" r="3" fill="#1A1A1A" />
          <ellipse cx="75" cy="90" rx="6" ry="4" fill="#1A1A1A" />
          <path d="M 50 110 Q 45 130 55 135" stroke="#4A5D4E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="135" cy="125" rx="22" ry="18" fill="#D4A373" />
          <circle cx="135" cy="98" r="18" fill="#D4A373" />
          <polygon points="120,85 125,70 132,85" fill="#D4A373" />
          <polygon points="138,85 143,70 150,85" fill="#D4A373" />
          <circle cx="128" cy="95" r="2.5" fill="#1A1A1A" />
          <circle cx="142" cy="95" r="2.5" fill="#1A1A1A" />
          <ellipse cx="135" cy="100" rx="4" ry="3" fill="#E74C3C" />
          <path d="M 125 115 Q 120 135 130 140" stroke="#D4A373" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 165 60 C 165 55, 170 50, 175 55 C 180 50, 185 55, 185 60 C 185 68, 175 75, 175 75 C 175 75, 165 68, 165 60 Z" fill="#E74C3C" opacity="0.3" />
        </svg>
      </div>

      <div className="flex items-center gap-4 w-full mb-10">
        <button
          onClick={() => setMode('login')}
          className="btn btn-outline flex-1"
        >
          {t('login')}
        </button>
        <button
          onClick={() => setMode('register')}
          className="btn btn-primary flex-1"
        >
          {t('signUp')}
        </button>
      </div>
      
      {/* DEV ONLY - Quick test access */}
      <button
        onClick={handleTestLogin}
        className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        Dev: Skip Login →
      </button>
    </div>
  )
}
