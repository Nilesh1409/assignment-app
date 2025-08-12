import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import CreateQuizForm from './create-quiz-form'

export default async function CreateQuiz({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession()
  
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  return <CreateQuizForm error={searchParams.error} />
}
