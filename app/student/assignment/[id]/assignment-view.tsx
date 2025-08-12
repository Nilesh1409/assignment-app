'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/ui/markdown'
import { formatDisplayDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText, BookOpen, AlertTriangle, CheckCircle, Timer, Save, Star, Award } from 'lucide-react'
import { submitAssignmentAction } from './actions'

interface Assignment {
  _id: string
  title: string
  description: string
  type: 'assignment' | 'quiz' | 'exam'
  deadline: string
  timeLimit?: number
}

interface Submission {
  _id: string
  content: string
  submittedAt: string
  rating?: number
  feedback?: string
  status?: 'pass' | 'fail'
  gradedAt?: string
  gradedBy?: string
}

interface Student {
  name: string
  studentId: string
}

interface Props {
  assignment: Assignment
  submission: Submission | null
  student: Student
}

function getDeadlineStatus(deadline: Date, now: Date) {
  const timeDiff = deadline.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

  if (timeDiff <= 0) return { status: 'overdue', color: 'destructive', text: 'Overdue', bgColor: 'bg-red-50 border-red-200' }
  if (hoursDiff <= 24) return { status: 'urgent', color: 'destructive', text: `${Math.ceil(hoursDiff)}h left`, bgColor: 'bg-red-50 border-red-300' }
  if (daysDiff <= 3) return { status: 'warning', color: 'orange', text: `${Math.ceil(daysDiff)}d left`, bgColor: 'bg-orange-50 border-orange-300' }
  if (daysDiff <= 7) return { status: 'soon', color: 'yellow', text: `${Math.ceil(daysDiff)}d left`, bgColor: 'bg-yellow-50 border-yellow-300' }
  return { status: 'normal', color: 'secondary', text: `${Math.ceil(daysDiff)}d left`, bgColor: 'bg-blue-50 border-blue-200' }
}

function CountdownTimer({ deadline }: { deadline: Date }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  const timeDiff = deadline.getTime() - currentTime.getTime()
  
  if (timeDiff <= 0) return <span className="text-red-600 font-bold">OVERDUE</span>
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
  
  if (days > 0) {
    return <span className="font-bold text-blue-600">{days}d {hours}h {minutes}m</span>
  } else if (hours > 0) {
    return <span className="font-bold text-orange-600">{hours}h {minutes}m {seconds}s</span>
  } else {
    return <span className="font-bold text-red-600 animate-pulse">{minutes}m {seconds}s</span>
  }
}

