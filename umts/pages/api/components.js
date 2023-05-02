import nextConnect from 'next-connect'
import middleware from '../../middlewares/middleware'
import protectedAPI from '../../middlewares/protectedAPI'
import ensureReqBody from '../../middlewares/ensureReqBody'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  await req.db
    .collection('library')
    .find()
    .toArray((error, result) => {
      if (error) {
        res.status(500).json({ error, data: null })
      } else {
        res.status(200).json({
          error: null,
          data: result,
        })
      }
    })
})
export default handler
