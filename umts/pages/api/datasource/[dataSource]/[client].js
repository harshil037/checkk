import nextConnect from 'next-connect'

import cors from '../../../../middlewares/cors'
import { generateRandomNumber } from '../../../../lib/utils'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import { getClient, getClientDataSource, addClientDataSource, removeClientDataSource } from '../../../../lib/db'

const handler = nextConnect()

const localHosts = [
  'http://localhost:8080',
  'https://localhost:8080',
  'http://localhost:3000',
  'https://localhost:3000',
  'https://localhost:3006',
  'https://localhost:3007',
  'http://10.10.10.119:3003',
  'http://10.10.10.119:3007',
  'https://localhost:3001',
  'http://10.10.10.119:3006',
  'https://u-mts-git-dev-mtsonline.vercel.app',
  'https://u-mts-taupe.vercel.app',
  'https://u-mts-backend-new-design-git-dev-mtsonline.vercel.app/',
  'https://u.mts-online.com',
]

handler
  .use(middleware)
  .use(cors)
  .use(protectedAPI)
  .use(ensureReqBody)
  .get(async (req, res) => {
    const {
      query: { dataSource, client },
      headers: { origin, datasource },
    } = req
    const og = !origin && datasource ? datasource : localHosts.includes(origin) ? datasource : origin

    const data = await getClientDataSource(req, og, client, dataSource)

    res.statusCode = data ? 200 : 404
    res.json(data || { error: 'Error retrieving data', data })
  })
  .post(async (req, res) => {
    const {
      query: { dataSource, client: clientNumber },
      headers: { origin, datasource },
      body,
    } = req
    const og = datasource
      ? datasource
      : !origin && datasource
      ? datasource
      : localHosts.includes(origin)
      ? datasource
      : origin
    const data = await addClientDataSource(req, og, clientNumber, dataSource, body)

    res.statusCode = data ? 200 : 500
    res.json(data || { error: 'Error saving data', data })
  })
  .delete(async (req, res) => {
    const {
      query: { dataSource, client },
      headers: { origin, datasource },
    } = req
    const og = !origin && datasource ? datasource : localHosts.includes(origin) ? datasource : origin
    const data = await removeClientDataSource(req, og, client, dataSource)

    res.statusCode = data ? 200 : 404
    res.json(data || { error: 'Error deleting data', data })
  })

export default handler
