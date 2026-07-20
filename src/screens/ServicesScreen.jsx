import { useApp } from '../context/AppContext'
import { ArrowLeft, Dog, Scissors, Stethoscope, Users, Syringe, Home, ShoppingBag, Camera } from 'lucide-react'

export default function ServicesScreen() {
  const { t, goBack, navigate } = useApp()

  const services = [
    { 
      id: 'sitting', 
      icon: Dog, 
      labelKey: 'sitting', 
      color: 'bg-primary-soft', 
      iconColor: 'text-primary', 
      screen: 'category',
      description: 'Professional pet sitting services'
    },
    { 
      id: 'grooming', 
      icon: Scissors, 
      labelKey: 'grooming', 
      color: 'bg-accent-soft', 
      iconColor: 'text-accent', 
      screen: 'search-groomer',
      description: 'Professional grooming services'
    },
    { 
      id: 'vet', 
      icon: Stethoscope, 
      labelKey: 'vet', 
      color: 'bg-primary-soft', 
      iconColor: 'text-primary', 
      screen: 'search-vet',
      description: 'Find qualified veterinarians'
    },
    { 
      id: 'walking', 
      icon: Users, 
      labelKey: 'walking', 
      color: 'bg-secondary', 
      iconColor: 'text-muted-foreground', 
      screen: 'park-radar',
      description: 'Dog walking and park community'
    },
    { 
      id: 'training', 
      icon: Home, 
      labelKey: 'training', 
      color: 'bg-primary-soft', 
      iconColor: 'text-primary', 
      screen: 'search-sitter',
      description: 'Pet training services'
    },
    { 
      id: 'boarding', 
      icon: ShoppingBag, 
      labelKey: 'boarding', 
      color: 'bg-accent-soft', 
      iconColor: 'text-accent', 
      screen: 'search-sitter',
      description: 'Pet boarding facilities'
    },
    { 
      id: 'vaccination', 
      icon: Syringe, 
      labelKey: 'vaccination', 
      color: 'bg-primary-soft', 
      iconColor: 'text-primary', 
      screen: 'search-vet',
      description: 'Vaccination services'
    },
    { 
      id: 'photography', 
      icon: Camera, 
      labelKey: 'photography', 
      color: 'bg-secondary', 
      iconColor: 'text-muted-foreground', 
      screen: 'search-sitter',
      description: 'Pet photography services'
    },
  ]

  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={goBack} className="w-11 h-11 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-heading text-foreground">All Services</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {services.map(({ id, icon: Icon, labelKey, color, iconColor, screen, description }) => (
          <button
            key={id}
            onClick={() => navigate(screen)}
            className="card p-5 active:scale-95 transition-transform text-left"
          >
            <div className={`w-14 h-14 ${color} rounded-[var(--radius-md)] flex items-center justify-center shadow-sm mb-4`}>
              <Icon size={26} className={iconColor} />
            </div>
            <p className="text-title text-foreground mb-1">{t(labelKey)}</p>
            <p className="text-caption text-muted-foreground leading-tight">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
