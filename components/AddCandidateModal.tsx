'use client'

import React from 'react'
import { 
  X, 
  Upload, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  DollarSign,
  MessageSquare,
  Plus,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react'
import { clsx } from 'clsx'
import type { 
  AddCandidateModalProps, 
  AddCandidateForm, 
  CandidateStatus, 
  ExperienceLevel,
  Candidate 
} from '../types'
import { storageHelpers, dbHelpers } from '../lib/supabase'

interface ExtendedAddCandidateModalProps extends AddCandidateModalProps {
  candidate?: Candidate // For edit mode
  userId: string
}

export function AddCandidateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  candidate, 
  userId 
}: ExtendedAddCandidateModalProps) {
  const [formData, setFormData] = React.useState<AddCandidateForm>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience_level: 'mid',
    status: 'new',
    notes: '',
    salary_expectation: undefined,
    location: '',
    skills: [],
    cv_file: undefined
  })
  
  const [errors, setErrors] = React.useState<Partial<AddCandidateForm>>({})
  const [loading, setLoading] = React.useState(false)
  const [cvPreview, setCvPreview] = React.useState<string | null>(null)
  const [skillInput, setSkillInput] = React.useState('')

  const isEditMode = Boolean(candidate)

  // Initialize form with candidate data for edit mode
  React.useEffect(() => {
    if (candidate && isOpen) {
      setFormData({
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone || '',
        position: candidate.position,
        experience_level: candidate.experience_level,
        status: candidate.status,
        notes: candidate.notes || '',
        salary_expectation: candidate.salary_expectation,
        location: candidate.location || '',
        skills: candidate.skills,
        cv_file: undefined
      })
      setCvPreview(candidate.cv_url || null)
    } else if (!candidate && isOpen) {
      // Reset form for add mode
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        experience_level: 'mid',
        status: 'new',
        notes: '',
        salary_expectation: undefined,
        location: '',
        skills: [],
        cv_file: undefined
      })
      setCvPreview(null)
    }
    setErrors({})
    setSkillInput('')
  }, [candidate, isOpen])

  // Handle form field changes
  const handleChange = (field: keyof AddCandidateForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
      setErrors(prev => ({ ...prev, cv_file: undefined }))
    }
  }

  // Handle skill addition
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

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<AddCandidateForm> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo è richiesto'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email è richiesta'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Posizione è richiesta'
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido'
    }

    if (formData.salary_expectation && formData.salary_expectation < 0) {
      newErrors.salary_expectation = 'La retribuzione deve essere positiva'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      let cvUrl = cvPreview

      // Upload CV if a new file was selected
      if (formData.cv_file) {
        const tempId = candidate?.id || `temp-${Date.now()}`
        const uploadResult = await storageHelpers.uploadCV(formData.cv_file, tempId)
        
        if (uploadResult.error) {
          throw new Error(`Errore upload CV: ${uploadResult.error.message}`)
        }
        
        cvUrl = uploadResult.url
      }

      // Prepare candidate data
      const candidateData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        position: formData.position.trim(),
        experience_level: formData.experience_level,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        salary_expectation: formData.salary_expectation || undefined,
        location: formData.location.trim() || undefined,
        skills: formData.skills,
        cv_url: cvUrl || undefined,
        recruiter_id: userId
      }

      let result
      if (isEditMode && candidate) {
        // Update existing candidate
        result = await dbHelpers.updateCandidate(candidate.id, candidateData)
      } else {
        // Create new candidate
        result = await dbHelpers.addCandidate(candidateData)
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ 
        full_name: error instanceof Error 
          ? error.message 
          : 'Si è verificato un errore durante il salvataggio' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-secondary-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">
                {isEditMode ? 'Modifica Candidato' : 'Aggiungi Candidato'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-secondary-900">
                  <User className="h-5 w-5 text-primary-600" />
                  Informazioni Personali
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Nome Completo"
                    icon={<User className="h-4 w-4" />}
                    required
                    error={errors.full_name}
                  >
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      className="form-input"
                      placeholder="Mario Rossi"
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    icon={<Mail className="h-4 w-4" />}
                    required
                    error={errors.email}
                  >
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="form-input"
                      placeholder="mario.rossi@email.com"
                    />
                  </FormField>

                  <FormField
                    label="Telefono"
                    icon={<Phone className="h-4 w-4" />}
                    error={errors.phone}
                  >
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="form-input"
                      placeholder="+39 123 456 7890"
                    />
                  </FormField>

                  <FormField
                    label="Località"
                    icon={<MapPin className="h-4 w-4" />}
                    error={errors.location}
                  >
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="form-input"
                      placeholder="Milano, Italia"
                    />
                  </FormField>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-secondary-900">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  Informazioni Professionali
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Posizione"
                    icon={<Briefcase className="h-4 w-4" />}
                    required
                    error={errors.position}
                  >
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      className="form-input"
                      placeholder="Frontend Developer"
                    />
                  </FormField>

                  <FormField
                    label="Livello Esperienza"
                    error={errors.experience_level}
                  >
                    <select
                      value={formData.experience_level}
                      onChange={(e) => handleChange('experience_level', e.target.value as ExperienceLevel)}
                      className="form-input"
                    >
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead/Manager</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Stato"
                    error={errors.status}
                  >
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as CandidateStatus)}
                      className="form-input"
                    >
                      <option value="new">Nuovo</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Colloquio</option>
                      <option value="offer">Offerta</option>
                      <option value="hired">Assunto</option>
                      <option value="rejected">Scartato</option>
                    </select>
                  </FormField>

                  <FormField
                    label="RAL Richiesta (€)"
                    icon={<DollarSign className="h-4 w-4" />}
                    error={errors.salary_expectation}
                  >
                    <input
                      type="number"
                      value={formData.salary_expectation || ''}
                      onChange={(e) => handleChange('salary_expectation', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="form-input"
                      placeholder="50000"
                      min="0"
                    />
                  </FormField>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-secondary-900">
                  Competenze
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="form-input flex-1"
                      placeholder="Aggiungi competenza (es. React, TypeScript)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-primary-700 hover:bg-primary-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-secondary-900">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Curriculum Vitae
                </h3>
                
                <CVUpload
                  file={formData.cv_file}
                  currentUrl={cvPreview}
                  onFileChange={handleFileChange}
                  error={errors.cv_file}
                />
              </div>

              {/* Notes */}
              <FormField
                label="Note"
                icon={<MessageSquare className="h-4 w-4" />}
                error={errors.notes}
              >
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="form-input min-h-[100px] resize-none"
                  placeholder="Note aggiuntive sul candidato..."
                />
              </FormField>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                disabled={loading}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {isEditMode ? 'Aggiorna' : 'Aggiungi'} Candidato
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Form field component
interface FormFieldProps {
  label: string
  icon?: React.ReactNode
  required?: boolean
  error?: string
  children: React.ReactNode
}

function FormField({ label, icon, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-secondary-700">
        <span className="flex items-center gap-2">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// CV Upload component
interface CVUploadProps {
  file?: File
  currentUrl?: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

function CVUpload({ file, currentUrl, onFileChange, error }: CVUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          error
            ? 'border-red-300 bg-red-50'
            : 'border-secondary-300 bg-secondary-50 hover:border-primary-400 hover:bg-primary-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-8 w-8 text-secondary-400 mb-2" />
        
        {file ? (
          <div>
            <p className="text-sm font-medium text-secondary-900">{file.name}</p>
            <p className="text-xs text-secondary-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : currentUrl ? (
          <div>
            <p className="text-sm font-medium text-secondary-900">CV già caricato</p>
            <p className="text-xs text-secondary-500">Clicca per sostituire</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-secondary-900">
              Carica CV (PDF)
            </p>
            <p className="text-xs text-secondary-500">
              Clicca o trascina per caricare il file
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// Additional styles for form inputs
const formInputStyles = `
  .form-input {
    @apply w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 placeholder-secondary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20;
  }
`

export default AddCandidateModal
