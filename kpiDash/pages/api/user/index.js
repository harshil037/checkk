import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
// import { extractUser } from '../../../lib/api-helper'
import { find } from '../../../utils/mongoHelpers'
import { isLoggedIn } from '../../../middlewares/user'

const handler = nextConnect()
handler.use(middleware).use(isLoggedIn)

handler.get(async (req, res) => {
  const user = req.user && req.user.data
  if (user) {
    res.status(200).json({ error: null, data: user })
  } else {
    res.status(200).json({})
  }
})

export default handler
