import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb+srv://nileshmongodb:Nilesh7054@tardiverse.cbaln2t.mongodb.net/assinmentapp'

let client: MongoClient
let db: Db

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db('assignmentapp')
  }
  return { client, db }
}

export async function getDatabase() {
  if (!db) {
    await connectToDatabase()
  }
  return db
}
