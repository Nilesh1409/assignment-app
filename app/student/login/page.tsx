import { redirect } from 'next/navigation'
import { getSession, authenticateStudent, createSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

async function loginAction(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const studentId = formData.get('studentId') as string
  
  if (!name || !studentId) {
    redirect('/student/login?error=missing-fields')
  }
  
  const user = await authenticateStudent(name, studentId)
  
  if (!user) {
    redirect('/student/login?error=invalid-credentials')
  }
  
  await createSession(user)
  redirect('/student/dashboard')
}

export default async function StudentLogin({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession()
  if (session?.role === 'student') {
    redirect('/student/dashboard')
  }

  const error = searchParams.error

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <CardDescription>Enter your name and student ID to access assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Pratibha"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                name="studentId"
                type="text"
                placeholder="mongodb"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 text-center">
                {error === 'missing-fields' && 'Please fill in all fields'}
                {error === 'invalid-credentials' && 'Invalid name or student ID'}
              </div>
            )}
            
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
