import { Home, PawPrint, User, Plus, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'

function useUnreadMessages(userUid) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!userUid) return
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userUid)
    )
    const unsub = onSnapshot(q, (snap) => {
      let total = 0
      snap.forEach((d) => {
        total += d.data().unreadCount?.[userUid] || 0
      })
      setCount(total)
    })
    return () => unsub()
  }, [userUid])
  return count
}

// MVP TABS - tylko kluczowe funkcjonalności
const tabIcons = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'messages', icon: MessageSquare, labelKey: 'messages' },
  { id: 'pet-passport', icon: PawPrint, labelKey: 'petPassport' },
  { id: 'profile', icon: User, labelKey: 'profile' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, setCurrentScreen, navigate, t, user } = useApp()
  const unreadCount = useUnreadMessages(user?.uid)

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
            <div className="relative">
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
              {id === 'messages' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-lime-gradient text-bg-dark text-[9px] font-poppins font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
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
