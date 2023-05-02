import Cors from 'micro-cors'
import nextConnect from 'next-connect'

const CM_URL = process.env.CM_URL || 'https://cm.mts-online.com'
const CONFIG_URL = '/api/product/smts/config'
const CONFIG_URL_VERSION = 1

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const handler = nextConnect()

// fetch the config file with a given client id
const fetchConfig = (req, url, version, client) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const baseUrl = req ? `${protocol}://${req.headers.host}` : ''
  return fetch(`${baseUrl}${url}/${client}/${version}`, {
    method: 'GET',
    headers: { internal: 'tofisch123' },
  })
    .then((response) => {
      return response.json()
    })
    .then((json) => ({ data: json, error: null }))
    .catch((error) => {
      console.log('======= ERROR =========')
      console.log(error)
      return { data: null, error }
    })
}

// fetch requested data from CM
const fetchData = (url = '', body = {}) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
    .then((response) => response.json())
    .then((json) => (json.data ? { data: json.data, error: null } : { data: null, error: json.errors })) // TODO: handle json.errors (from graphql response)
    .catch((error) => ({ data: null, error }))

// request and response handler for public API
// const handler = async (req, res) => {
//   const {
//     query: { source, client, version },
//     body,
//   } = req

//   if (body.operationName === 'IntrospectionQuery') {
//     res.setHeader('Content-Type', 'application/json')
//     res.statusCode = 200
//     res.json({ data: null, errors: null })
//   } else {
//     const { data: config, error: configError } = await fetchConfig(req, CONFIG_URL, CONFIG_URL_VERSION, client)
//     const stringifiedBody = config && JSON.stringify({ ...body, variables: { ...body.variables, config } }) // add config to the CM request body
//     const data = stringifiedBody && (await fetchData(CM_URL, stringifiedBody))

//     res.setHeader('Content-Type', 'application/json')
//     if (!data) {
//       // client config was not found or it was malformed
//       res.statusCode = 404
//       res.json({ errors: 'Client not found', data: null })
//     } else if (data) {
//       // if everything is ok pass-through the response from CM
//       res.statusCode = 200
//       res.json(data)
//     }
//   }
// }

// export default cors(handler)

handler.use(cors)

handler.post(async (req, res) => {
  const {
    query: { source, client, version },
    body,
  } = req

  if (body.operationName === 'IntrospectionQuery') {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.json({ data: null, errors: null })
  } else {
    // setting time out for 7 sec
    req.setTimeout(7000)

    const { data: config, error: configError } = await fetchConfig(req, CONFIG_URL, CONFIG_URL_VERSION, client)
    const stringifiedBody = config && JSON.stringify({ ...body, variables: { ...body.variables, config } }) // add config to the CM request body
    const data = stringifiedBody && (await fetchData(CM_URL, stringifiedBody))

    res.setHeader('Content-Type', 'application/json')
    if (!data) {
      // client config was not found or it was malformed
      // res.statusCode = 404
      res.status(404).json({ errors: 'Client not found', data: null })
    } else if (data) {
      // if everything is ok pass-through the response from CM
      // res.statusCode = 200
      res.status(200).json(data)
    }
  }
})

handler.head(async (req, res) => {
  const {
    query: { source, client, version },
    body,
  } = req

  if (body.operationName === 'IntrospectionQuery') {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.json({ data: null, errors: null })
  } else {
    // setting time out for 7 sec
    req.setTimeout(7000)

    const { data: config, error: configError } = await fetchConfig(req, CONFIG_URL, CONFIG_URL_VERSION, client)
    const stringifiedBody = config && JSON.stringify({ ...body, variables: { ...body.variables, config } }) // add config to the CM request body
    const data = stringifiedBody && (await fetchData(CM_URL, stringifiedBody))

    res.setHeader('Content-Type', 'application/json')
    if (!data) {
      // client config was not found or it was malformed
      // res.statusCode = 404
      res.status(404).json({ errors: 'Client not found', data: null })
    } else if (data) {
      // if everything is ok pass-through the response from CM
      // res.statusCode = 200
      res.status(200).json(data)
    }
  }
})

export default handler
