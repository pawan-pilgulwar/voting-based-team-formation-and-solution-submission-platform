"use server"
import { cookies } from 'next/headers'

export async function getUserRole(): Promise<'student' | 'mentor' | 'organization' | 'admin'> {
    const cookieStore = await cookies()
    const roleCookie = cookieStore.get('role')?.value

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
}
