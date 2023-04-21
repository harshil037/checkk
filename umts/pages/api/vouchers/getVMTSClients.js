import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import { getClientsByWidget } from '../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI).use(ensureReqBody)

handler.get(async (req, res) => {
  try {
    const { name, version } = req.query
    const clients = await getClientsByWidget(req, name, version)
    if (!clients) {
      res.status(200).json({ success: false })
    } else {
      res.status(200).json({ success: true, clients })
    }
  } catch (e) {
    console.log({ e })
    res.status(500).send({ success: false, error: e.message })
  }
})

export default handler
