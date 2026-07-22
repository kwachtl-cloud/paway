import { useApp } from '../context/AppContext'
import { Globe, PawPrint, Heart, ChevronRight, LogOut, User, Settings, Bell } from 'lucide-react'
import { logoutUser } from '../firebase/services'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Button from '../components/Button'
import Card from '../components/Card'

export default function ProfileScreen() {
  const { t, lang, setLang, navigate, setUser, user } = useApp()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.error('Logout error:', e)
    }
    setUser(null)
    navigate('welcome')
  }

  const languages = [
    { code: 'pl', label: 'PL' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
  ]

  const menuItems = [
    {
      id: 'pets',
      icon: PawPrint,
      label: 'Pet Passport',
      color: 'lime-2',
      screen: 'pet-passport'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      color: 'text-gray',
      screen: 'profile'
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      color: 'amber',
      screen: 'notifications'
    },
  ]

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      {/* Dark Header with User Info */}
      <DarkHeader>
        <div className="px-4 pb-6 pt-2 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-1 to-lime-2 flex items-center justify-center mb-4 shadow-lg">
            <User size={40} className="text-lime-dark" />
          </div>
          
          {/* User Name */}
          <h1 className="font-poppins font-bold text-2xl text-card mb-1">
            {user?.name || 'User'}
          </h1>
          
          {/* Email */}
          <p className="font-inter text-text-gray text-sm mb-4">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </DarkHeader>

      {/* White Card Content */}
      <WhiteCard>
        {/* Language Switcher */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-text-dark" />
            <h3 className="font-poppins font-semibold text-text-dark text-base">
              {t('language')}
            </h3>
          </div>
          <div className="flex gap-2">
            {languages.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 py-3 rounded-xl font-inter text-sm font-semibold transition-all ${
                  lang === code
                    ? 'bg-gradient-to-r from-lime-1 to-lime-2 text-lime-dark'
                    : 'bg-card-2 text-text-gray'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-8">
          <h3 className="font-poppins font-semibold text-text-dark text-base mb-4">
            Menu
          </h3>
          <div className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon
              return (
                <Card
                  key={item.id}
                  onClick={() => navigate(item.screen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon 
                        size={20} 
                        style={{ color: `var(--${item.color})` }}
                      />
                      <span className="font-inter text-sm font-medium text-text-dark">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-text-gray" />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </Button>
      </WhiteCard>
    </div>
  )
}
