'use client'

import React from 'react'
import { 
  X, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  MapPin, 
  Star,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { clsx } from 'clsx'
import { dbHelpers, storageHelpers } from '../lib/supabase'
import type { Candidate, ExperienceLevel } from '../types'

interface AddCandidateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (candidate: Candidate) => void
  userId: string
  candidate?: Candidate
}

interface AddCandidateForm {
  full_name: string
  email: string
  phone: string
  position: string
  experience_level: ExperienceLevel
  location: string
  notes: string
  cv_url: string
  skills: string[]
  cv_file?: File
}

interface FormErrors {
  full_name?: string
  email?: string
  phone?: string
  position?: string
  experience_level?: string
  location?: string
  notes?: string
  cv_file?: string
  skills?: string
  general?: string
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'junior', label: 'Junior (0-2 anni)' },
  { value: 'mid', label: 'Mid-level (2-5 anni)' },
  { value: 'senior', label: 'Senior (5+ anni)' },
  { value: 'lead', label: 'Lead/Manager' }
]

export function AddCandidateModal({ isOpen, onClose, onSuccess, userId, candidate }: AddCandidateModalProps) {
  const [formData, setFormData] = React.useState<AddCandidateForm>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience_level: 'junior',
    location: '',
    notes: '',
    cv_url: '',
    skills: []
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [loading, setLoading] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const [skillInput, setSkillInput] = React.useState('')

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Popola i dati se candidate è presente (edit), altrimenti svuota il form (add)
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: candidate?.full_name || '',
        email: candidate?.email || '',
        phone: candidate?.phone || '',
        position: candidate?.position || '',
        experience_level: candidate?.experience_level || 'junior',
        location: candidate?.location || '',
        notes: candidate?.notes || '',
        cv_url: candidate?.cv_url || '',
        skills: candidate?.skills || []
      })
      setErrors({})
      setSkillInput('')
    }
  }, [isOpen, candidate])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo richiesto'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email richiesta'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Posizione richiesta'
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = async (file: File) => {
    setErrors(prev => ({ ...prev, cv_file: undefined }))

    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, cv_file: 'Solo file PDF sono supportati' }))
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({ ...prev, cv_file: 'Il file deve essere inferiore a 10MB' }))
        return
      }

      setFormData(prev => ({ ...prev, cv_file: file }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    setLoading(true)
    setErrors({})
    try {
      let cvUrl = formData.cv_url

      // Upload CV if file is provided
      if (formData.cv_file) {
        const tempCandidateId = candidate?.id || `temp-${Date.now()}`
        const { url, error: uploadError } = await storageHelpers.uploadCV(formData.cv_file, tempCandidateId)
        if (uploadError) {
          throw new Error('Errore durante l\'upload del CV')
        }
        cvUrl = url || ''
      }

      // Crea o aggiorna candidato
      const candidateData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        experience_level: formData.experience_level,
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        cv_url: cvUrl,
        skills: formData.skills,
        status: candidate?.status ?? 'new',
        recruiter_id: userId
      }

      let result
      if (candidate?.id) {
        // Modal in modalità modifica: aggiorna candidato
        result = await dbHelpers.updateCandidate(candidate.id, candidateData)
      } else {
        // Modal in modalità aggiunta: crea nuovo candidato
        result = await dbHelpers.addCandidate(candidateData)
      }

      const { data: savedCandidate, error } = result

      if (error) {
        throw new Error(error.message)
      }
      if (savedCandidate) {
        onSuccess(savedCandidate)
        onClose()
      }
    } catch (error) {
      console.error('Error adding/updating candidate:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Errore durante il salvataggio del candidato'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {candidate ? 'Modifica Candidato' : 'Aggiungi Nuovo Candidato'}
            </h2>
            <p className="text-sm text-gray-600">
              Compila le informazioni del candidato
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Errore:</span>
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome completo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.full_name ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="Es. Mario Rossi"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.email ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="mario.rossi@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="+39 123 456 7890"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Posizione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Posizione *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.position ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="Es. Frontend Developer"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>

            {/* Livello esperienza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                Livello di Esperienza
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value as ExperienceLevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Località */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Località
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Es. Milano, Italia"
              />
            </div>

            {/* CV Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                CV (PDF)
              </label>
              <div
                className={clsx(
                  'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : errors.cv_file
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {formData.cv_file ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileText className="h-6 w-6" />
                    <span className="font-medium">{formData.cv_file.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      Trascina qui il CV o{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 font-medium hover:text-blue-700"
                      >
                        scegli file
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">Solo PDF, max 10MB</p>
                  </div>
                )}
              </div>
              {errors.cv_file && (
                <p className="mt-1 text-sm text-red-600">{errors.cv_file}</p>
              )}
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competenze
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Es. React, JavaScript, Python..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aggiungi
                </button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Note aggiuntive sul candidato..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors',
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {candidate ? 'Salvataggio...' : 'Aggiunta in corso...'}
                </div>
              ) : (
                candidate ? 'Salva Modifiche' : 'Aggiungi Candidato'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCandidateModal
