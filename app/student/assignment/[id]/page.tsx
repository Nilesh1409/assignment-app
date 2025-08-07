import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import AssignmentView from './assignment-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()
  
  if (!session || session.role !== 'student') {
    redirect('/student/login')
  }

  const db = await getDatabase()
  
  try {
    const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(id) })
    
    if (!assignment) {
      redirect('/student/dashboard')
    }

    // Check if assignment is visible
    const now = new Date()
    if (new Date(assignment.visibleFrom) > now) {
      redirect('/student/dashboard')
    }

    // Get existing submission
    const submission = await db.collection('submissions').findOne({
      assignmentId: new ObjectId(id),
      studentId: session.studentId
    })

    return (
      <AssignmentView 
        assignment={{
          _id: assignment._id.toString(),
          title: assignment.title,
          description: assignment.description,
          type: assignment.type,
          deadline: assignment.deadline.toISOString(),
          timeLimit: assignment.timeLimit
        }} 
        submission={submission ? {
          _id: submission._id.toString(),
          content: submission.content,
          submittedAt: submission.submittedAt.toISOString()
        } : null}
        student={{
          name: session.name || 'Student',
          studentId: session.studentId || ''
        }}
      />
    )
  } catch {
    redirect('/student/dashboard')
  }
}
