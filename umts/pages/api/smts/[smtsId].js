import nextConnect from 'next-connect'
import isMongoId from 'validator/lib/isMongoId'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import cors from '../../../middlewares/cors'
import { ObjectId } from 'mongodb'
import { getSmtsData, updateSmtsData, deleteSmtsData } from '../../../lib/db'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)
  .use(cors)

handler.get(async (req, res) => {
  const id = typeof req.query.smtsId === 'string' ? ObjectId(req.query.smtsId) : req.query.smtsId
  const result = await getSmtsData(req, id)
  res.json(result)
})
handler.put(async (req, res) => {
  const id = typeof req.query.smtsId === 'string' ? ObjectId(req.query.smtsId) : req.query.smtsId
  const data = req.body
  const result = await updateSmtsData(req, id, data)
  res.json(result)
})
handler.delete(async (req, res) => {
  const id = typeof req.query.smtsId === 'string' ? ObjectId(req.query.smtsId) : req.query.smtsId
  const result = await deleteSmtsData(req, id)
  res.json(result)
})
export default handler
