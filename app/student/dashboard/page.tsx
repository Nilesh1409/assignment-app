import { redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/ui/markdown'
import { formatDisplayDateTime } from '@/lib/utils'
import Link from 'next/link'
import { FileText, Clock, BookOpen, LogOut, Calendar, AlertTriangle, CheckCircle, TrendingUp, Timer, Star, Award, Trophy, Target, BookMarked, GraduationCap } from 'lucide-react'

interface Assignment {
  _id: string
  title: string
  description: string
  type: 'assignment' | 'quiz' | 'exam'
  deadline: string
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
  
  // Get visible assignments (where visibleFrom <= now), sorted by creation date (latest first)
  const assignmentsRaw = await db.collection('assignments')
    .find({ visibleFrom: { $lte: now } })
    .sort({ createdAt: -1 })
    .toArray()
  
  // Convert Date objects to ISO strings for consistent handling
  const assignments = assignmentsRaw.map(assignment => ({
    ...assignment,
    _id: assignment._id.toString(),
    deadline: assignment.deadline.toISOString()
  }))

  // Get submissions for this student
  const submissions = await db.collection('submissions')
    .find({ studentId: session.studentId })
    .toArray()

  const submissionMap = new Map(submissions.map(sub => [sub.assignmentId.toString(), sub]))

  // Calculate statistics
  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter(a => submissionMap.has(a._id)).length
  const pendingAssignments = totalAssignments - completedAssignments
  const overdueAssignments = assignments.filter(a => {
    const isSubmitted = submissionMap.has(a._id)
    const isOverdue = new Date(a.deadline) < now
    return !isSubmitted && isOverdue
  }).length

  // Calculate average rating
  const gradedSubmissions = submissions.filter(sub => sub.rating)
  const averageRating = gradedSubmissions.length > 0 
    ? (gradedSubmissions.reduce((sum, sub) => sum + sub.rating, 0) / gradedSubmissions.length).toFixed(1)
    : null

  // Calculate completion rate
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

  // Get upcoming deadlines (next 7 days)
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = assignments
    .filter(a => {
      const deadline = new Date(a.deadline)
      const isSubmitted = submissionMap.has(a._id)
      return !isSubmitted && deadline > now && deadline <= weekFromNow
    })
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with Student Info */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-blue-100/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
          <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  Student Portal
            </h1>
                <p className="text-gray-600 font-medium">Welcome back, {session.name}!</p>
                <p className="text-sm text-gray-500">ID: {session.studentId}</p>
              </div>
            </div>
            
            {/* Quick Stats in Header */}
            <div className="hidden md:flex items-center gap-6">
              {averageRating && (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-600 font-bold text-lg">
                    <Trophy className="w-5 h-5" />
                    {averageRating}
                  </div>
                  <p className="text-xs text-gray-500">Avg. Rating</p>
                </div>
              )}
              <div className="text-center">
                <div className="text-blue-600 font-bold text-lg">{completionRate}%</div>
                <p className="text-xs text-gray-500">Completed</p>
          </div>
          <form action={logoutAction}>
                <Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-300 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total</p>
                    <p className="text-4xl font-bold">{totalAssignments}</p>
                    <p className="text-blue-200 text-xs mt-1">Assignments</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <BookMarked className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-600 to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-4xl font-bold">{completedAssignments}</p>
                    <p className="text-green-200 text-xs mt-1">{completionRate}% Success</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending</p>
                    <p className="text-4xl font-bold">{pendingAssignments}</p>
                    <p className="text-orange-200 text-xs mt-1">To Complete</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Overdue</p>
                    <p className="text-4xl font-bold">{overdueAssignments}</p>
                    <p className="text-red-200 text-xs mt-1">Missed</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grade Performance Card */}
            {averageRating && (
              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Avg. Grade</p>
                      <p className="text-4xl font-bold">{averageRating}</p>
                      <p className="text-yellow-200 text-xs mt-1">Out of 10</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                      <div key={assignment._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
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
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                Latest Assignments & Assessments
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Complete your assignments, quizzes, and exams before the deadline • Sorted by newest first
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {assignments.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No assignments available yet</h3>
                  <p className="text-gray-400">Check back later for new assignments from your teachers</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {assignments.map((assignment: any) => {
                    const submission = submissionMap.get(assignment._id)
                    const deadline = new Date(assignment.deadline)
                    const isOverdue = deadline < now
                    const isSubmitted = !!submission
                    const deadlineStatus = getDeadlineStatus(deadline, now)
                    
                    return (
                      <Card 
                        key={assignment._id} 
                        className={`transition-all duration-300 hover:shadow-xl border-l-4 ${
                          isSubmitted ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white shadow-green-100' :
                          isOverdue ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white shadow-red-100' :
                          deadlineStatus.status === 'urgent' ? 'border-l-red-400 bg-gradient-to-r from-red-50 to-orange-50 shadow-red-100' :
                          deadlineStatus.status === 'warning' ? 'border-l-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-orange-100' :
                          'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white hover:shadow-blue-100'
                        }`}
                      >
                        <CardContent className="p-7">
                          <div className="flex justify-between items-start gap-6">
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <h3 className="font-bold text-2xl text-gray-900">{assignment.title}</h3>
                                <div className="flex gap-2 flex-wrap">
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
                            
                            {/* Assignment Description Preview */}
                            <div className="mb-6">
                              <div className="bg-white/70 p-4 rounded-lg border border-gray-100">
                                <div className="text-gray-700 leading-relaxed">
                                  {assignment.description.length > 150 ? (
                                    <>
                                      <p className="text-gray-600">
                                        {assignment.description.substring(0, 150)}...
                                      </p>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                                        asChild
                                      >
                                        <Link href={`/student/assignment/${assignment._id}`}>
                                          Read more →
                                        </Link>
                                      </Button>
                                    </>
                                  ) : (
                                    <MarkdownRenderer content={assignment.description} className="text-gray-700" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                              <span className="flex items-center gap-2 font-medium bg-white/60 px-3 py-1 rounded-full">
                                <Calendar className="w-4 h-4" />
                                Deadline: {formatDisplayDateTime(deadline)}
                              </span>
                              {assignment.timeLimit && (
                                <span className="flex items-center gap-2 font-medium bg-white/60 px-3 py-1 rounded-full">
                                  <Clock className="w-4 h-4" />
                                  Time Limit: {assignment.timeLimit} minutes
                                </span>
                              )}
                              <span className="flex items-center gap-2 text-xs text-gray-500 bg-white/60 px-3 py-1 rounded-full">
                                <BookOpen className="w-3 h-3" />
                                Created: {new Date(assignment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {/* Enhanced Submission Status */}
                            {isSubmitted && (
                              <div className="space-y-3">
                                <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-xl p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-green-500 p-2 rounded-full">
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-green-800">Assignment Submitted</p>
                                      <p className="text-sm text-green-700">
                                        Submitted on: {formatDisplayDateTime(submission.submittedAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Enhanced Grading Results */}
                                {(submission.rating || submission.feedback || submission.status) && (
                                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="bg-purple-500 p-2 rounded-full">
                                        <Award className="w-5 h-5 text-white" />
                                      </div>
                                      <h4 className="font-bold text-purple-800 text-lg">Grading Results</h4>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                      {submission.rating && (
                                        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 shadow-lg">
                                          {/* Celebration overlay for high scores */}
                                          {submission.rating >= 8 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-amber-100/20 animate-pulse"></div>
                                          )}
                                          <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-2 rounded-full">
                                                <Star className="w-6 h-6 text-white" />
                                              </div>
                                              <div>
                                                <span className="font-bold text-yellow-800 text-lg">Your Score</span>
                                                {submission.rating >= 9 && (
                                                  <p className="text-xs text-yellow-700 font-medium">🎉 Outstanding!</p>
                                                )}
                                                {submission.rating >= 7 && submission.rating < 9 && (
                                                  <p className="text-xs text-yellow-700 font-medium">⭐ Great work!</p>
                                                )}
                                                {submission.rating >= 5 && submission.rating < 7 && (
                                                  <p className="text-xs text-yellow-700 font-medium">👍 Good job!</p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="text-right">
                                                <div className="flex items-baseline gap-1">
                                                  <span className="text-4xl font-black text-yellow-700">{submission.rating}</span>
                                                  <span className="text-lg text-yellow-600 font-bold">/10</span>
                                                </div>
                                                {submission.rating >= 8 && (
                                                  <div className="flex justify-end mt-1">
                                                    <Trophy className="w-6 h-6 text-yellow-600" />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {submission.status && (
                                        <div className={`border rounded-lg p-3 ${
                                          submission.status === 'pass' 
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200' 
                                            : 'bg-gradient-to-r from-red-100 to-pink-100 border-red-200'
                                        }`}>
                                          <div className="flex items-center gap-3">
                                            {submission.status === 'pass' ? (
                                              <CheckCircle className="w-6 h-6 text-green-600" />
                                            ) : (
                                              <AlertTriangle className="w-6 h-6 text-red-600" />
                                            )}
                                            <span className={`text-xl font-bold uppercase ${
                                              submission.status === 'pass' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                              {submission.status}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {submission.feedback && (
                                        <div className="bg-white border border-blue-200 rounded-lg p-4">
                                          <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium text-blue-800">Teacher Feedback</span>
                                          </div>
                                          <p className="text-blue-700 italic leading-relaxed">
                                            "{submission.feedback}"
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
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
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3 min-w-[140px]">
                            {!isSubmitted && !isOverdue && (
                              <Link href={`/student/assignment/${assignment._id}`}>
                                <Button 
                                  size="lg"
                                  className={`w-full font-semibold text-lg py-3 transition-all duration-300 shadow-lg hover:shadow-xl ${
                                    deadlineStatus.status === 'urgent' ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' :
                                    deadlineStatus.status === 'warning' ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' :
                                    'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                  } text-white`}
                                >
                                  Open
                                </Button>
                              </Link>
                            )}
                            {isSubmitted && (
                              <Link href={`/student/assignment/${assignment._id}`}>
                                <Button 
                                  variant="outline" 
                                  size="lg" 
                                  className="w-full border-2 border-green-400 text-green-700 hover:bg-green-50 hover:border-green-500 font-semibold py-3 transition-all duration-300"
                                >
                                  View Details
                                </Button>
                              </Link>
                            )}
                            {isOverdue && !isSubmitted && (
                              <Button 
                                disabled 
                                size="lg" 
                                className="w-full bg-gray-400 text-gray-600 font-semibold py-3"
                              >
                                Overdue
                              </Button>
                            )}
                          </div>
                        </div>
                        </CardContent>
                      </Card>
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
