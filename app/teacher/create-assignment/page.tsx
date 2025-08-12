import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import CreateAssignmentForm from './create-assignment-form'

export default async function CreateAssignment({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession()
  
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  return <CreateAssignmentForm error={searchParams.error} />
}
