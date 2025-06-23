import { createClient } from '../utils/supabase/client'

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export { createClient };