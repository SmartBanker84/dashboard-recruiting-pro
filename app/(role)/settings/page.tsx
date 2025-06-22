'use client'

import { authHelpers } from '@/lib/supabase'
import { getUserProfile, updateUserProfile } from '@/lib/supabase/profile'
import { Loader, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setUserId(null)
      const { user } = await authHelpers.getCurrentUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)
      const data = await getUserProfile(user.id)
      setProfile(data)
      setForm({ name: data?.full_name || '', email: data?.email || '' })
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    await updateUserProfile(userId, {
      full_name: form.name,
      email: form.email,
    })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-40"><Loader className="animate-spin" /></div>

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Impostazioni profilo</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            name="name"
            className="input input-bordered w-full"
            value={form.name}
            onChange={handleChange}
            disabled={saving}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            className="input input-bordered w-full"
            value={form.email}
            onChange={handleChange}
            disabled={saving}
            type="email"
          />
        </div>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4" /> Salva
        </button>
        {success && <div className="text-green-600 text-sm">Profilo aggiornato!</div>}
      </div>
    </div>
  )
}