export default function AssignmentView({ assignment, submission, student }: Props) {
  const [content, setContent] = useState(submission?.content || '')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')

  const isTimedAssignment = assignment.type === 'quiz' || assignment.type === 'exam'
  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const isOverdue = deadline < now
  const isSubmitted = !!submission
  const deadlineStatus = getDeadlineStatus(deadline, now)

  // Auto-save functionality (for non-timed assignments)
  useEffect(() => {
    const submissionContent = submission?.content || ''
    if (!isTimedAssignment && !isSubmitted && content !== submissionContent) {
      const autoSaveTimer = setTimeout(() => {
        // Simulate auto-save (in a real app, you'd save to localStorage or make an API call)
        setAutoSaveStatus('Auto-saved')
        setTimeout(() => setAutoSaveStatus(''), 2000)
      }, 2000)

      return () => clearTimeout(autoSaveTimer)
    }
  }, [content, isTimedAssignment, isSubmitted, submission])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append('assignmentId', assignment._id)
    formData.append('content', content)
    formData.append('studentId', student.studentId)
    
    await submitAssignmentAction(formData)
  }, [isSubmitting, assignment._id, content, student.studentId])

  useEffect(() => {
    if (isTimedAssignment && assignment.timeLimit && isStarted && !isSubmitted) {
      const startTime = Date.now()
      const endTime = startTime + (assignment.timeLimit * 60 * 1000)
      
      const timer = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, endTime - now)
        setTimeLeft(Math.floor(remaining / 1000))
        
        if (remaining <= 0) {
          clearInterval(timer)
          // Auto-submit when time runs out
          handleSubmit()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isStarted, isSubmitted, assignment.timeLimit, isTimedAssignment, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-blue-100/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/student/dashboard">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 transition-colors shadow-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  {assignment.type === 'assignment' && <FileText className="w-6 h-6 text-white" />}
                  {assignment.type === 'quiz' && <Clock className="w-6 h-6 text-white" />}
                  {assignment.type === 'exam' && <BookOpen className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                    {assignment.title}
                  </h1>
                  <p className="text-gray-600 mt-1 font-medium">Student: {student.name} • ID: {student.studentId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Enhanced Deadline countdown */}
              <div className={`p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm ${deadlineStatus.bgColor}`}>
                <div className="text-sm font-bold text-gray-700 mb-1 text-center">Deadline</div>
                <div className="text-center">
                  <CountdownTimer deadline={deadline} />
                </div>
              </div>
              
              {/* Enhanced Timer for timed assignments */}
              {timeLeft !== null && isStarted && !isSubmitted && (
                <div className="p-4 rounded-xl border-2 bg-gradient-to-r from-red-50 to-pink-50 border-red-300 shadow-lg">
                  <div className="flex items-center gap-2 text-lg font-mono">
                    <Timer className="w-6 h-6 text-red-500" />
                    <span className={`font-bold text-xl ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Enhanced Assignment Details Card */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    {assignment.type === 'assignment' && <FileText className="w-8 h-8" />}
                    {assignment.type === 'quiz' && <Clock className="w-8 h-8" />}
                    {assignment.type === 'exam' && <BookOpen className="w-8 h-8" />}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-base">
                      <div className="flex flex-wrap gap-4">
                        <span>📅 Deadline: {formatDisplayDateTime(deadline)}</span>
                        {assignment.timeLimit && <span>⏱️ Time Limit: {assignment.timeLimit} minutes</span>}
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold text-sm px-4 py-2">
                    {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                  </Badge>
                  {isSubmitted && (
                    <Badge className="bg-green-500 text-white border-green-400 font-semibold text-sm px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Submitted
                    </Badge>
                  )}
                  {!isSubmitted && (
                    <Badge 
                      className={`font-semibold text-sm px-4 py-2 ${
                        deadlineStatus.status === 'urgent' ? 'bg-red-500 text-white border-red-400' :
                        deadlineStatus.status === 'warning' ? 'bg-orange-500 text-white border-orange-400' :
                        'bg-blue-500 text-white border-blue-400'
                      }`}
                    >
                      {deadlineStatus.status === 'urgent' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {deadlineStatus.text}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Assignment Instructions
                </h3>
                <MarkdownRenderer content={assignment.description} />
              </div>
            </CardContent>
          </Card>

          {/* Deadline Warning */}
          {!isSubmitted && deadlineStatus.status === 'urgent' && (
            <Card className="border-red-300 bg-red-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-red-800 text-lg">⚠️ URGENT: Deadline Approaching!</h3>
                    <p className="text-red-700 mt-1">
                      Less than 24 hours remaining! Submit your work soon to avoid missing the deadline.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timed Assignment Start Card */}
          {isTimedAssignment && !isStarted && !isSubmitted && !isOverdue && (
            <Card className="border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Timer className="w-8 h-8 text-orange-600" />
                  <h3 className="font-bold text-orange-800 text-2xl">Timed Assessment</h3>
                </div>
                <div className="max-w-md mx-auto">
                  <p className="text-orange-700 mb-6 text-lg">
                    This is a timed {assignment.type} with a <strong>{assignment.timeLimit}-minute</strong> limit. 
                    Once you start, the timer will begin and cannot be paused.
                  </p>
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
                    <p className="text-orange-800 font-medium">⚠️ Important Reminders:</p>
                    <ul className="text-orange-700 text-sm mt-2 space-y-1">
                      <li>• Ensure stable internet connection</li>
                      <li>• Close unnecessary applications</li>
                      <li>• Have all materials ready</li>
                      <li>• Timer cannot be paused once started</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleStart} 
                    size="lg"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg px-8 py-3"
                  >
                    Start {assignment.type === 'quiz' ? 'Quiz' : 'Exam'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer/Submission Card */}
          {(isStarted || !isTimedAssignment || isSubmitted) && (
            <Card className="shadow-lg border-0">
              <CardHeader className={`${isSubmitted ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Your Submission
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Your {assignment.type === 'assignment' ? 'Answer' : 'Response'}
                      </>
                    )}
                  </CardTitle>
                  {autoSaveStatus && (
                    <div className="flex items-center gap-2 text-sm bg-white/20 rounded px-3 py-1">
                      <Save className="w-4 h-4" />
                      {autoSaveStatus}
                    </div>
                  )}
                </div>
                {isSubmitted && (
                  <CardDescription className={`${isSubmitted ? 'text-green-100' : 'text-blue-100'}`}>
                    Submitted on: {formatDisplayDateTime(submission!.submittedAt)}
                    {submission!.gradedAt && (
                      <> • Graded on: {formatDisplayDateTime(submission!.gradedAt)}</>
                    )}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Enter your ${assignment.type === 'assignment' ? 'solution' : 'answers'} here...`}
                  rows={15}
                  disabled={isSubmitted || isOverdue}
                  className={`text-base leading-relaxed ${
                    isSubmitted ? 'bg-green-50 border-green-200' : 
                    deadlineStatus.status === 'urgent' ? 'border-red-300 focus:border-red-500' :
                    'focus:border-blue-500'
                  }`}
                />
                
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    {content.length > 0 && (
                      <span>{content.length} characters • {content.split(/\s+/).filter(word => word.length > 0).length} words</span>
                    )}
                  </div>
                  
                  {!isSubmitted && !isOverdue && (
                    <Button 
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      size="lg"
                      className={`font-bold ${
                        deadlineStatus.status === 'urgent' ? 'bg-red-600 hover:bg-red-700' :
                        deadlineStatus.status === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {isSubmitting ? (
                        <>
                          <Timer className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Assignment'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success message for submitted assignments */}
          {isSubmitted && (
            <Card className="border-green-300 bg-green-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">✅ Assignment Submitted Successfully!</h3>
                    <p className="text-green-700 mt-1">
                      Your submission has been recorded. You can review your answer above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Grading Results */}
          {isSubmitted && (submission?.rating || submission?.feedback || submission?.status) && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Award className="w-6 h-6" />
                  </div>
                  Your Results & Feedback
                </CardTitle>
                <CardDescription className="text-purple-100 text-base">
                  {submission.gradedAt && `Graded on ${formatDisplayDateTime(submission.gradedAt)}`}
                  {submission.gradedBy && ` by ${submission.gradedBy}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Enhanced Rating for assignments and quizzes */}
                {submission?.rating && assignment.type !== 'exam' && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
                    {/* Celebration overlay for high scores */}
                    {submission.rating >= 8 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/30 to-amber-100/30 animate-pulse"></div>
                    )}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-full">
                            <Star className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-yellow-800">Your Score</h3>
                            {submission.rating >= 9 && (
                              <p className="text-yellow-700 font-medium">🎉 Outstanding Performance!</p>
                            )}
                            {submission.rating >= 7 && submission.rating < 9 && (
                              <p className="text-yellow-700 font-medium">⭐ Excellent Work!</p>
                            )}
                            {submission.rating >= 5 && submission.rating < 7 && (
                              <p className="text-yellow-700 font-medium">👍 Good Job!</p>
                            )}
                            {submission.rating < 5 && (
                              <p className="text-yellow-700 font-medium">💪 Keep improving!</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-yellow-700">{submission.rating}</span>
                            <span className="text-2xl text-yellow-600 font-bold">/10</span>
                          </div>
                          {submission.rating >= 8 && (
                            <div className="flex justify-end mt-2">
                              <Trophy className="w-8 h-8 text-yellow-600 animate-bounce" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Grade bar */}
                      <div className="w-full bg-yellow-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{width: `${(submission.rating / 10) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Pass/Fail status for exams */}
                {submission?.status && assignment.type === 'exam' && (
                  <div className={`relative overflow-hidden border-2 rounded-2xl p-6 shadow-lg ${
                    submission.status === 'pass' 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                  }`}>
                    {submission.status === 'pass' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-emerald-100/30 animate-pulse"></div>
                    )}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          submission.status === 'pass' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {submission.status === 'pass' ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                          ) : (
                            <AlertTriangle className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">Exam Result</h3>
                          <p className={`font-medium ${
                            submission.status === 'pass' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {submission.status === 'pass' ? '🎉 Congratulations!' : '💪 Keep studying!'}
                          </p>
                        </div>
                      </div>
                      <div className={`text-4xl font-black uppercase ${
                        submission.status === 'pass' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {submission.status}
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Rating for exams (optional) */}
                {submission?.rating && assignment.type === 'exam' && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-full">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-blue-800">Exam Score</h3>
                          <p className="text-blue-700 font-medium">Your performance rating</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-blue-700">{submission.rating}</span>
                          <span className="text-xl text-blue-600 font-bold">/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Feedback */}
                {submission?.feedback && (
                  <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 p-2 rounded-full">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-800">Teacher Feedback</h3>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-blue-800 leading-relaxed text-lg italic">
                        "{submission.feedback}"
                      </p>
                    </div>
                    {submission.gradedBy && (
                      <p className="text-sm text-blue-600 mt-3 text-right">
                        — {submission.gradedBy}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
