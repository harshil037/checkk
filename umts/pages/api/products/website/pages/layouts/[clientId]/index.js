import nextConnect from 'next-connect'
import middleware from '../../../../../../../middlewares/middleware'
import protectedAPI from '../../../../../../../middlewares/protectedAPI'
import anonymousAPI from '../../../../../../../middlewares/anonymousAPI'
import ensureReqBody from '../../../../../../../middlewares/ensureReqBody'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(anonymousAPI)
  .use(protectedAPI)
  .use(ensureReqBody)

// get a pagetree by id
handler.get(async (req, res) => {
  try {
    const { db } = req
    const { clientId } = req.query

    const result = await db
      .collection('library')
      .find({})
      .project({ layout: 1 })
      .map((doc) => doc.layout.filter((item) => (!!item.clientId ? item.clientId === clientId : item)))
      .toArray()

    if (result.length) {
      res.status(200).send({ data: result[0], error: null })
    } else {
      res.status(404).send({ data: null, error: 'page tree not found' })
    }
  } catch (e) {
    res.status(500).send({ data: null, error: e.message })
  }
})

export default handler
