import nextConnect from 'next-connect'
import { generateRandomNumber } from '../../../../lib/utils'
import middleware from '../../../../middlewares/middleware'
import { getClientDataSource } from '../../../../lib/db'

const CHECKOUT_MATCH = /^(000\.200)/

const handler = nextConnect()

const createRefno = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `MTS-${year}-${month}-${generateRandomNumber(7)}`
}

const createConfig = (config) => ({ ...config })

const encodeCredientals = ({ username, password }) => Buffer.from(`${username}:${password}`).toString('base64')

const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

const createBodyString = (options) =>
  Object.entries(options).reduce((acc, [key, value], i) => {
    return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
  }, '')

handler.use(middleware)

handler.post(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  const {
    headers: { origin },
    body: { client, language, currency, amount, source, customer, reference, notes },
  } = req

  if (!customer || !client || !currency || !amount || !source || !language) {
    console.log('Error with the given params (customer, client, currency, amount, source, language)')
    res.status(402).send({ error: 'problems retrieving the transaction ID', data: null })
    return
  }

  // find client credientals
  const credientals = (client && (await getClientCredientals(req, origin, client, 'hobex'))) || {
    entityId: '8acda4ca770158590177162d967f280c',
    password: 'OGFjZGE0Y2M2M2Y0MDAyNzAxNjNmN2ZjOTJmNDE0YWV8WmRUS0c5TXpYZQ==',
  }

  // create unique reference number
  const refno = reference || createRefno()

  const bodyString = createBodyString({
    entityId: credientals.entityId,
    amount: (amount && parseFloat(amount).toFixed(2).toString()) || '0',
    currency: currency || 'EUR',
    paymentType: 'DB',
  })

  console.log({ credientals })

  const transaction = await fetch('https://eu-test.oppwa.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${credientals.password}`,
    },
    body: bodyString,
  })
  console.log({ transaction })
  const response = await transaction.json()

  if (!response || !customer || (response?.result?.code ? !CHECKOUT_MATCH.test(response.result.code) : true)) {
    res.status(402).send({ error: 'problems retrieving the transaction ID', data: null })
    return
  }
  console.log({ response })

  const {
    result: { code },
    timestamp,
    id,
  } = response

  console.log({ code, timestamp, id })

  const data = timestamp &&
    code &&
    id && {
      ps: 'Hobex',
      code: refno,
      clientno: client,
      status: 'registered',
      type: 'payment',
      transactionId: id,
      language,
      createdAt: timestamp,
      lastUpdatedAt: timestamp,
      resultCode: code,
      amount: (amount && parseFloat(amount).toFixed(2).toString()) || '0',
      source,
      currency: currency || 'EUR',
      customer,
      ...(notes && { notes }),
    }

  console.log('=====================')
  console.log({ data })

  if (data) {
    res.json({ error: null, data })
    return
  } else {
    res.status(402).send({ error: 'problems saving the data', data: null })
    return
  }
})

export default handler
