'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase' // Assicurati che questo path sia corretto

export function createSSRClient() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export async function getUser() {
  const supabase = createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}