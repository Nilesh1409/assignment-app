import { redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Clock, BookOpen, LogOut, Calendar, AlertTriangle, CheckCircle, TrendingUp, Timer } from 'lucide-react'

interface Assignment {
  _id: string
  title: string
  description: string
  type: 'assignment' | 'quiz' | 'exam'
  deadline: Date
  timeLimit?: number
}

async function logoutAction() {
  'use server'
  await destroySession()
  redirect('/')
}

function getDeadlineStatus(deadline: Date, now: Date) {
  const timeDiff = deadline.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

  if (timeDiff <= 0) return { status: 'overdue', color: 'destructive', text: 'Overdue' }
  if (hoursDiff <= 24) return { status: 'urgent', color: 'destructive', text: `${Math.ceil(hoursDiff)}h left` }
  if (daysDiff <= 3) return { status: 'warning', color: 'orange', text: `${Math.ceil(daysDiff)}d left` }
  if (daysDiff <= 7) return { status: 'soon', color: 'yellow', text: `${Math.ceil(daysDiff)}d left` }
  return { status: 'normal', color: 'secondary', text: `${Math.ceil(daysDiff)}d left` }
}

function CountdownTimer({ deadline }: { deadline: Date }) {
  const now = new Date()
  const timeDiff = deadline.getTime() - now.getTime()
  
  if (timeDiff <= 0) return <span className="text-red-600 font-semibold">Overdue</span>
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return <span className="font-semibold">{days}d {hours}h</span>
  } else if (hours > 0) {
    return <span className="font-semibold text-orange-600">{hours}h {minutes}m</span>
  } else {
    return <span className="font-semibold text-red-600">{minutes}m left</span>
  }
}

export default async function StudentDashboard() {
  const session = await getSession()
  
  if (!session || session.role !== 'student') {
    redirect('/student/login')
  }

  const db = await getDatabase()
  const now = new Date()
  
  // Get visible assignments (where visibleFrom <= now)
  const assignments = await db.collection('assignments')
    .find({ visibleFrom: { $lte: now } })
    .sort({ deadline: 1 })
    .toArray()

  // Get submissions for this student
  const submissions = await db.collection('submissions')
    .find({ studentId: session.studentId })
    .toArray()

  const submissionMap = new Map(submissions.map(sub => [sub.assignmentId.toString(), sub]))

  // Calculate statistics
  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter(a => submissionMap.has(a._id.toString())).length
  const pendingAssignments = totalAssignments - completedAssignments
  const overdueAssignments = assignments.filter(a => {
    const isSubmitted = submissionMap.has(a._id.toString())
    const isOverdue = new Date(a.deadline) < now
    return !isSubmitted && isOverdue
  }).length

  // Get upcoming deadlines (next 7 days)
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = assignments
    .filter(a => {
      const deadline = new Date(a.deadline)
      const isSubmitted = submissionMap.has(a._id.toString())
      return !isSubmitted && deadline > now && deadline <= weekFromNow
    })
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {session.name}!</p>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Assignments</p>
                    <p className="text-3xl font-bold">{totalAssignments}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">{completedAssignments}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold">{pendingAssignments}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Overdue</p>
                    <p className="text-3xl font-bold">{overdueAssignments}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Timer className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Don&apos;t miss these upcoming assignments!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.map((assignment: any) => {
                    const deadline = new Date(assignment.deadline)
                    const deadlineStatus = getDeadlineStatus(deadline, now)
                    
                    return (
                      <div key={assignment._id.toString()} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          {assignment.type === 'assignment' && <FileText className="w-4 h-4 text-blue-600" />}
                          {assignment.type === 'quiz' && <Clock className="w-4 h-4 text-purple-600" />}
                          {assignment.type === 'exam' && <BookOpen className="w-4 h-4 text-red-600" />}
                          <span className="font-medium">{assignment.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CountdownTimer deadline={deadline} />
                          <Badge 
                            variant={deadlineStatus.color === 'orange' ? 'secondary' : deadlineStatus.color as any}
                            className={deadlineStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                          >
                            {deadlineStatus.text}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignments List */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Available Assignments
              </CardTitle>
              <CardDescription className="text-blue-100">
                Complete your assignments, quizzes, and exams before the deadline
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No assignments available yet</p>
                  <p className="text-sm">Check back later for new assignments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment: any) => {
                    const submission = submissionMap.get(assignment._id.toString())
                    const deadline = new Date(assignment.deadline)
                    const isOverdue = deadline < now
                    const isSubmitted = !!submission
                    const deadlineStatus = getDeadlineStatus(deadline, now)
                    
                    return (
                      <div 
                        key={assignment._id.toString()} 
                        className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                          isSubmitted ? 'border-green-200 bg-green-50' :
                          isOverdue ? 'border-red-200 bg-red-50' :
                          deadlineStatus.status === 'urgent' ? 'border-red-300 bg-red-50' :
                          deadlineStatus.status === 'warning' ? 'border-orange-300 bg-orange-50' :
                          'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-xl text-gray-900">{assignment.title}</h3>
                              <div className="flex gap-2">
                                {assignment.type === 'assignment' && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Assignment
                                  </Badge>
                                )}
                                {assignment.type === 'quiz' && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Quiz
                                  </Badge>
                                )}
                                {assignment.type === 'exam' && (
                                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Exam
                                  </Badge>
                                )}
                                {isSubmitted && (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Submitted
                                  </Badge>
                                )}
                                {!isSubmitted && (
                                  <Badge 
                                    variant={deadlineStatus.color === 'orange' ? 'secondary' : deadlineStatus.color as any}
                                    className={
                                      deadlineStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                      deadlineStatus.status === 'urgent' ? 'bg-red-100 text-red-800 border-red-300' :
                                      deadlineStatus.status === 'warning' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                      ''
                                    }
                                  >
                                    {deadlineStatus.status === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                    {deadlineStatus.text}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-base mb-4 leading-relaxed">{assignment.description}</p>
                            <div className="flex gap-6 text-sm text-gray-600">
                              <span className="flex items-center gap-2 font-medium">
                                <Calendar className="w-4 h-4" />
                                Deadline: {deadline.toLocaleString()}
                              </span>
                              {assignment.timeLimit && (
                                <span className="flex items-center gap-2 font-medium">
                                  <Clock className="w-4 h-4" />
                                  Time Limit: {assignment.timeLimit} minutes
                                </span>
                              )}
                            </div>
                            {isSubmitted && (
                              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                                <p className="text-sm text-green-800 font-medium">
                                  ✅ Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                            {!isSubmitted && deadlineStatus.status === 'urgent' && (
                              <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Urgent: Less than 24 hours remaining!
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-6">
                            {!isSubmitted && !isOverdue && (
                              <Link href={`/student/assignment/${assignment._id}`}>
                                <Button 
                                  size="lg"
                                  className={`${
                                    deadlineStatus.status === 'urgent' ? 'bg-red-600 hover:bg-red-700' :
                                    deadlineStatus.status === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                                    'bg-blue-600 hover:bg-blue-700'
                                  } text-white`}
                                >
                                  {assignment.type === 'assignment' ? 'Submit' : 'Start'}
                                </Button>
                              </Link>
                            )}
                            {isSubmitted && (
                              <Link href={`/student/assignment/${assignment._id}`}>
                                <Button variant="outline" size="lg" className="border-green-300 text-green-700 hover:bg-green-50">
                                  View Submission
                                </Button>
                              </Link>
                            )}
                            {isOverdue && !isSubmitted && (
                              <Button disabled size="lg" className="bg-gray-400 text-gray-600">
                                Overdue
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
