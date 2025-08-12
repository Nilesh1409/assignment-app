'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function updateSubmissionGrading(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  const submissionId = formData.get('submissionId') as string
  const assignmentType = formData.get('assignmentType') as string
  const rating = formData.get('rating') as string
  const feedback = formData.get('feedback') as string
  const status = formData.get('status') as string // for exams: 'pass' or 'fail'

  const db = await getDatabase()
  
  const updateData: any = {
    gradedAt: new Date(),
    gradedBy: session.name
  }

  if (assignmentType === 'exam') {
    updateData.status = status
    updateData.rating = rating ? parseInt(rating) : null
  } else {
    updateData.rating = rating ? parseInt(rating) : null
    updateData.feedback = feedback
  }

  await db.collection('submissions').updateOne(
    { _id: new ObjectId(submissionId) },
    { $set: updateData }
  )
}
