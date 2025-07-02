import { supabase } from '../utils/supabase/client'

export async function getUserWithRole() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) return null

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  return {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || 'student',
  }
}
