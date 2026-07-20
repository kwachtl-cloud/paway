import { useApp } from '../context/AppContext'
import { Heart, MapPin, Star } from 'lucide-react'
import { mockProviders } from '../data/mockData'
import { useState } from 'react'

export default function SavedScreen() {
  const { t, navigate } = useApp()
  const [savedIds, setSavedIds] = useState(new Set(mockProviders.slice(0, 2).map(p => p.id)))

  const savedProviders = mockProviders.filter(p => savedIds.has(p.id))

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="px-6 pt-8 pb-32 bg-background min-h-screen animate-fade-in">
      <h1 className="text-heading text-foreground mb-8">{t('saved')}</h1>

      {savedProviders.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">{t('noSavedProviders')}</p>
          <p className="text-muted-foreground text-sm mt-1">{t('tapHeartToSave')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedProviders.map(provider => (
            <div
              key={provider.id}
              onClick={() => navigate('provider-profile', { providerId: provider.id })}
              className="card rounded-[var(--radius-md)] p-4 active:scale-95 transition-transform cursor-pointer flex items-center gap-4"
            >
              {/* Małe zdjęcie po lewej */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Dane profilu po prawej */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground truncate">{provider.name}</p>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium">{provider.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                  <MapPin size={12} />
                  <span className="truncate">{provider.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-primary font-semibold text-sm">${provider.price}/night</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(provider.id) }}
                    className="w-8 h-8 bg-card/90 rounded-full flex items-center justify-center border border-border"
                  >
                    <Heart size={14} className="text-red-500 fill-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
