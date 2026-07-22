import { Home, MapPin, PawPrint, User, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'

// MVP TABS - tylko kluczowe funkcjonalności
const tabIcons = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'park-radar', icon: MapPin, labelKey: 'places' },
  { id: 'pet-passport', icon: PawPrint, labelKey: 'petPassport' },
  { id: 'profile', icon: User, labelKey: 'profile' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, setCurrentScreen, navigate, t } = useApp()

  const handleTabClick = (id) => {
    setActiveTab(id)
    setCurrentScreen(id)
  }

  const handleSOSClick = () => {
    navigate('sos')
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-bg-darker border-t border-bg-dark px-4 pb-safe pt-3 z-50">
      <div className="flex justify-around items-center relative">
        {/* First 2 tabs */}
        {tabIcons.slice(0, 2).map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 min-w-[60px] ${
              activeTab === id
                ? 'text-lime-1'
                : 'text-text-gray'
            }`}
          >
            <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
            <span className="text-[9px] font-inter font-semibold uppercase tracking-wide leading-tight">
              {t(labelKey)}
            </span>
          </button>
        ))}

        {/* Center FAB - SOS Button */}
        <button
          onClick={handleSOSClick}
          className="fab -mt-8 relative"
          style={{
            border: '4px solid var(--bg-darker)'
          }}
        >
          <Plus size={28} strokeWidth={3} />
        </button>

        {/* Last 2 tabs */}
        {tabIcons.slice(2).map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 min-w-[60px] ${
              activeTab === id
                ? 'text-lime-1'
                : 'text-text-gray'
            }`}
          >
            <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
            <span className="text-[9px] font-inter font-semibold uppercase tracking-wide leading-tight">
              {t(labelKey)}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
