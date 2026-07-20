import { Home, MapPin, PawPrint, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

// MVP TABS - tylko kluczowe funkcjonalności
const tabIcons = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'park-radar', icon: MapPin, labelKey: 'parkRadar' },
  { id: 'pet-passport', icon: PawPrint, labelKey: 'petPassport' },
  { id: 'profile', icon: User, labelKey: 'profile' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, setCurrentScreen, t } = useApp()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-card border-t border-border px-2 pb-2 pt-2 z-50 shadow-lg">
      <div className="flex justify-around items-center">
        {tabIcons.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id)
              setCurrentScreen(id)
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 min-w-[60px] ${
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Icon size={22} strokeWidth={activeTab === id ? 2.2 : 1.8} />
            <span className="text-[9px] font-semibold uppercase tracking-wide leading-tight">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
