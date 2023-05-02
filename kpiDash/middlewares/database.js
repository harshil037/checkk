import { MongoClient } from 'mongodb'

global.mongo = global.mongo || {}

const database = async (req, res, next) => {
  try {
    if (!global.mongo.client) {
      global.mongo.client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      await global.mongo.client.connect()
    }
    req.dbClient = global.mongo.client
    req.db = global.mongo.client.db(process.env.DB_NAME)

    return next()
  } catch (error) {
    res.status(500).json({ error: 'No database connection', data: null })
  }
}

export default database
