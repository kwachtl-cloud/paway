import { useApp } from '../context/AppContext'
import { Globe, Settings, PawPrint, Coins, ChevronRight, Shield, LogOut, Heart } from 'lucide-react'
import { logoutUser } from '../firebase/services'

export default function ProfileScreen() {
  const { t, lang, setLang, navigate, setUser, user } = useApp()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (e) {}
    setUser(null)
    navigate('welcome')
  }

  const languages = [
    { code: 'pl', label: 'Polski' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
  ]

  return (
    <div className="px-6 pt-8 pb-32 bg-background min-h-screen animate-fade-in">
      {/* User Card - Large Avatar */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-primary-soft rounded-full flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-card">
              <Shield size={14} className="text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-heading text-foreground mb-1">{user?.name || 'Jan Kowalski'}</h2>
          <p className="text-body text-muted-foreground mb-2">{user?.email || 'jan.kowalski@email.com'}</p>
          <span className="badge badge-live">{t('verified')}</span>
        </div>
      </div>

      {/* Paway Coins */}
      <div className="bg-[image:var(--gradient-accent)] rounded-[var(--radius-md)] p-5 mb-6 text-accent-foreground flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Coins size={22} />
          <span className="text-title">{t('coins')}</span>
        </div>
        <span className="text-heading">1,250</span>
      </div>

      {/* Pet Passport */}
      <button
        onClick={() => navigate('pet-passport')}
        className="card w-full p-5 mb-4 flex items-center justify-between active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-3">
          <PawPrint size={20} className="text-primary" />
          <span className="text-title text-foreground">{t('petPassport')}</span>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </button>

      {/* Saved Providers */}
      <button
        onClick={() => navigate('saved')}
        className="card w-full p-5 mb-4 flex items-center justify-between active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-destructive" />
          <span className="text-title text-foreground">{t('saved')}</span>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </button>

      {/* Language Switcher */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-primary" />
          <span className="text-title text-foreground">{t('language')}</span>
        </div>
        <div className="flex gap-2">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`flex-1 py-2 rounded-xl text-caption font-semibold transition-all ${
                lang === code
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <button
        onClick={() => {}}
        className="card w-full p-5 flex items-center justify-between active:scale-95 transition-transform mb-4"
      >
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-muted-foreground" />
          <span className="text-title text-foreground">{t('settings')}</span>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="card w-full p-5 border-destructive/20 flex items-center justify-between active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-3">
          <LogOut size={20} className="text-destructive" />
          <span className="text-title text-destructive">{t('logOut')}</span>
        </div>
        <ChevronRight size={18} className="text-destructive/50" />
      </button>
    </div>
  )
}
