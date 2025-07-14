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

  type UserWithTerm = {
    name: string
    role: string
    term: {
      id: string
      name: string
    } | null
  }

  const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role, name, term:term_id(name, id)')
      .eq('id', user.id)
      .single<UserWithTerm>()
  console.log('User data:', userData)
  if (dbError || !userData){
    console.error('Error fetching user data:', dbError,userData)
    return null
  }

  return {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || 'student',
    termId: userData.term?.id || null,
    termName: userData.term?.name || null,
    name: userData.name || null,
  }
}
