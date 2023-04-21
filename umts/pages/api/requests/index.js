import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'

import protectedAPI from '../../../middlewares/protectedAPI'
import { updateRequest } from '../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

handler.post(async (req, res) => {
  try {
    const reqBody = JSON.parse(req.body)
    const reqId = reqBody._id

    delete reqBody._id

    const result = await updateRequest(req, reqId, reqBody)

    res.json({ error: null, success: result })
  } catch (e) {
    res.json({ error: e.message, success: false })
  }
})

export default handler
