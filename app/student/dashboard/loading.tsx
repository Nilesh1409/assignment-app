import { LoadingCard } from '@/components/ui/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function StudentDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Overview Cards Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Assignments List Loading */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="h-6 w-48 bg-white/20 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-white/20 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-6">
              <LoadingCard 
                title="Loading your assignments..." 
                description="Please wait while we fetch your assignments, quizzes, and exams"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
