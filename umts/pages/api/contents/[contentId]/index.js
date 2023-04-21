import nextConnect from 'next-connect'
import { ObjectId } from 'mongodb'
import { find, update, remove } from '../../../../lib/mongoHelpers'
import cors from '../../../../middlewares/cors'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'

const handler = nextConnect()

handler.use(middleware).use(protectedAPI)

handler.get(async (req, res) => {
  try {
    const { contentId } = req.query

    const { data, error } = await find({
      db: req.db,
      find: { _id: ObjectId(contentId) },
      collection: 'contents',
      limit: 1,
    })

    if (error) {
      res.status(500).send({ data: null, error })
    } else {
      res.status(200).send({ data: data, error: null })
    }
  } catch (e) {
    res.status(500).json({ data: null, error: e.message })
  }
})

handler.put(async (req, res) => {
  try {
    const { contentId } = req.query

    const document = JSON.parse(req.body)

    document.timestamp = new Date()

    const { data, error } = await update({
      db: req.db,
      query: { _id: ObjectId(contentId) },
      collection: 'contents',
      document: { $set: document },
    })

    if (error) {
      res.status(500).send({ data: null, error })
    } else {
      res.status(200).send({ data: { success: true }, error: null })
    }
  } catch (e) {
    res.status(500).json({ data: null, error: e.message })
  }
})

handler.delete(async (req, res) => {
  try {
    const { contentId } = req.query

    if (contentId) {
      const _id = typeof contentId === 'object' ? contentId : ObjectId(contentId)

      const domainData = JSON.parse(req.body)
      const { domainId, pageTreeId, pageId, moduleId } = domainData

      const document = { _id: ObjectId(_id) }
      const { data, error } = await remove({
        db: req.db,
        collection: 'contents',
        document,
        multi: false,
      })

      if (data) {
        const result = await find({ db: req.db, find: { _id: ObjectId(domainId) }, collection: 'domains' })
        const newDomain = result.data[0]

        if (newDomain) {
          const newProductsData = await newDomain.products.filter((p) => p.contentId != contentId)
          newDomain.products = newProductsData

          const updateDomainsResult = await update({
            db: req.db,
            query: { _id: ObjectId(domainId) },
            collection: 'domains',
            document: { $set: newDomain },
          })

          // if (updateDomainsResult) {
          //   const pageTree = await find({ db: req.db, find: { _id: ObjectId(pageTreeId) }, collection: 'pageTrees' })
          //   const newPageTree = pageTree.data[0]

          //   const pageIndex = newPageTree.draft.pages.findIndex((p) => p.id === pageId)
          //   // const moduleIndex = newPageTree.draft.pages[pageIndex].modules.findIndex((m) => m.id === moduleId)

          //   const newModules = newPageTree.draft.pages[pageIndex].modules.filter((module) => module.id != moduleId)
          //   newPageTree.draft.pages[pageIndex].modules = newModules

          //   const updatePageTreesResult = await update({
          //     db: req.db,
          //     query: { _id: ObjectId(pageTreeId) },
          //     collection: 'pageTrees',
          //     document: { $set: newPageTree },
          //   })

          // }

          res.status(200).send({ data: { success: true }, error: null })
        }
      } else {
        res.status(500).send({ data: null, error })
      }
    }
  } catch (e) {
    res.status(500).json({ data: null, error: e.message })
  }
})

export default handler
