import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { 
  ArrowLeft, 
  Plus, 
  PawPrint, 
  Calendar,
  Ruler,
  Hash,
  Syringe,
  AlertCircle,
  QrCode,
  Edit2,
  Trash2,
  Download
} from 'lucide-react'
import { getPets, addPet, updatePet, deletePet, uploadPetPhoto } from '../firebase/services'
import PhotoUpload from '../components/PhotoUpload'
import QRCode from 'qrcode'

export default function PetPassportScreen() {
  const { t, goBack, user } = useApp()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [selectedPet, setSelectedPet] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: 'male',
    weight: '',
    chipNumber: '',
    medicalInfo: '',
    behaviorTags: [],
    photos: [],
  })
  
  // Load pets on mount
  useEffect(() => {
    loadPets()
  }, [user])
  
  const loadPets = async () => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const userPets = await getPets(user.uid)
      setPets(userPets)
    } catch (error) {
      console.error('Error loading pets:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      gender: 'male',
      weight: '',
      chipNumber: '',
      medicalInfo: '',
      behaviorTags: [],
      photos: [],
    })
    setEditingPet(null)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.uid || !formData.name.trim()) return
    
    setSaving(true)
    console.log('📝 Starting pet save...', { 
      name: formData.name, 
      photoCount: formData.photos.length 
    })
    
    try {
      // Upload photos first
      const uploadedPhotos = []
      console.log('📸 Uploading', formData.photos.length, 'photos...')
      
      for (let i = 0; i < formData.photos.length; i++) {
        const photo = formData.photos[i]
        setUploadProgress(`Uploading photo ${i + 1} of ${formData.photos.length}...`)
        console.log(`📸 Processing photo ${i + 1}/${formData.photos.length}...`)
        
        if (photo.file) {
          console.log('  → Uploading new file:', photo.file.name, (photo.file.size / 1024).toFixed(1) + ' KB')
          const url = await uploadPetPhoto(user.uid, Date.now().toString(), photo.file, uploadedPhotos.length)
          console.log('  ✅ Upload complete, URL length:', url.length)
          uploadedPhotos.push(url)
        } else if (photo.url || typeof photo === 'string') {
          console.log('  → Using existing URL')
          uploadedPhotos.push(photo.url || photo)
        }
      }
      
      setUploadProgress('Saving pet data...')
      console.log('✅ All photos uploaded:', uploadedPhotos.length)
      
      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        chipNumber: formData.chipNumber.trim(),
        medicalInfo: formData.medicalInfo.trim(),
        behaviorTags: formData.behaviorTags,
        photos: uploadedPhotos,
      }
      
      console.log('💾 Saving pet data to database...')
      if (editingPet) {
        await updatePet(editingPet.id, petData)
      } else {
        await addPet(user.uid, petData)
      }
      
      console.log('✅ Pet saved successfully!')
      await loadPets()
      setShowAddForm(false)
      resetForm()
    } catch (error) {
      console.error('❌ Error saving pet:', error)
      alert('Error saving pet: ' + error.message)
    } finally {
      setSaving(false)
      setUploadProgress('')
      console.log('🏁 Save process complete')
    }
  }
  
  const handleEdit = (pet) => {
    setFormData({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      gender: pet.gender || 'male',
      weight: pet.weight?.toString() || '',
      chipNumber: pet.chipNumber || '',
      medicalInfo: pet.medicalInfo || '',
      behaviorTags: pet.behaviorTags || [],
      photos: pet.photos?.map(url => ({ url })) || [],
    })
    setEditingPet(pet)
    setShowAddForm(true)
  }
  
  const handleDelete = async (petId) => {
    if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this pet?')) return
    
    try {
      await deletePet(petId)
      await loadPets()
    } catch (error) {
      console.error('Error deleting pet:', error)
    }
  }
  
  const toggleBehaviorTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      behaviorTags: prev.behaviorTags.includes(tag)
        ? prev.behaviorTags.filter(t => t !== tag)
        : [...prev.behaviorTags, tag]
    }))
  }
  
  const generateQRCode = async (pet) => {
    try {
      // Generate QR code with pet contact info
      const contactData = {
        name: pet.name,
        owner: user?.name || 'Owner',
        phone: user?.phone || '',
        petId: pet.id,
        url: `https://paway.app/pet/${pet.id}`
      }
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(contactData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#173B31',
          light: '#FFFFFF'
        }
      })
      
      // Download QR code
      const link = document.createElement('a')
      link.href = qrCodeDataUrl
      link.download = `${pet.name}-qr-code.png`
      link.click()
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }
  
  const behaviorOptions = [
    'friendly', 'active', 'calm', 'anxious', 'playful', 'protective'
  ]

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goBack} 
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold text-foreground">{t('petPassport')}</h1>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(!showAddForm)
          }}
          className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add/Edit Pet Form */}
      {showAddForm && (
        <div className="card p-5 mb-6 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4">
            {editingPet ? t('editPet') : t('addPet')}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('photos')}
              </label>
              <PhotoUpload
                photos={formData.photos}
                onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                maxPhotos={5}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('petName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Buddy, Luna, Max..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Species & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('species')}
                </label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="dog">🐕 {t('dog')}</option>
                  <option value="cat">🐈 {t('cat')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('gender')}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="male">♂️ {t('male')}</option>
                  <option value="female">♀️ {t('female')}</option>
                </select>
              </div>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('breed')}
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                placeholder="Golden Retriever, British Shorthair..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Age & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  {t('age')} ({t('years')})
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="3"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Ruler size={14} className="inline mr-1" />
                  {t('weight')} (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="25.5"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Chip Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash size={14} className="inline mr-1" />
                {t('chipNumber')}
              </label>
              <input
                type="text"
                value={formData.chipNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chipNumber: e.target.value }))}
                placeholder="123456789012345"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Behavior Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('behavior')}
              </label>
              <div className="flex flex-wrap gap-2">
                {behaviorOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleBehaviorTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.behaviorTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {t(tag)}
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Info */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Syringe size={14} className="inline mr-1" />
                {t('medicalInfo')}
              </label>
              <textarea
                rows={3}
                value={formData.medicalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                placeholder={t('medicalInfoPlaceholder') || 'Allergies, medications, special needs...'}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50"
              >
                {saving ? (uploadProgress || t('saving')) : t('save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}
                className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold active:scale-95 transition-transform"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Pet List */}
      <div className="space-y-4">
        {pets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint size={32} className="text-primary" />
            </div>
            <p className="text-foreground font-medium mb-1">{t('noPetsYet')}</p>
            <p className="text-sm text-muted-foreground">{t('addYourFirstPet')}</p>
          </div>
        ) : (
          pets.map((pet) => (
            <div key={pet.id} className="card p-4">
              {/* Pet Header with Photo */}
              <div className="flex items-start gap-4 mb-4">
                {pet.photos && pet.photos.length > 0 ? (
                  <img
                    src={pet.photos[0]}
                    alt={pet.name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PawPrint size={32} className="text-primary" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pet.breed || pet.species === 'dog' ? t('dog') : pet.species === 'cat' ? t('cat') : t('other')}
                  </p>
                  {pet.age && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {pet.age} {t('yearsOld')}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pet)}
                    className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Edit2 size={16} className="text-secondary-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="w-9 h-9 bg-destructive/10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              </div>
              
              {/* Pet Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {pet.weight && (
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('weight')}</p>
                    <p className="text-sm font-semibold text-foreground">{pet.weight} kg</p>
                  </div>
                )}
                {pet.gender && (
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('gender')}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {pet.gender === 'male' ? '♂️ ' + t('male') : '♀️ ' + t('female')}
                    </p>
                  </div>
                )}
                {pet.chipNumber && (
                  <div className="bg-background rounded-lg p-3 col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      <Hash size={12} className="inline" /> {t('chipNumber')}
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">{pet.chipNumber}</p>
                  </div>
                )}
              </div>
              
              {/* Behavior Tags */}
              {pet.behaviorTags && pet.behaviorTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">{t('behavior')}</p>
                  <div className="flex flex-wrap gap-2">
                    {pet.behaviorTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        {t(tag)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Medical Info */}
              {pet.medicalInfo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900 mb-1">{t('medicalInfo')}</p>
                      <p className="text-xs text-amber-800 leading-relaxed">{pet.medicalInfo}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* QR Code Button */}
              <button
                onClick={() => generateQRCode(pet)}
                className="w-full py-3 bg-primary/10 text-primary rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <QrCode size={18} />
                {t('generateQRCode')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
