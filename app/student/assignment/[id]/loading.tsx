import { LoadingCard } from '@/components/ui/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function StudentAssignmentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-20 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Assignment Details Loading */}
          <Card className="shadow-lg border-2 animate-pulse">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 w-48 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 w-96 bg-white/20 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-white/20 rounded"></div>
                  <div className="h-6 w-24 bg-white/20 rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <LoadingCard 
                title="Loading assignment..." 
                description="Please wait while we fetch the assignment details"
              />
            </CardContent>
          </Card>

          {/* Answer Section Loading */}
          <Card className="shadow-lg border-0 animate-pulse">
            <CardHeader className="bg-blue-600 text-white">
              <div className="h-6 w-32 bg-white/20 rounded"></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-48 w-full bg-gray-200 rounded"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
