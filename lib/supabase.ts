import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database, Candidate, User, UserRole } from '../types'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client component client
export const createClientSupabase = () => createClientComponentClient<Database>()

// Auth helpers (client-side only)
export const authHelpers = {
  async signInAnonymously(userRole: UserRole) {
    // Login con utenti reali già registrati in Supabase
    const credentials: Record<UserRole, { email: string; password: string }> = {
      manager: {
        email: 'simone.capo@yahoo.it',
        password: '1234'
      },
      recruiter: {
        email: 'carmen.durante@hotmail.it',
        password: '1234'
      },
      admin: {
        email: 'admin@distrettomagnani.it',
        password: '1234'
      },
      guest: {
        email: 'guest@distrettomagnani.it',
        password: '1234'
      }
    }

    const { email, password } = credentials[userRole]

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('LOGIN ERROR:', error.message)
      return { user: null, error }
    }

    console.log('LOGIN:', data)

    return { user: data.user, error: null }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
}

// Database helpers
export const dbHelpers = {
  // Candidates
  async getCandidates(filters?: {
    recruiterId?: string
    status?: string[]
    experienceLevel?: string[]
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.recruiterId) {
      query = query.eq('recruiter_id', filters.recruiterId)
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.experienceLevel && filters.experienceLevel.length > 0) {
      query = query.in('experience_level', filters.experienceLevel)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  async addCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidate)
      .select()
      .single()
    
    return { data, error }
  },

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteCandidate(id: string) {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // KPI calculations
  async getKPIData(recruiterId?: string) {
    let query = supabase.from('candidates').select('status, created_at')
    
    if (recruiterId) {
      query = query.eq('recruiter_id', recruiterId)
    }

    const { data, error } = await query

    if (error) return { data: null, error }

    // Calculate KPIs
    const totalCandidates = data.length
    const newCandidates = data.filter(c => c.status === 'new').length
    const activeInterviews = data.filter(c => c.status === 'interview').length
    const hired = data.filter(c => c.status === 'hired').length
    
    // Calculate this month's new candidates
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newThisMonth = data.filter(c => 
      new Date(c.created_at) >= thisMonth
    ).length

    const conversionRate = totalCandidates > 0 ? (hired / totalCandidates) * 100 : 0

    return {
      data: {
        totalCandidates,
        newCandidates: newThisMonth,
        activeInterviews,
        hired,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      error: null
    }
  },

  // Monthly chart data
  async getMonthlyData(recruiterId?: string) {
    let query = supabase
      .from('candidates')
      .select('status, created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    if (recruiterId) {
      query = query.eq('recruiter_id', recruiterId)
    }

    const { data, error } = await query

    if (error) return { data: null, error }

    // Group by month
    const monthlyStats: { [key: string]: { candidates: number; hired: number; interviews: number } } = {}

    data.forEach(candidate => {
      const month = new Date(candidate.created_at).toISOString().slice(0, 7) // YYYY-MM
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = { candidates: 0, hired: 0, interviews: 0 }
      }
      
      monthlyStats[month].candidates++
      
      if (candidate.status === 'hired') {
        monthlyStats[month].hired++
      }
      
      if (candidate.status === 'interview') {
        monthlyStats[month].interviews++
      }
    })

    // Convert to array and sort
    const chartData = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        ...stats
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return { data: chartData, error: null }
  }
}

// Storage helpers
export const storageHelpers = {
  async uploadCV(file: File, candidateId: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${candidateId}-${Date.now()}.${fileExt}`
    const filePath = `cvs/${fileName}`

    const { data, error } = await supabase.storage
      .from('candidate-files')
      .upload(filePath, file)

    if (error) return { url: null, error }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('candidate-files')
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  },

  async deleteCV(url: string) {
    // Extract file path from URL
    const urlParts = url.split('/')
    const filePath = urlParts.slice(-2).join('/')

    const { error } = await supabase.storage
      .from('candidate-files')
      .remove([filePath])

    return { error }
  },

  getPublicUrl(path: string) {
    const { data } = supabase.storage
      .from('candidate-files')
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}

export default supabase
