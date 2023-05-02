import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import { find } from '../../../../lib/mongoHelpers'

const handler = nextConnect()
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

handler.use(middleware)

handler.get(async (req, res) => {
  if (req.query?.mts === ACCESS_TOKEN) {
    try {
      const query = {}
      if (req.query['smts-client']) {
        query['user_id'] = req.query['smts-client']
      }
      if (req.query['booking-engine']) {
        query['booking.engine'] = req.query['booking-engine']
      }
      if (req.query['smart-response']) {
        query['enquiry.autoreply.enabled'] = parseInt(req.query['smart-response'])
      }

      const { error, data } = await find({ db: req.db, collection: 'smts', find: query })
      if (!data || error) res.json({ error: 'Not found' })

      res.json(data)
    } catch (e) {
      res.json({ error: 'something went wrong' })
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

export default handler
