import nextConnect from 'next-connect'
import isMongoId from 'validator/lib/isMongoId'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import cors from '../../../middlewares/cors'
import { ObjectId } from 'mongodb'
import { getAllSmtsData, createSmtsRecord } from '../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI).use(ensureReqBody).use(cors)

handler.get(async (req, res) => {
  const result = await getAllSmtsData(req)
  res.json(result)
})
handler.post(async (req, res) => {
  const data = req.body
  const result = await createSmtsRecord(req, data)
  res.send(result)
})

export default handler
