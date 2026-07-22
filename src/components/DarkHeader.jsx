import { ArrowLeft, MoreVertical } from 'lucide-react'

export default function DarkHeader({ 
  title, 
  onBack, 
  rightAction,
  children,
  className = ''
}) {
  return (
    <div className={`bg-bg-dark text-card ${className}`}>
      {/* Safe area top */}
      <div className="h-10" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-4">
        {onBack ? (
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-8" />
        )}
        
        {title && (
          <h1 className="font-poppins font-bold text-base">{title}</h1>
        )}
        
        {rightAction || <div className="w-8" />}
      </div>
      
      {/* Optional hero content (images, maps, etc.) */}
      {children}
    </div>
  )
}
