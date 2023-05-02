import nextConnect from 'next-connect'
import middleware from '../../middlewares/middleware'
import { extractUser } from '../../lib/api-helpers'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  const user = extractUser(req)
  if (user) {
    res.status(200).json({ error: null, user })
  } else {
    res.status(200).json({})
  }
  // } else {
  //   res.status(404).json({ error: 'No user found', user: null })
  // }
})

export default handler
