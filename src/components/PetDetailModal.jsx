import { X, Dog, Calendar, Weight, Heart, AlertCircle } from 'lucide-react'

export default function PetDetailModal({ pet, checkin, onClose }) {
  if (!pet) return null

  const genderEmoji = pet.gender === 'male' ? '♂️' : pet.gender === 'female' ? '♀️' : '⚧'
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with photo */}
        <div className="relative">
          {pet.photos?.[0] ? (
            <img 
              src={pet.photos[0]} 
              alt={pet.name}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center rounded-t-2xl">
              <Dog size={80} className="text-muted-foreground" />
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Name & Basic Info */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-1">
              {pet.name} {genderEmoji}
            </h2>
            <p className="text-muted-foreground">{pet.breed || pet.species}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {pet.age && (
              <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-semibold">{pet.age}</p>
                </div>
              </div>
            )}
            
            {pet.weight && (
              <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-2">
                <Weight size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-semibold">{pet.weight}</p>
                </div>
              </div>
            )}
          </div>

          {/* Behavior Tags */}
          {pet.behaviorTags && pet.behaviorTags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-pink-500" />
                <h3 className="font-semibold text-sm">Personality</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {pet.behaviorTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Info */}
          {pet.medicalInfo && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-orange-500" />
                <h3 className="font-semibold text-sm">Medical Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-orange-500/5 border border-orange-500/20 rounded-xl p-3">
                {pet.medicalInfo}
              </p>
            </div>
          )}

          {/* Check-in Info */}
          {checkin && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-1">Currently at</p>
              <p className="font-semibold mb-1">{checkin.placeName}</p>
              <p className="text-xs text-muted-foreground">
                Checked in {new Date(checkin.checkedInAt).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Stays until {new Date(checkin.expiresAt).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          )}

          {/* Owner (if needed in future) */}
          {checkin?.userName && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-semibold">{checkin.userName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
