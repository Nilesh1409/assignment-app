import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createAssignmentAction(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const deadline = formData.get('deadline') as string
  const visibleFrom = formData.get('visibleFrom') as string

  if (!title || !description || !deadline || !visibleFrom) {
    redirect('/teacher/create-assignment?error=missing-fields')
  }

  const db = await getDatabase()
  
  await db.collection('assignments').insertOne({
    title,
    description,
    type: 'assignment',
    deadline: new Date(deadline),
    visibleFrom: new Date(visibleFrom),
    createdAt: new Date(),
    createdBy: session.name
  })

  redirect('/teacher/dashboard')
}

export default async function CreateAssignment({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession()
  
  if (!session || session.role !== 'teacher') {
    redirect('/teacher/login')
  }

  const error = searchParams.error

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
            <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>New Assignment</CardTitle>
            <CardDescription>Create a new assignment with deadline and visibility settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createAssignmentAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter assignment description and instructions"
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibleFrom">Visible From</Label>
                  <Input
                    id="visibleFrom"
                    name="visibleFrom"
                    type="datetime-local"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600">
                  {error === 'missing-fields' && 'Please fill in all required fields'}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Assignment
                </Button>
                <Link href="/teacher/dashboard">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
