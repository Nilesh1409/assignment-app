import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Test connection by getting collection stats
    const assignmentsCount = await db.collection('assignments').countDocuments()
    const submissionsCount = await db.collection('submissions').countDocuments()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        assignments: assignmentsCount,
        submissions: submissionsCount
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
