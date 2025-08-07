import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assignment Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform for teachers to create assignments, quizzes, and exams, 
            and for students to submit their work efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Teacher Portal</CardTitle>
              <CardDescription>
                Create and manage assignments, quizzes, and exams with deadlines and time limits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/teacher/login">
                <Button className="w-full">Login as Teacher</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                View assignments, submit work, and take quizzes and exams within time limits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/student/login">
                <Button variant="outline" className="w-full">Login as Student</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Assignment Management</h3>
            <p className="text-gray-600">Create assignments with deadlines and visibility timelines</p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Timed Assessments</h3>
            <p className="text-gray-600">Quizzes and exams with automatic time tracking</p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Submission</h3>
            <p className="text-gray-600">Simple and intuitive submission process for students</p>
          </div>
        </div>
      </div>
    </div>
  )
}
