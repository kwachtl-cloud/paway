import { AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function FloatingSOSButton() {
  const { navigate } = useApp()

  return (
    <button
      onClick={() => navigate('sos')}
      className="fixed bottom-24 right-5 w-16 h-16 bg-gradient-to-br from-destructive to-destructive/80 text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-all hover:shadow-destructive/50 animate-pulse-slow"
      aria-label="SOS Alert"
    >
      <AlertTriangle size={28} strokeWidth={2.5} />
    </button>
  )
}
