import nextConnect from 'next-connect'
import cors from '../../../../../../middlewares/cors'
import { generateRandomNumber } from '../../../../../../lib/utils'
import middleware from '../../../../../../middlewares/middleware'
import {
  getClientDataSource,
  addClientDataSource,
  getDomain,
  createIiqCacheRecord,
  updateIiqCachedRecord,
  findIiqCachedRecord,
} from '../../../../../../lib/db'
import { insert } from '../../../../../../lib/mongoHelpers'
// import querystring from ('querystring')

const handler = nextConnect()

const resultsTypes = ['portals', 'summary']

handler.use(middleware).use(cors)

handler.options((req, res) => {
  res.end()
})

handler.get(async (req, res) => {
  const {
    query: { language, perPage, minScore, page, clientId, domainId, resultsType },
  } = req

  if (resultsTypes.includes(resultsType)) {
    // Finding data from Cached records
    const cachedData = await findIiqCachedRecord(req, { clientId, domainId })
    if (cachedData) {
      const cachedTime = new Date(cachedData.timeStamp)
      const currentTime = new Date()
      const diffMs = currentTime - cachedTime
      const diffHrs = Math.round((diffMs % 86400000) / 3600000)
      const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)
      if (diffHrs > 24) {
        const result = await fetchIIQCheckData(req, clientId, domainId, language, perPage, minScore, page)
        if (result) {
          // Updating data in Cached records
          const upIiqCache = {
            clientId: clientId,
            domainId: domainId,
            [resultsTypes[0]]: result[0],
            [resultsTypes[1]]: result[1],
            timeStamp: currentTime.getTime(),
          }
          const isUpdated = await updateIiqCachedRecord(req, upIiqCache)
          if (isUpdated) console.log('cached updated successfully')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.json({ error: null, data: upIiqCache[resultsType], formCache: false })
          return
        } else {
          res.status(500).send({ error: 'problems fetching the data', data: null })
          return
        }
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json({ error: null, data: cachedData[resultsType], formCache: true })
      }
      return
    } else {
      // Getting data from API
      const result = await fetchIIQCheckData(req, clientId, domainId, language, perPage, minScore, page)
      if (result) {
        // Inserting data in Cached records
        const newIiqCache = {
          clientId: clientId,
          domainId: domainId,
          [resultsTypes[0]]: result[0],
          [resultsTypes[1]]: result[1],
          timeStamp: new Date().getTime(),
        }
        const isInserted = await createIiqCacheRecord(req, newIiqCache)
        if (isInserted) console.log('cached successfully')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json({ error: null, data: newIiqCache[resultsType], formCache: false })
        return
      } else {
        res.status(500).send({ error: 'problems fetching the data', data: null })
        return
      }
    }
  } else {
    const result = await fetchIIQCheckData(req, clientId, domainId, language, perPage, minScore, page, resultsType)
    if (result) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.json({ error: null, data: result, formCache: false })
      return
    } else {
      res.status(500).send({ error: 'problems fetching the data', data: null })
      return
    }
  }
})

const fetchIIQCheckData = async (req, clientId, domainId, language, perPage, minScore, page, resultsType = null) => {
  const domain = await getDomain(req, domainId)
  const clientData = domain?.url
    ? await getClientDataSource(req, domain.url, clientId, 'iiq')
    : await getClientDataSource(req, domainId, clientId, 'iiq')
  const key = clientData?.resource_id
  if (resultsType) {
    const params = [
      { prop: 'per_page', data: perPage },
      { prop: 'min_score', data: minScore },
      { prop: 'language', data: language },
      { prop: 'page', data: page },
    ].filter((item) => item.data !== undefined)
    const paramsString =
      params.length > 0
        ? params.reduce((acc, { prop, data }, i) => {
            if (prop === 'page' && data === '0') return `${acc}${i + 1 < params.length ? '&' : ''}`
            else {
              return `${acc}${prop}=${data}${i + 1 < params.length ? '&' : ''}`
            }
          }, '?')
        : ''
    const data = await fetch(
      `https://app.iiq-check.de/api/v2/businesses/${key}/results/${resultsType}${paramsString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    return await data.json()
  } else {
    return Promise.all([
      fetch(`https://app.iiq-check.de/api/v2/businesses/${key}/results/${resultsTypes[0]}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      fetch(`https://app.iiq-check.de/api/v2/businesses/${key}/results/${resultsTypes[1]}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    ])
      .then((responses) => {
        return Promise.all(
          responses.map((response) => {
            return response.json()
          }),
        )
      })
      .then((data) => {
        return data
      })
  }
}

export default handler
