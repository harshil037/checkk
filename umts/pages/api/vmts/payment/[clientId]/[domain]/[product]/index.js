import nextConnect from 'next-connect'
import cors from '../../../../../../../middlewares/cors'
import { generateRandomNumber, slugify } from '../../../../../../../lib/utils'
import middleware from '../../../../../../../middlewares/middleware'
import { getClient, getClientDataSource, addVmtsVoucherCheckout } from '../../../../../../../lib/db'
import { v4 as uuidv4 } from 'uuid'
// import querystring from ('querystring')

const handler = nextConnect()

const createRefno = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  return `VMTS-${year}-${month}-${generateRandomNumber(5)}`
}

const createConfig = (config) => ({ ...config })

// const encodeCredientals = ({ password }) => Buffer.from(`${password}`).toString('base64')
const encodeCredientals = ({ entityId, password }) => {
  // console.log(Buffer.from(`${entityId}|${password}`).toString('base64'))
  return Buffer.from(`${entityId}|${password}`).toString('base64')
}

const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

const createBodyString = (options) =>
  Object.entries(options).reduce((acc, [key, value], i) => {
    return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
  }, '')

handler.use(middleware).use(cors)

handler.options((req, res) => {
  res.end()
})

handler.post(async (req, res) => {
  try {
    const {
      body: { paymentMode, language, basket, options, personalData, emailTemplates, backend, sendEmail, selectedVoucherType },
    } = req
    const { clientId, domain, product } = req.query
    const locals = ['http://10.10.10.119:3004', 'http://localhost:3000']
    const origin = req.headers?.origin
    const envType = paymentMode === 'live' && !locals.includes(origin) ? 'live' : 'test'

    // create unique reference number
    const now = new Date(Date.now()).toISOString()
    const value = parseFloat(options.amount).toFixed(2).toString()

    let id
    if (!backend) {
      // find client credientals
      const credientals =
        clientId &&
        (await getClientCredientals(
          req,
          envType === 'test' ? 'mts-online.com' : origin,
          envType === 'test' ? 'u0000' : clientId,
          'hobex',
        ))

      const bodyString = createBodyString({
        entityId: credientals.entityId,
        // entityId: '8a829418530df1d201531299e097175c',
        amount: value,
        currency: options.currency || 'EUR',
        paymentType: 'DB',
        'customParameters[SHOPPER_module]': 'WidgetVmts',
        'customParameters[SHOPPER_version]': '2',
        'customParameters[SHOPPER_clientId]': clientId,
        'customParameters[SHOPPER_domain]': domain,
        'customParameters[SHOPPER_product]': product,
      })
      const testHobexUrl = 'https://eu-test.oppwa.com/v1/checkouts'
      const liveHobexUrl = 'https://oppwa.com/v1/checkouts'
      const transaction = await fetch(envType === 'test' ? testHobexUrl : liveHobexUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${credientals.password}`,
          // Authorization: 'Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
        },
        body: bodyString,
      })
      const result = await transaction.json()
      // const { id } = result
      id = result.id
      if (!result.id) {
        res.status(500).send({ error: 'problems retrieving the transaction ID', data: null })
        return
      }
    }

    const singleVouchers =
      basket?.items.reduce((acc, v) => {
        return [...acc, ...Array(v.quantity).fill({ ...v, quantity: 1, value: v.totalAmount / (v.quantity || 1) })]
      }, []) || []

    const voucherItems = singleVouchers.reduce((acc, v, i) => {
      const buyerLastName = personalData?.lastname
      const buyerFirstName = personalData?.firstname
      const buyerEmail = personalData?.email
      const buyerCompany = personalData?.company

      const servicesString =
        (v.services &&
          Object.entries(v.services).reduce((sAcc, [key, service]) => {
            return `${sAcc}${service.title} (${service.code}) - ${service.quantity} x ${service.price.amount} ${
              service.price.currency
            } ${i + 1 !== Object.entries(v.services).length ? '| ' : ''}`
          }, '')) ||
        ''

      const comments = `NAME: ${
        v.recipientMessage?.name ? v.recipientMessage?.name : personalData?.firstname + ' ' + personalData?.lastname
      }  | EMAIL: ${v.email ? v.email : personalData?.email} | VIA ${v.sendVia || 'email'} | TO: ${
        personalData?.email
      } ${
        v.streetno || personalData?.streetno
          ? `| ADDRESS: ${personalData?.firstname + ' ' + personalData?.lastname} - ${
              v.streetno || personalData?.streetno
            } - ${v.zip || personalData?.zip} - ${v.place || personalData?.place} - ${
              v.country || personalData?.country
            }`
          : ''
      } ${personalData?.company ? `| COMPANY: ${personalData?.company} VAT: ${personalData?.vatId}` : ''} ${
        servicesString && servicesString !== '' ? `| SERVICES: ${servicesString}` : ''
      }`

      const value = parseFloat(v.value).toFixed(2)
      const refno = createRefno()

      const voucher = {
        ...v,
        ps: 'Hobex',
        buyer: {
          ...(buyerFirstName && { firstname: buyerFirstName }),
          ...(buyerLastName && { lastname: buyerLastName }),
          ...(buyerCompany && { company: buyerCompany }),
          ...(buyerEmail && { email: buyerEmail }),
        },
        code: refno,
        clientno: clientId,
        status: backend ? 'redeemable' : 'registered',
        type: backend ? selectedVoucherType || v?.voucher?.categoryType || 'VOUCHER' : v?.voucher?.categoryType || 'VOUCHER',
        language,
        createdAt: now,
        lastUpdatedAt: now,
        basket,
        id,
        initialValue: value,
        currentValue: value,
        comments,
        email: v.email ? v.email : personalData?.email,
        transactions: [
          {
            id: uuidv4(),
            type: 'sale',
            createdAt: now,
            amount: value,
          },
        ],
      }
      return [...acc, voucher]
    }, [])
    const updatedTemplates = backend ?  {
      ...emailTemplates,
      customerTemplate: {
        ...emailTemplates?.customerTemplate,
        template: emailTemplates?.customerTemplate?.template?.replace(/{{transactionId}}/g, `Offline Payment`)?.replace(/{{paymentStatus}}/g, `Offline Payment`),
        failureTemplate: emailTemplates?.customerTemplate?.failureTemplate?.replace(/{{transactionId}}/g, `Offline Payment`)?.replace(/{{paymentStatus}}/g, `Offline Payment`),
      },
      hotelTemplate: {
        ...emailTemplates?.hotelTemplate,
        template: emailTemplates?.hotelTemplate?.template?.replace(/{{transactionId}}/g, `Offline Payment`)?.replace(/{{paymentStatus}}/g, `Offline Payment`),
        failureTemplate: emailTemplates?.hotelTemplate?.failureTemplate?.replace(/{{transactionId}}/g, `Offline Payment`)?.replace(/{{paymentStatus}}/g, `Offline Payment`),
      },
    } : {
      ...emailTemplates,
      customerTemplate: {
        ...emailTemplates?.customerTemplate,
        template: emailTemplates?.customerTemplate?.template?.replace(/{{transactionId}}/g, `${id}`),
        failureTemplate: emailTemplates?.customerTemplate?.failureTemplate?.replace(/{{transactionId}}/g, `${id}`),
      },
      hotelTemplate: {
        ...emailTemplates?.hotelTemplate,
        template: emailTemplates?.hotelTemplate?.template?.replace(/{{transactionId}}/g, `${id}`),
        failureTemplate: emailTemplates?.hotelTemplate?.failureTemplate?.replace(/{{transactionId}}/g, `${id}`),
      },
    }
    if(backend){
      id = `backend-${Date.now()}`
    }
    const checkout = {
      voucherItems,
      checkoutId: id,
      clientId,
      domainId: domain,
      paymentMode,
      emailTemplates: updatedTemplates,
      product,
      ...(envType === 'test' ? { test: true } : {}),
      ...(backend ? { paymentStatus: "success" } : {}), // hotel has accepted payment offline Or hotel has to take payment at their end.
      totalAmount: voucherItems?.reduce((acc, curr) => {
        acc += curr.value
        return acc
      }, 0),
      createdAt: now,
      transactions: [
        {
          id: uuidv4(),
          type: 'sale',
          createdAt: now,
          amount: value,
        },
      ],
      ...(backend ? { backend }: {})
    }
    const saveCheckout = await addVmtsVoucherCheckout(req, checkout)
    // console.log(saveCheckout, 'saveCheckout')
    if(sendEmail){
      const mailStatus = await fetch(
        `https://worker.mts-online.com/api/vmts/payment/mailer/${clientId}/${domain}/${product}/${id}`,
        {
          method: 'POST',
        },
      )
    }
    if (voucherItems && voucherItems.length > 0) {
      res.json({ error: null, id })
      return
    } else {
      res.status(500).send({ error: 'problems saving the data', data: null })
      return
    }
  } catch (err) {
    res.status(500).send({ error: err, data: null })
  }
})

export default handler
