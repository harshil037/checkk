import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import axios from 'axios'

const handler = nextConnect()

handler.use(middleware) //
//   .use(protectedAPI)
//   .use(ensureReqBody)

handler.post(async (req, res) => {
  // to send this updates to skyalps
  // axios.post('/api/channel/skyalps/manage', req.body)

  res.status(200).json({ success: true })
})

export default handler
