import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware'
import protectedAPI from '../../../../../middlewares/protectedAPI'
import anonymousAPI from '../../../../../middlewares/anonymousAPI'
import ensureReqBody from '../../../../../middlewares/ensureReqBody'
import { insert, update, find } from '../../../../../lib/mongoHelpers'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(anonymousAPI)
  .use(protectedAPI)
  .use(ensureReqBody)

// saving page tree
handler.post(async (req, res) => {
  try {
    const { db, body } = req
    const document = JSON.parse(body)
    document.domainId = ObjectId(document.domainId)

    if (document?.draft?.pages?.length > 0) {
      for (let i = 0; i < document.draft.pages.length; i++) {
        if (document.draft.pages[i]?.modules?.length > 0) {
          for (let j = 0; j < document.draft.pages[i].modules.length; j++) {
            if (
              document.draft.pages[i].modules[j].contentId &&
              typeof document.draft.pages[i].modules[j].contentId === 'string'
            )
              document.draft.pages[i].modules[j].contentId = ObjectId(document.draft.pages[i].modules[j].contentId)
          }
        }
      }
    }
    const { data, error } = await insert({ db, collection: 'pageTrees', document })

    if (!error) {
      // saving page tree id in the product
      const response = await update({
        db,
        query: { _id: document.domainId, 'products._id': document.productId },
        collection: 'domains',
        document: { $set: { 'products.$.pageTree': typeof data._id === 'string' ? ObjectId(data._id) : data._id } },
      })

      if (!response.error) {
        res.status(200).send({ data, error: null })
      } else {
        res.status(500).send({ data: null, error: response.error })
      }
    } else {
      res.status(500).send({ data: null, error: error })
    }
  } catch (e) {
    res.status(500).send({ data: null, error: e.message })
  }
})

handler
  .use(middleware) //
  .use(anonymousAPI)
  .use(protectedAPI)
  .use(ensureReqBody)

// get a pagetree by id
handler.get(async (req, res) => {
  try {
    const { db } = req
    const { pageTreeId } = req.query

    const { data, error } = await find({ db, collection: 'pageTrees', find: { _id: ObjectId(pageTreeId) } })
    if (!error) {
      if (data.length) {
        res.status(200).send({ data: data[0], error: null })
      } else {
        res.status(404).send({ data: null, error: 'page tree not found' })
      }
    } else {
      res.status(500).send({ data: null, error: error })
    }
  } catch (e) {
    res.status(500).send({ data: null, error: e.message })
  }
})

// update a page tree
handler.put(async (req, res) => {
  try {
    const { db, body } = req
    const { pageTreeId } = req.query
    const document = JSON.parse(body)
    if (document.domainId) document.domainId = ObjectId(document.domainId)

    if (document?.draft?.pages?.length > 0) {
      for (let i = 0; i < document.draft.pages.length; i++) {
        if (document.draft.pages[i]?.modules?.length > 0) {
          for (let j = 0; j < document.draft.pages[i].modules.length; j++) {
            if (
              document.draft.pages[i].modules[j].contentId &&
              typeof document.draft.pages[i].modules[j].contentId === 'string'
            )
              document.draft.pages[i].modules[j].contentId = ObjectId(document.draft.pages[i].modules[j].contentId)
          }
        }
      }
    }

    const { data, error } = await update({
      db,
      collection: 'pageTrees',
      query: { _id: ObjectId(pageTreeId) },
      document: { $set: document },
    })

    if (!error) {
      res.status(200).send({ data, error })
    } else {
      res.status(500).send({ data: null, error })
    }
  } catch (e) {
    res.status(500).send({ data: null, error: e.message })
  }
})

export default handler
