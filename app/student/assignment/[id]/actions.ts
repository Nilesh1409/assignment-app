'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function submitAssignmentAction(formData: FormData) {
  const session = await getSession()
  
  if (!session || session.role !== 'student') {
    redirect('/student/login')
  }

  const assignmentId = formData.get('assignmentId') as string
  const content = formData.get('content') as string
  const studentId = formData.get('studentId') as string

  if (!assignmentId || !content || !studentId) {
    return
  }

  const db = await getDatabase()
  
  // Check if already submitted
  const existingSubmission = await db.collection('submissions').findOne({
    assignmentId: new ObjectId(assignmentId),
    studentId: studentId
  })

  if (existingSubmission) {
    redirect(`/student/assignment/${assignmentId}`)
  }

  // Create submission
  await db.collection('submissions').insertOne({
    assignmentId: new ObjectId(assignmentId),
    studentId: studentId,
    studentName: session.name,
    content: content,
    submittedAt: new Date()
  })

  redirect(`/student/assignment/${assignmentId}`)
}
