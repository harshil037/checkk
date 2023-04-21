import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import protectedAPI from '../../../../../../middlewares/protectedAPI'
import anonymousAPI from '../../../../../../middlewares/anonymousAPI'
import ensureReqBody from '../../../../../../middlewares/ensureReqBody'
import { find, update, remove } from '../../../../../../lib/mongoHelpers'
import { ObjectId } from 'mongodb'

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

    if (document?.published?.pages?.length > 0) {
      for (let i = 0; i < document.published.pages.length; i++) {
        if (document.published.pages[i]?.modules?.length > 0) {
          for (let j = 0; j < document.published.pages[i].modules.length; j++) {
            if (
              document.published.pages[i].modules[j].contentId &&
              typeof document.published.pages[i].modules[j].contentId === 'string'
            )
              document.published.pages[i].modules[j].contentId = ObjectId(
                document.published.pages[i].modules[j].contentId,
              )
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

handler.delete(async (req, res) => {
  try {
    const { pageTreeId } = req.query
    const { domainId, componentData } = JSON.parse(req.body)

    const document = { _id: ObjectId(pageTreeId) }
    const { data, error } = await remove({
      db: req.db,
      collection: 'pageTrees',
      document,
      multi: false,
    })

    if (data) {
      const result = await find({ db: req.db, find: { _id: ObjectId(domainId) }, collection: 'domains' })
      const newDomain = result.data[0]

      if (newDomain) {
        const newProducts = newDomain.products.filter((p) => p?.pageTree != pageTreeId)
        const newProductsData = newProducts.filter((p) => !componentData.includes(String(p.contentId)))

        newDomain.products = newProductsData
        const updateDomainsResult = await update({
          db: req.db,
          query: { _id: ObjectId(domainId) },
          collection: 'domains',
          document: { $set: newDomain },
        })
        if (updateDomainsResult) {
          const deleteAll = []
          for (let i = 0; i < componentData.length; i++) {
            deleteAll.push(
              remove({
                db: req.db,
                collection: 'contents',
                document: { _id: ObjectId(componentData[i]) },
                multi: false,
              }),
            )
          }
          const contentResult = await Promise.all(deleteAll)
          res.status(200).send({ data: { success: true }, error: null })
        } else {
          res.status(500).send({ data: null, error })
        }
      }
    }
  } catch (e) {
    res.status(500).send({ data: null, error: e.message })
  }
})

export default handler
