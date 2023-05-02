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
  const { name } = req.query.name
  const result = await getConfigRecord(req, name)
  res.json(result)
})

handler.put(async (req, res) => {
  const { name, configData } = req.body
  const result = await updateConfigData(req, name, configData)
  res.send(result)
})

export default handler
