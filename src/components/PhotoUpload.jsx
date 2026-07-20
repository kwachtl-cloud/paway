import { useState } from 'react'
import { Camera, X, Upload } from 'lucide-react'

export default function PhotoUpload({ photos = [], onPhotosChange, maxPhotos = 5 }) {
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    
    setUploading(true)
    
    // Convert files to data URLs for preview
    const newPhotos = await Promise.all(
      files.slice(0, maxPhotos - photos.length).map(file => 
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve({ file, preview: e.target.result })
          reader.readAsDataURL(file)
        })
      )
    )
    
    onPhotosChange([...photos, ...newPhotos])
    setUploading(false)
  }

  const removePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={photo.preview || photo.url || photo} 
              alt={`Pet ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="text-gray-400 text-xs">Loading...</div>
            ) : (
              <>
                <Camera size={24} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Photo</span>
              </>
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {photos.length} / {maxPhotos} photos
      </p>
    </div>
  )
}
