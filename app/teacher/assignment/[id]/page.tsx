import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownRenderer } from '@/components/ui/markdown'
import { formatDisplayDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, FileText, Clock, BookOpen, User, Star, CheckCircle, XCircle } from 'lucide-react'
import { updateSubmissionGrading } from './actions'

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
                    Created: {formatDisplayDateTime(assignment.createdAt)} • 
                    Visible From: {formatDisplayDateTime(assignment.visibleFrom)} • 
                    Deadline: {formatDisplayDateTime(assignment.deadline)}
                    {assignment.timeLimit && ` • Time Limit: ${assignment.timeLimit} minutes`}
                  </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {assignment.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Description:</h3>
                  <MarkdownRenderer content={assignment.description} />
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
                  <div className="space-y-6">
                    {submissions.map((submission: any) => (
                      <Card key={submission._id.toString()} className="border-l-4 border-l-blue-400">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{submission.studentName}</h4>
                              <p className="text-sm text-gray-600">
                                Student ID: {submission.studentId} • 
                                Submitted: {formatDisplayDateTime(submission.submittedAt)}
                                {submission.gradedAt && (
                                  <> • Graded: {formatDisplayDateTime(submission.gradedAt)} by {submission.gradedBy}</>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="default">Submitted</Badge>
                              {submission.rating && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  {submission.rating}/10
                                </Badge>
                              )}
                              {submission.status === 'pass' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Pass
                                </Badge>
                              )}
                              {submission.status === 'fail' && (
                                <Badge variant="destructive" className="bg-red-100 text-red-800">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Fail
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium mb-3">Student Submission:</h5>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{submission.content}</p>
                          </div>

                          {submission.feedback && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h5 className="font-medium mb-2 text-blue-800">Teacher Feedback:</h5>
                              <p className="text-blue-700 whitespace-pre-wrap">{submission.feedback}</p>
                            </div>
                          )}

                          {/* Grading Form */}
                          <form action={updateSubmissionGrading} className="border-t pt-4">
                            <input type="hidden" name="submissionId" value={submission._id.toString()} />
                            <input type="hidden" name="assignmentType" value={assignment.type} />
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              {assignment.type === 'exam' ? (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor={`status-${submission._id}`}>Pass/Fail Status</Label>
                                    <select
                                      id={`status-${submission._id}`}
                                      name="status"
                                      defaultValue={submission.status || ''}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                      <option value="">Select Status</option>
                                      <option value="pass">Pass</option>
                                      <option value="fail">Fail</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`rating-${submission._id}`}>Rating (0-10)</Label>
                                    <Input
                                      id={`rating-${submission._id}`}
                                      name="rating"
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      defaultValue={submission.rating || ''}
                                      placeholder="Optional rating"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor={`rating-${submission._id}`}>Rating (out of 10)</Label>
                                    <Input
                                      id={`rating-${submission._id}`}
                                      name="rating"
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      defaultValue={submission.rating || ''}
                                      placeholder="Rate out of 10"
                                    />
                                  </div>
                                  <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor={`feedback-${submission._id}`}>Feedback</Label>
                                    <Textarea
                                      id={`feedback-${submission._id}`}
                                      name="feedback"
                                      defaultValue={submission.feedback || ''}
                                      placeholder="Provide feedback to the student"
                                      rows={3}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="mt-4">
                              <Button type="submit" size="sm">
                                {submission.gradedAt ? 'Update Grading' : 'Save Grading'}
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
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
