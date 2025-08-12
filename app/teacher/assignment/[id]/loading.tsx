import { LoadingCard } from '@/components/ui/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TeacherAssignmentLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Assignment Details Loading */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Loading */}
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <LoadingCard 
                title="Loading submissions..." 
                description="Please wait while we fetch student submissions"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
