import nextConnect from 'next-connect'
import isMongoId from 'validator/lib/isMongoId'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import cors from '../../../middlewares/cors'
import { ObjectId } from 'mongodb'
import { getConfigRecord, createConfigRecord, updateConfigData } from '../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI).use(ensureReqBody).use(cors)

handler.get(async (req, res) => {
  const result = await getConfigRecord(req, 'config')
  res.json({ data: result })
})

handler.post(async (req, res) => {
  const data = req.body
  const result = await createConfigRecord(req, data)
  res.send(result)
})

handler.put(async (req, res) => {
  const result = await updateConfigData(req, 'config', req.body)
  res.send({ success: result })
})

export default handler
