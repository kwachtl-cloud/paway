import { AlertTriangle, MapPin, Phone, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function SOSAlertCard({ alert, onClick }) {
  const { t } = useApp()
  
  // Format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp?.seconds) return ''
    
    const now = Date.now() / 1000
    const diff = now - timestamp.seconds
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (hours > 0) return `${hours}h ${t('ago')}`
    if (minutes > 0) return `${minutes}min ${t('ago')}`
    return t('justNow')
  }
  
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-2xl p-4 text-left active:scale-95 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Pet Photo */}
        {alert.petPhoto ? (
          <img
            src={alert.petPhoto}
            alt={alert.petName}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
        )}
        
        {/* Alert Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-foreground truncate">{alert.petName}</h4>
            {alert.distance !== undefined && (
              <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex-shrink-0">
                {alert.distance < 1 
                  ? `${Math.round(alert.distance * 1000)}m`
                  : `${alert.distance.toFixed(1)}km`
                }
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {alert.petBreed || t('pet')}
          </p>
          
          {alert.description && (
            <p className="text-xs text-foreground/80 line-clamp-2 mb-2">
              {alert.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {getTimeAgo(alert.createdAt)}
            </span>
            {alert.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {t('contact')}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-destructive/20">
        <span className="text-xs text-muted-foreground">
          {t('reportedBy')} {alert.userName}
        </span>
        <span className="text-xs font-semibold text-destructive">
          {t('viewDetails')} →
        </span>
      </div>
    </button>
  )
}
