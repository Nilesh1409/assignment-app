'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownRenderer } from '@/components/ui/markdown'
import { formatDateTimeLocal } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import { useState, useTransition } from 'react'
import { createAssignmentAction } from './actions'

interface CreateAssignmentFormProps {
  error?: string
}

export default function CreateAssignmentForm({ error }: CreateAssignmentFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [visibleFrom, setVisibleFrom] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isPending, startTransition] = useTransition()

  const now = new Date()
  const minDateTime = formatDateTimeLocal(now)
  const defaultVisibleFrom = formatDateTimeLocal(now)
  const defaultDeadline = formatDateTimeLocal(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('deadline', deadline)
      formData.append('visibleFrom', visibleFrom)
      
      await createAssignmentAction(formData)
    })
  }

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Markdown supported)</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
                {showPreview ? (
                  <div className="min-h-[120px] p-3 border rounded-md bg-gray-50">
                    {description ? (
                      <MarkdownRenderer content={description} />
                    ) : (
                      <p className="text-gray-500 italic">No content to preview</p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter assignment description and instructions (supports Markdown formatting)"
                    rows={6}
                    required
                  />
                )}
                <p className="text-xs text-gray-500">
                  Supports Markdown: **bold**, *italic*, `code`, [links](url), lists, and more
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibleFrom">Visible From</Label>
                  <Input
                    id="visibleFrom"
                    value={visibleFrom}
                    onChange={(e) => setVisibleFrom(e.target.value)}
                    type="datetime-local"
                    min={minDateTime}
                    defaultValue={defaultVisibleFrom}
                    required
                  />
                  <p className="text-xs text-gray-500">When students can see this assignment</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    type="datetime-local"
                    min={minDateTime}
                    defaultValue={defaultDeadline}
                    required
                  />
                  <p className="text-xs text-gray-500">When students must submit by</p>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600">
                  {error === 'missing-fields' && 'Please fill in all required fields'}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Assignment...
                    </>
                  ) : (
                    'Create Assignment'
                  )}
                </Button>
                <Link href="/teacher/dashboard">
                  <Button variant="outline" disabled={isPending}>Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
