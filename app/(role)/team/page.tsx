'use client'

import { useEffect, useState } from 'react'
import { getTeamMembers, inviteTeamMember } from '@/lib/supabase/team'
import { Users, Loader, Mail, Plus } from 'lucide-react'

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getTeamMembers().then(data => {
      setTeam(data || [])
      setLoading(false)
    })
  }, [])

  const handleInvite = async () => {
    setInviting(true)
    await inviteTeamMember(inviteEmail)
    setInviteEmail('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setInviting(false)
    // Optionally reload team
    setLoading(true)
    setTeam(await getTeamMembers())
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-primary-600" />
        Team e Collaboratori
      </h1>
      <div className="mb-8 flex gap-2">
        <input
          type="email"
          className="input input-bordered flex-1"
          placeholder="Email collaboratore"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          disabled={inviting}
        />
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={handleInvite}
          disabled={inviting || !inviteEmail}
        >
          <Plus className="h-4 w-4" /> Invita
        </button>
      </div>
      {success && <div className="text-green-600 text-sm mb-4">Invito inviato!</div>}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader className="animate-spin" /></div>
      ) : (
        <ul className="space-y-3">
          {team.map((member, i) => (
            <li key={i} className="rounded-xl bg-white p-4 shadow flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary-500" />
              <span className="font-medium">{member.name || member.email}</span>
              <span className="text-xs text-secondary-400">{member.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
