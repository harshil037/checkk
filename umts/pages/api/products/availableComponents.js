import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import ensureReqBody from '../../../middlewares/ensureReqBody'
import { find } from '../../../lib/mongoHelpers'

const handler = nextConnect()
handler.use(middleware).use(protectedAPI).use(ensureReqBody)
handler.get(async (req, res) => {
  try {
    const { data, error } = await find({
      db: req.db,
      collection: 'library',
      limit: 1,
    })
    if (data) {
      res.status(200).send(data)
    } else {
      res.status(500).send({ error: 'error occured while fatching modules' })
    }
  } catch {
    res.status(500).send({ error: 'error occured while fatching modules' })
  }
})

export default handler
