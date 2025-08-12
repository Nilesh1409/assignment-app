import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText, Clock, BookOpen, LogOut } from 'lucide-react'
import { destroySession } from '@/lib/auth'

async function logoutAction() {
  'use server'
  await destroySession()
  redirect('/')
}

export default async function TeacherDashboard() {
  const session = await getSession()
  
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  const db = await getDatabase()
  const assignments = await db.collection('assignments').find({}).sort({ createdAt: -1 }).toArray()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {session.name}</span>
            <form action={logoutAction}>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/teacher/create-assignment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Create Assignment</CardTitle>
                <CardDescription>Create new assignments with deadlines</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/teacher/create-quiz">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Create Quiz</CardTitle>
                <CardDescription>Create timed quizzes for students</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/teacher/create-exam">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Create Exam</CardTitle>
                <CardDescription>Create timed exams with strict deadlines</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Latest Assignments</CardTitle>
            <CardDescription>Manage your created assignments, quizzes, and exams (sorted by newest first)</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No assignments created yet</p>
                <p className="text-sm">Create your first assignment to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment._id.toString()} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Type: {assignment.type}</span>
                          <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
                          {assignment.timeLimit && <span>Time Limit: {assignment.timeLimit} minutes</span>}
                          <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link href={`/teacher/assignment/${assignment._id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
