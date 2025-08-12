import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import CreateExamForm from './create-exam-form'

export default async function CreateExam({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession()
  
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  return <CreateExamForm error={searchParams.error} />
}