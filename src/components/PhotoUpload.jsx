import { useState } from 'react'
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react'
import { Camera as CapCamera } from '@capacitor/camera'
import { CameraResultType, CameraSource } from '@capacitor/camera'
import { isNativePlatform } from '../utils/platform'

export default function PhotoUpload({ photos = [], onPhotosChange, maxPhotos = 5 }) {
  const [uploading, setUploading] = useState(false)

  // Compress image aggressively to reduce size for mobile upload
  const compressImage = async (base64String) => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 600  // Reduced from 800 for faster upload
        const maxHeight = 600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Aggressive compression: 0.5 quality for smaller files
        resolve(canvas.toDataURL('image/jpeg', 0.5))
      }
      img.src = base64String
    })
  }

  // Convert base64 to File object
  const base64ToFile = (base64String, filename = 'photo.jpg') => {
    const arr = base64String.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // Take photo using Capacitor Camera (mobile)
  const handleTakePhoto = async () => {
    if (photos.length >= maxPhotos) return
    
    setUploading(true)
    try {
      // Show action sheet: Camera or Gallery
      const image = await CapCamera.getPhoto({
        quality: 50,  // Reduced from 70 for smaller initial size
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Shows Camera/Gallery chooser
        promptLabelHeader: 'Choose Photo',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Photo'
      })

      if (image.base64String) {
        const base64 = `data:image/jpeg;base64,${image.base64String}`
        const compressed = await compressImage(base64)
        
        // On mobile, save directly as base64 URL (no File object needed)
        // This avoids double compression in uploadImage
        onPhotosChange([...photos, { preview: compressed, url: compressed }])
      }
    } catch (error) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Error taking photo:', error)
      }
    } finally {
      setUploading(false)
    }
  }

  // Browser file input (web fallback)
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    
    setUploading(true)
    
    // Convert files to data URLs and compress
    const newPhotos = await Promise.all(
      files.slice(0, maxPhotos - photos.length).map(file => 
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = async (e) => {
            const compressed = await compressImage(e.target.result)
            resolve({ file, preview: compressed })
          }
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
          <>
            {/* Mobile: Use Capacitor Camera */}
            {isNativePlatform() ? (
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              >
                {uploading ? (
                  <div className="text-gray-400 text-xs">Loading...</div>
                ) : (
                  <>
                    <Camera size={24} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </>
                )}
              </button>
            ) : (
              /* Web: Use file input */
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
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {photos.length} / {maxPhotos} photos
      </p>
    </div>
  )
}
