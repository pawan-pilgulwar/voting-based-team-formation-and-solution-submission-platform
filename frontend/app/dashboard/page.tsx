
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/getUserRole'

// Server Component: decide where to send the user based on role
// For now, we use a simple mock that reads a cookie `role` if present, otherwise defaults to "student".
// Valid roles: 'student' | 'mentor' | 'organization' | 'admin'
export default async function Page() {
  const role : 'student' | 'mentor' | 'organization' | 'admin' = await getUserRole()

  // Redirect to role-specific dashboard
  if (role === 'admin') {
    redirect('/admin')
  }

  redirect(`/dashboard/${role}`)
}

