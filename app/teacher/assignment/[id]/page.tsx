import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, FileText, Clock, BookOpen, User } from 'lucide-react'

export default async function TeacherAssignmentView({ params }: { params: { id: string } }) {
  const session = await getSession()
  
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  const db = await getDatabase()
  
  try {
    const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(params.id) })
    
    if (!assignment) {
      redirect('/teacher/dashboard')
    }

    // Get submissions for this assignment
    const submissions = await db.collection('submissions')
      .find({ assignmentId: new ObjectId(params.id) })
      .sort({ submittedAt: -1 })
      .toArray()

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/teacher/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {assignment.type === 'assignment' && <FileText className="w-5 h-5" />}
                      {assignment.type === 'quiz' && <Clock className="w-5 h-5" />}
                      {assignment.type === 'exam' && <BookOpen className="w-5 h-5" />}
                      {assignment.title}
                    </CardTitle>
                    <CardDescription>
                      Created: {new Date(assignment.createdAt).toLocaleString()} • 
                      Visible From: {new Date(assignment.visibleFrom).toLocaleString()} • 
                      Deadline: {new Date(assignment.deadline).toLocaleString()}
                      {assignment.timeLimit && ` • Time Limit: ${assignment.timeLimit} minutes`}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {assignment.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Description:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Submissions ({submissions.length})
                </CardTitle>
                <CardDescription>
                  View all student submissions for this assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No submissions yet</p>
                    <p className="text-sm">Students haven't submitted their work yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission: any) => (
                      <div key={submission._id.toString()} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{submission.studentName}</h4>
                            <p className="text-sm text-gray-600">
                              Student ID: {submission.studentId} • 
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="default">Submitted</Badge>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium mb-2">Submission:</h5>
                          <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect('/teacher/dashboard')
  }
}
