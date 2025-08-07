import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://nileshmongodb:Nilesh7054@tardiverse.cbaln2t.mongodb.net/assignmentapp'

async function initializeDatabase() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('assignmentapp')
    
    // Create collections if they don't exist
    const collections = ['assignments', 'submissions']
    
    for (const collectionName of collections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext()
      if (!exists) {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      }
    }
    
    // Create indexes for better performance
    await db.collection('assignments').createIndex({ createdAt: -1 })
    await db.collection('assignments').createIndex({ deadline: 1 })
    await db.collection('assignments').createIndex({ visibleFrom: 1 })
    
    await db.collection('submissions').createIndex({ assignmentId: 1, studentId: 1 }, { unique: true })
    await db.collection('submissions').createIndex({ submittedAt: -1 })
    
    console.log('Database initialized successfully!')
    
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    await client.close()
  }
}

initializeDatabase()
