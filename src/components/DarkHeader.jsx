import { ArrowLeft, MoreVertical } from 'lucide-react'

export default function DarkHeader({ 
  title, 
  onBack, 
  rightAction,
  children,
  className = ''
}) {
  return (
    <header className={`bg-[linear-gradient(160deg,#1a3021_0%,var(--bg-dark)_58%)] text-card ${className}`}>
      {/* Safe area top */}
      <div className="h-[max(2.5rem,env(safe-area-inset-top))]" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3">
        {onBack ? (
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full text-card/90 active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-8" />
        )}
        
        {title && (
          <h1 className="font-poppins font-bold text-base tracking-[-0.01em]">{title}</h1>
        )}
        
        {rightAction || <div className="w-8" />}
      </div>
      
      {/* Optional hero content (images, maps, etc.) */}
      {children}
    </header>
  )
}
