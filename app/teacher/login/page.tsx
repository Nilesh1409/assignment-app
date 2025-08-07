import { redirect } from 'next/navigation'
import { getSession, authenticateTeacher, createSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

async function loginAction(formData: FormData) {
  'use server'
  
  const mobile = formData.get('mobile') as string
  
  if (!mobile) {
    redirect('/teacher/login?error=missing-mobile')
  }
  
  const user = await authenticateTeacher(mobile)
  
  if (!user) {
    redirect('/teacher/login?error=invalid-credentials')
  }
  
  await createSession(user)
  redirect('/teacher/dashboard')
}

export default async function TeacherLogin({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession()
  if (session?.role === 'teacher') {
    redirect('/teacher/dashboard')
  }

  const error = searchParams.error

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Teacher Login</CardTitle>
          <CardDescription>Enter your mobile number to access the teacher portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="9137831800"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 text-center">
                {error === 'missing-mobile' && 'Please enter your mobile number'}
                {error === 'invalid-credentials' && 'Invalid mobile number'}
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
