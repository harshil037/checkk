import nextConnect from 'next-connect'
import middleware from '../../../../../../../middlewares/middleware'
import { find } from '../../../../../../../lib/mongoHelpers'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler.use(middleware)

const beautifyPath = (path = '') => {
  if (path === '/~') {
    return '/'
  } else if (path.includes('/~')) {
    return path.replace('/~', '')
  }
  return path
}

handler.get(async (req, res) => {
  try {
    const { clientId, domainId, pageTreeId, nocache } = req.query

    const { data, error } = await find({
      db: req.db,
      find: { _id: ObjectId(pageTreeId) },
      collection: 'pageTrees',
      limit: 1,
    })

    if (data) {
      if (data.published && data.published.pages) {
        const pageTreeData = {
          clientId: data.clientId,
          domainId: data.domainId,
          productId: data.productId,
          domain: data.domain,
          ...data.published,
        }

        for (let i = 0; i < pageTreeData.pages.length; i++) {
          const currentPage = pageTreeData.pages[i]
          currentPage.path = beautifyPath(currentPage.path)

          for (let j = 0; j < currentPage.modules.length; j++) {
            const currentModule = currentPage.modules[j]

            if (parseInt(currentModule.version) > 1) {
              currentModule.module = currentModule.module + currentModule.version
            }

            if (currentModule.contentId) {
              const result = await find({
                db: req.db,
                collection: 'contents',
                find: {
                  _id:
                    typeof currentModule.contentId === 'string'
                      ? ObjectId(currentModule.contentId)
                      : currentModule.contentId,
                },
              })

              if (result.data) {
                const moduleData = result.data[0]
                currentModule.blockProps = moduleData.blockProps
              } else {
                currentModule.blockProps = {}
              }
            } else {
              currentModule.blockProps = {}
            }
          }
        }

        res.status(200).json({ data: pageTreeData, error: null })
      } else {
        const pageTreeData = {
          clientId: data.clientId,
          domainId: data.domainId,
          productId: data.productId,
          domain: data.domain,
        }

        res.status(200).json({ data: pageTreeData, error: null })
      }
    } else {
      res.status(404).json({ error: 'Not Found!' })
    }
  } catch (e) {
    res.status(500).json({ error: e.message, data: null })
  }
})

export default handler
