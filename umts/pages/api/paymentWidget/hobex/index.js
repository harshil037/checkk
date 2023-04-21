import nextConnect from 'next-connect'
import { ObjectId } from 'mongodb'
import middleware from '../../../../middlewares/middleware'
import cors from '../../../../middlewares/cors'
import { getClientCredientals, updatePaymentRecord } from '../../../../lib/db'

const handler = nextConnect()

handler.use(middleware).use(cors)

const CHECKOUT_MATCH = /^(000\.200)/

// Generate checkout ID
handler.post(async (req, res) => {
  try {
    const createBodyString = (options) =>
      Object.entries(options).reduce((acc, [key, value], i) => {
        return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
      }, '')
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body)
    const { recordId, paymentMode, client, widgetModule, version, domainId, product, ...bodyData } = data
    const _id = typeof recordId === 'string' ? ObjectId(data.recordId) : recordId

    let HOBEX_ENDPOINT, CREDENTIALS
    if (paymentMode === 'live') {
      HOBEX_ENDPOINT = `https://eu-prod.oppwa.com/v1/checkouts`
      // find client credientals
      CREDENTIALS = data?.client && (await getClientCredientals(req, req?.headers?.origin, data?.client, 'hobex'))
    } else {
      HOBEX_ENDPOINT = `https://eu-test.oppwa.com/v1/checkouts`
      CREDENTIALS = {
        entityId: '8a829418530df1d201531299e097175c',
        password: 'OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
      }
    }
    const body = createBodyString({
      ...bodyData,
      entityId: CREDENTIALS?.entityId,
      paymentType: 'DB',
      'customParameters[SHOPPER_module]': widgetModule || 'WidgetRequestForm',
      'customParameters[SHOPPER_version]': version || '1',
      'customParameters[SHOPPER_clientId]': client,
      'customParameters[SHOPPER_domain]': domainId,
      'customParameters[SHOPPER_product]': product,
    })
    const checkoutResponse = await fetch(`${HOBEX_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${CREDENTIALS?.password}`,
      },
      body,
    })
    const response = await checkoutResponse.json()

    if (!response || (response?.result?.code ? !CHECKOUT_MATCH.test(response.result.code) : true)) {
      res.status(402).send({ error: 'Problem while retrieving the checkout ID', data: null })
      return
    } else {
      const initiatPayment = await updatePaymentRecord(req, _id, {
        checkoutId: response?.ndc,
        status: 'paymentInitiated',
        updatedAt: new Date(),
      })
      if (initiatPayment.error) {
        res.status(500).json({
          error: { message: 'Problem while updating the payment record in database.' },
        })
      } else {
        res.status(200).json({ checkout: response })
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: error?.response?.data,
      field: 'FIELD',
      type: 'TYPE',
    })
  }
})

export default handler
