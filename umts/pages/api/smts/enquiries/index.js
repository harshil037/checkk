import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import { saveSmtsEnquiries } from '../../../../lib/db'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const handler = nextConnect()

handler.use(middleware)

handler.post(async (req, res) => {
  if (req.headers['x-access-token'] === ACCESS_TOKEN) {
    const data = req.body
    if (data && Object.keys(data).length) {
      const result = await saveSmtsEnquiries(req, data)
      if (result) {
        res.status(200).send({ success: true })
      } else {
        console.log('error while saving inquiry in db')
        res.status(500).send({ success: false })
      }
    } else {
      res.status(400).send({ success: false, error: 'empty body' })
    }
  } else {
    res.status(401).send({ error: 'Unauthorized' })
  }
})

export default handler
