import { cookies } from 'next/headers'

export interface User {
  _id?: string
  name: string
  role: 'teacher' | 'student'
  mobile?: string
  studentId?: string
}

export async function createSession(user: User) {
  const cookieStore = await cookies()
  cookieStore.set('session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    if (!session) return null
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function authenticateTeacher(mobile: string): Promise<User | null> {
  if (mobile === '9137831800') {
    const user: User = {
      name: 'Teacher',
      role: 'teacher',
      mobile: mobile
    }
    return user
  }
  return null
}

export async function authenticateStudent(name: string, studentId: string): Promise<User | null> {
  if (name.toLowerCase() === 'pratibha' && studentId === 'mongodb') {
    const user: User = {
      name: 'Pratibha',
      role: 'student',
      studentId: studentId
    }
    return user
  }
  return null
}
