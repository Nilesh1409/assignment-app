'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { parseLocalDateTime } from '@/lib/utils'

export async function createAssignmentAction(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const deadline = formData.get('deadline') as string
  const visibleFrom = formData.get('visibleFrom') as string

  if (!title || !description || !deadline || !visibleFrom) {
    redirect('/teacher/create-assignment?error=missing-fields')
  }

  const db = await getDatabase()
  
  await db.collection('assignments').insertOne({
    title,
    description,
    type: 'assignment',
    deadline: parseLocalDateTime(deadline),
    visibleFrom: parseLocalDateTime(visibleFrom),
    createdAt: new Date(),
    createdBy: session.name,
    rating: null,
    feedback: null
  })

  redirect('/teacher/dashboard')
}
