import { LoadingCard } from '@/components/ui/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TeacherDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Create Assignment Cards Loading */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-5 w-32 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Assignments List Loading */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <LoadingCard 
              title="Loading your assignments..." 
              description="Please wait while we fetch your assignments, quizzes, and exams"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
