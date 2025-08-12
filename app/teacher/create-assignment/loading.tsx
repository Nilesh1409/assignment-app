import { LoadingCard } from '@/components/ui/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function CreateAssignmentLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <LoadingCard 
              title="Loading form..." 
              description="Please wait while we prepare the assignment creation form"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
