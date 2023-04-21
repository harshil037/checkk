import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import axios from 'axios'

const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  console.log('notification =>', req.body)

  // to send this updates to skyalps
  // axios.post('https://u.mts-online.com/api/channel/skyalps/manage', req.body)

  res.status(200).json({ success: true })
})

export default handler
