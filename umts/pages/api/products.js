import nextConnect from 'next-connect'
import isEmail from 'validator/lib/isEmail'
import normalizeEmail from 'validator/lib/normalizeEmail'
import middleware from '../../middlewares/middleware'
import protectedAPI from '../../middlewares/protectedAPI'
import ensureReqBody from '../../middlewares/ensureReqBody'
import isMongoId from 'validator/lib/isMongoId'
import { ObjectId } from 'mongodb'
import { deleteWidgetPageTree } from '../../lib/db'
import { slugify } from '../../lib/utils'
import { remove } from '../../lib/mongoHelpers'

const handler = nextConnect()

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  await req.db
    .collection('products')
    .find()
    .toArray((error, result) => {
      if (error) {
        res.status(500).json({ error, data: null })
      } else {
        res.status(200).json({
          error: null,
          products: result,
        })
      }
    })
})

handler.delete(async (req, res) => {
  try {
    const { productName, domainId } = req.body

    const _id = isMongoId(domainId) ? ObjectId(domainId) : null
    const domain = await req.db.collection('domains').findOne({
      _id,
    })

    if (domain) {
      const productData = domain?.products?.find((p) => p && slugify(p.name) === slugify(productName))

      const dataSourcesReference = domain?.products?.filter((product) =>
        product?.dataSource?.equals(productData?.dataSource),
      ).length

      const deleteProduct = await req.db
        .collection('domains')
        .updateOne(
          { _id: ObjectId(domainId) },
          {
            $set: {
              products: domain?.products
                ?.filter((p) => {
                  return p && slugify(p.name) !== slugify(productName)
                })
                .map((item) =>
                  item.contentId
                    ? {
                        ...item,
                        contentId: typeof item.contentId === 'string' ? ObjectId(item.contentId) : item.contentId,
                      }
                    : item,
                ),
            },
          },
        )
        .then(({ result, modifiedCount }) => {
          return result?.ok
            ? { modifiedCount: modifiedCount, error: null }
            : { modifiedCount: 0, error: 'error updating documents' }
        })

      if (deleteProduct.error) {
        res.status(404).send({ error: 'error updating documents' })
      } else {
        if (productData?.contentId) {
          let delResult = await remove({
            db: req.db,
            collection: 'contents',
            document: { _id: Object(productData?.contentId) },
          })

          if (delResult.error) {
            res.status(404).send({ error: 'error updating documents' })
          }

          // const getContentRef = await deleteWidgetPageTree(req, domainId, productName)
          // if (getContentRef && getContentRef.length > 0) {
          const deleteContentRef = await deleteWidgetPageTree(req, domainId, productName)
          if (deleteContentRef.error) {
            res.status(404).send({ error: 'error updating documents' })
          }
          // }
        }

        // delete website page tree
        if (productData?.pageTree) {
          let delResult = await remove({
            db: req.db,
            collection: 'pageTrees',
            document: { _id: Object(productData?.pageTree) },
          })
          if (delResult.error) {
            res.status(404).send({ error: 'error updating documents' })
          }
        }

        // delete product datasource
        if (productData?.dataSource && dataSourcesReference <= 1) {
          let delResult = await remove({
            db: req.db,
            collection: 'dataSources',
            document: { _id: Object(productData?.dataSource) },
          })
          if (delResult.error) {
            res.status(404).send({ error: 'error updating documents' })
          }
        }

        res.status(200).send({ error: null })
      }
    } else {
      res.status(404).send({ error: 'No domain found', domain: null })
      return
    }
  } catch (e) {
    res.status(500).send({ data: null, error: e.message })
  }
})

handler.post(async (req, res) => {
  const { name, productNumber, contact } = req.body
  const email = contact?.email && normalizeEmail(contact.email)

  if (email && !isEmail(email)) {
    res.status(400).send({ error: 'The email you entered is invalid.', product: null })
    return
  }

  if ((await req.db.collection('products').countDocuments({ productNumber })) > 0) {
    res.status(403).send({ error: 'The product ID has already been used.', product: null })
    return
  }

  if ((await req.db.collection('products').countDocuments({ name })) > 0) {
    res.status(403).send({ error: 'The name of the product has already been used.', product: null })
    return
  }

  if (!name || !productNumber) {
    res.status(400).send({ error: 'Missing field(s)', product: null })
    return
  }

  const product = await req.db
    .collection('products')
    .insertOne({
      name,
      productNumber,
      ...(contact && { contact: { ...contact, ...(email && { email }) } }),
    })
    .then(({ ops }) => ops[0])

  res.status(200).json({
    error: null,
    product,
  })
})

export default handler
