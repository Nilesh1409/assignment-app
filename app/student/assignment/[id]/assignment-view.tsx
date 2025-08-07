'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText, BookOpen, AlertTriangle, CheckCircle, Timer, Save } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/dashboard">
                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {assignment.title}
                </h1>
                <p className="text-gray-600 mt-1">Student: {student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Deadline countdown */}
              <div className={`p-3 rounded-lg border-2 ${deadlineStatus.bgColor}`}>
                <div className="text-sm font-medium text-gray-700 mb-1">Deadline</div>
                <CountdownTimer deadline={deadline} />
              </div>
              
              {/* Timer for timed assignments */}
              {timeLeft !== null && isStarted && !isSubmitted && (
                <div className="p-3 rounded-lg border-2 bg-red-50 border-red-300">
                  <div className="flex items-center gap-2 text-lg font-mono">
                    <Timer className="w-5 h-5 text-red-500" />
                    <span className={`font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Assignment Details Card */}
          <Card className={`shadow-lg border-2 ${deadlineStatus.bgColor}`}>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    {assignment.type === 'assignment' && <FileText className="w-6 h-6" />}
                    {assignment.type === 'quiz' && <Clock className="w-6 h-6" />}
                    {assignment.type === 'exam' && <BookOpen className="w-6 h-6" />}
                    {assignment.title}
                  </CardTitle>
                  <CardDescription className="text-blue-100 mt-2">
                    <div className="flex gap-4">
                      <span>Deadline: {deadline.toLocaleString()}</span>
                      {assignment.timeLimit && <span>Time Limit: {assignment.timeLimit} minutes</span>}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-white text-blue-600 font-semibold text-sm px-3 py-1">
                    {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                  </Badge>
                  {isSubmitted && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 font-semibold text-sm px-3 py-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Submitted
                    </Badge>
                  )}
                  {!isSubmitted && (
                    <Badge 
                      variant={deadlineStatus.color === 'orange' ? 'secondary' : deadlineStatus.color === 'destructive' ? 'destructive' : 'secondary'}
                      className={`font-semibold text-sm px-3 py-1 ${
                        deadlineStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        deadlineStatus.status === 'urgent' ? 'bg-red-100 text-red-800 border-red-300' :
                        deadlineStatus.status === 'warning' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        ''
                      }`}
                    >
                      {deadlineStatus.status === 'urgent' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {deadlineStatus.text}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
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
                    Submitted on: {new Date(submission!.submittedAt).toLocaleString()}
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
        </div>
      </div>
    </div>
  )
}
