import nextConnect from 'next-connect'
import { ObjectId } from 'mongodb'
import cors from '../../../../../middlewares/cors'
import middleware from '../../../../../middlewares/middleware'

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.get(async (req, res) => {
  try {
    const { domainId } = req.query

    const domain = await req.db.collection('domains').findOne({ _id: ObjectId(domainId) })

    if (domain && domain.roomsConfig) {
      res.status(200).json({ data: domain.roomsConfig, error: null })
    } else {
      res.status(404).json({ data: null, error: 'no config found' })
    }
  } catch (e) {
    res.status(500).json({ data: null, error: e.message })
  }
})

export default handler
