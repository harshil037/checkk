import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import { extractUser } from '../../../lib/api-helper'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  const user = extractUser(req)
  if (user) {
    res.status(200).json({ error: null, user })
  } else {
    res.status(200).json({})
  }
})

export default handler
