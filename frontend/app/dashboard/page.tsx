"use client"
import { redirect } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Server Component: decide where to send the user based on role
// For now, we use a simple mock that reads a cookie `role` if present, otherwise defaults to "student".
// Valid roles: 'student' | 'mentor' | 'organization' | 'admin'
export default function Page() {
  const { user } = useAuth()
  const role : 'student' | 'mentor' | 'organization' | 'admin' = user?.role as 'student' | 'mentor' | 'organization' | 'admin'

  // Redirect to role-specific dashboard
  if (role === 'admin') {
    redirect('/admin')
  }

  redirect(`/dashboard/${role}`)
}

