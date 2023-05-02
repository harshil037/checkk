import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
// import cors from '../../../../../middlewares/cors'
import { saveWebhookData } from '../../../../../lib/db'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  if (req.headers['x-access-token'] === ACCESS_TOKEN) {
    const data = req.body
    const { provider, clientId } = req.query

    if (data) {
      const result = await saveWebhookData(req, { clientId, provider, data })
      if (result) {
        res.status(200).send({ success: true })
      } else {
        console.log('error while saving inquiry in db', req.body)
        res.status(500).send({ success: false })
      }
    } else {
      res.status(400).send({ success: false, error: 'empty body' })
    }
  } else {
    res.status(401).send({ success: false, error: 'Unauthorized' })
  }
})

export default handler
