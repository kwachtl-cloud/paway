import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { 
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
  ChevronDown,
  X
} from 'lucide-react'
import { getPets, addPet, updatePet, deletePet, uploadPetPhoto } from '../firebase/services'
import PhotoUpload from '../components/PhotoUpload'
import QRCode from 'qrcode'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Button from '../components/Button'
import StatusPill from '../components/StatusPill'
import Card from '../components/Card'

export default function PetPassportScreen() {
  const { t, goBack, user } = useApp()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [selectedPetIndex, setSelectedPetIndex] = useState(0)
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleDelete = async (petId) => {
    if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this pet?')) return
    
    try {
      await deletePet(petId)
      await loadPets()
      if (selectedPetIndex >= pets.length - 1) {
        setSelectedPetIndex(Math.max(0, pets.length - 2))
      }
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
          dark: '#0D1712',
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
    { key: 'friendly', color: 'lime' },
    { key: 'active', color: 'coral' },
    { key: 'calm', color: 'teal' },
    { key: 'anxious', color: 'amber' },
    { key: 'playful', color: 'blue' },
    { key: 'protective', color: 'coral' }
  ]

  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <p className="text-card font-inter">{t('loading')}</p>
      </div>
    )
  }

  const selectedPet = pets.length > 0 ? pets[selectedPetIndex] : null

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      <DarkHeader 
        title={showAddForm ? (editingPet ? 'Edit Pet' : 'Add New Pet') : 'Pet Passport'}
        onBack={showAddForm ? () => { setShowAddForm(false); resetForm() } : goBack}
        rightAction={
          !showAddForm && pets.length > 0 && (
            <button
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
              className="w-10 h-10 bg-lime-gradient rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg"
            >
              <Plus size={20} className="text-bg-dark" />
            </button>
          )
        }
      >
        {!showAddForm && pets.length > 0 && (
          <div className="px-4 pb-6 pt-2">
            {/* Pet Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  // Simple cycling through pets
                  setSelectedPetIndex((selectedPetIndex + 1) % pets.length)
                }}
                className="w-full bg-card-2/10 hover:bg-card-2/20 border border-card-2/20 rounded-2xl p-4 flex items-center gap-4 transition-colors"
              >
                {selectedPet?.photos?.[0] ? (
                  <img
                    src={selectedPet.photos[0]}
                    alt={selectedPet.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-lime-gradient rounded-xl flex items-center justify-center text-2xl">
                    {selectedPet?.species === 'dog' ? '🐕' : selectedPet?.species === 'cat' ? '🐱' : '🐾'}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-poppins font-semibold text-card">{selectedPet?.name}</p>
                  <p className="font-inter text-sm text-text-gray">{selectedPet?.breed || selectedPet?.species}</p>
                </div>
                {pets.length > 1 && (
                  <ChevronDown size={20} className="text-card" />
                )}
              </button>
            </div>
          </div>
        )}
      </DarkHeader>
      
      <WhiteCard>
        {/* Add/Edit Pet Form */}
        {showAddForm ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-poppins font-semibold text-lg text-text-dark mb-1">
                {editingPet ? 'Update Pet Info' : 'Add Your Pet'}
              </h3>
              <p className="font-inter text-sm text-text-gray">
                Complete your pet's profile
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-3">
                  Photos (up to 5)
                </label>
                <PhotoUpload
                  photos={formData.photos}
                  onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                  maxPhotos={5}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                  Pet Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Buddy, Luna, Max..."
                  className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
                />
              </div>

              {/* Species & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                    Species
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                    className="w-full px-4 py-3 bg-card-2 text-text-dark rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
                  >
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐈 Cat</option>
                    <option value="other">🐾 Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 bg-card-2 text-text-dark rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
                  >
                    <option value="male">♂️ Male</option>
                    <option value="female">♀️ Female</option>
                  </select>
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  placeholder="Golden Retriever, British Shorthair..."
                  className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
                />
              </div>

              {/* Age & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    Age (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="3"
                    className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
                  />
                </div>
                
                <div>
                  <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                    <Ruler size={14} className="inline mr-1" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="25.5"
                    className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
                  />
                </div>
              </div>

              {/* Chip Number */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                  <Hash size={14} className="inline mr-1" />
                  Chip Number
                </label>
                <input
                  type="text"
                  value={formData.chipNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, chipNumber: e.target.value }))}
                  placeholder="123456789012345"
                  className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm font-mono"
                />
              </div>

              {/* Behavior Tags */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-3">
                  Behavior
                </label>
                <div className="flex flex-wrap gap-2">
                  {behaviorOptions.map(({ key, color }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBehaviorTag(key)}
                      className={`transition-all active:scale-95 ${
                        formData.behaviorTags.includes(key)
                          ? `pill-${color}`
                          : 'px-3 py-1.5 bg-card-2 text-text-gray rounded-full font-inter text-xs font-semibold'
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                  <Syringe size={14} className="inline mr-1" />
                  Medical Info
                </label>
                <textarea
                  rows={4}
                  value={formData.medicalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                  placeholder="Allergies, medications, special needs..."
                  className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none resize-none font-inter text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (uploadProgress || 'Saving...') : 'Save Pet'}
                </Button>
              </div>
            </form>
          </div>
        ) : pets.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-lime-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <PawPrint size={32} className="text-bg-dark" />
            </div>
            <h3 className="font-poppins font-semibold text-lg text-text-dark mb-2">
              No Pets Yet
            </h3>
            <p className="font-inter text-sm text-text-gray mb-8 max-w-xs mx-auto">
              Add your first pet to get started with their health records
            </p>
            <Button
              variant="primary"
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
              className="mx-auto"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Pet
            </Button>
          </div>
        ) : selectedPet && (
          // Pet Details View
          <div className="space-y-6">
            {/* Pet Header with Photo Gallery */}
            <div>
              {selectedPet.photos && selectedPet.photos.length > 0 ? (
                <div className="mb-4">
                  <img
                    src={selectedPet.photos[0]}
                    alt={selectedPet.name}
                    className="w-full h-48 rounded-2xl object-cover"
                  />
                  {selectedPet.photos.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {selectedPet.photos.slice(1, 4).map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`${selectedPet.name} ${idx + 2}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                      {selectedPet.photos.length > 4 && (
                        <div className="w-16 h-16 rounded-lg bg-card-2 flex items-center justify-center">
                          <span className="font-inter text-xs font-semibold text-text-gray">
                            +{selectedPet.photos.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-lime-gradient rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-6xl">
                    {selectedPet.species === 'dog' ? '🐕' : selectedPet.species === 'cat' ? '🐱' : '🐾'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-poppins font-bold text-2xl text-text-dark">{selectedPet.name}</h2>
                  <p className="font-inter text-sm text-text-gray">
                    {selectedPet.breed || (selectedPet.species === 'dog' ? 'Dog' : selectedPet.species === 'cat' ? 'Cat' : 'Pet')}
                    {selectedPet.age && ` • ${selectedPet.age} years old`}
                  </p>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(selectedPet)}
                    className="w-10 h-10 bg-card-2 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Edit2 size={18} className="text-text-dark" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPet.id)}
                    className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Trash2 size={18} className="text-coral" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Basic Info Grid */}
            <div>
              <h3 className="font-poppins font-semibold text-base text-text-dark mb-3">
                Basic Info
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedPet.weight && (
                  <Card>
                    <p className="font-inter text-xs text-text-gray mb-1">Weight</p>
                    <p className="font-inter text-base font-semibold text-text-dark">{selectedPet.weight} kg</p>
                  </Card>
                )}
                {selectedPet.gender && (
                  <Card>
                    <p className="font-inter text-xs text-text-gray mb-1">Gender</p>
                    <p className="font-inter text-base font-semibold text-text-dark">
                      {selectedPet.gender === 'male' ? '♂️ Male' : '♀️ Female'}
                    </p>
                  </Card>
                )}
                {selectedPet.chipNumber && (
                  <Card className="col-span-2">
                    <p className="font-inter text-xs text-text-gray mb-1">
                      <Hash size={12} className="inline" /> Chip Number
                    </p>
                    <p className="font-inter text-sm font-mono font-semibold text-text-dark break-all">
                      {selectedPet.chipNumber}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Behavior Tags */}
            {selectedPet.behaviorTags && selectedPet.behaviorTags.length > 0 && (
              <div>
                <h3 className="font-poppins font-semibold text-base text-text-dark mb-3">
                  Behavior
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPet.behaviorTags.map(tag => {
                    const option = behaviorOptions.find(o => o.key === tag)
                    return (
                      <StatusPill key={tag} color={option?.color || 'lime'}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </StatusPill>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Medical Info */}
            {selectedPet.medicalInfo && (
              <div>
                <h3 className="font-poppins font-semibold text-base text-text-dark mb-3">
                  Medical Information
                </h3>
                <Card className="bg-amber/5 border-amber/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-inter text-sm text-text-dark leading-relaxed">
                        {selectedPet.medicalInfo}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* QR Code Section */}
            <div>
              <h3 className="font-poppins font-semibold text-base text-text-dark mb-3">
                Digital ID
              </h3>
              <Button
                variant="secondary"
                onClick={() => generateQRCode(selectedPet)}
                className="w-full flex items-center justify-center gap-2"
              >
                <QrCode size={18} />
                Generate QR Code
              </Button>
              <p className="font-inter text-xs text-text-faint mt-2 text-center">
                Download a QR code with your pet's contact info
              </p>
            </div>
          </div>
        )}
      </WhiteCard>
    </div>
  )
}
