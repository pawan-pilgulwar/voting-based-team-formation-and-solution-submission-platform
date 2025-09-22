
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Server Component: decide where to send the user based on role
// For now, we use a simple mock that reads a cookie `role` if present, otherwise defaults to "student".
// Valid roles: 'student' | 'mentor' | 'organization' | 'admin'
export default async function Page() {
  const cookieStore = await cookies()
  const roleCookie = cookieStore.get('role')?.value

  const role = ((): 'student' | 'mentor' | 'organization' | 'admin' => {
    switch (roleCookie) {
      case 'mentor':
        return 'mentor'
      case 'organization':
        return 'organization'
      case 'admin':
        return 'admin'
      case 'student':
      default:
        return 'student'
    }
  })()

  // Redirect to role-specific dashboard
  if (role === 'admin') {
    redirect('/admin')
  }

  redirect(`/dashboard/${role}`)
}

