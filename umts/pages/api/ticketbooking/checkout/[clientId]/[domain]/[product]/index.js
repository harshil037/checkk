import nextConnect from 'next-connect'
import cors from '../../../../../../../middlewares/cors'
import middleware from '../../../../../../../middlewares/middleware'
import { getClientDataSource, addTicketCheckout, getTicketCheckout } from '../../../../../../../lib/db'
import { v4 as uuidv4 } from 'uuid'
// import querystring from ('querystring')

const handler = nextConnect()

const getClientCredentials = async (req, domain, client, dataSource) => {
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
      body: { paymentMode, options, personalData, emailTemplates ,backend, pdfTemplate, ticketPrefix},
    } = req
    const { clientId, domain, product } = req.query
    const locals = ['http://10.10.10.119:3004', 'http://localhost:3000']
    const origin = req.headers?.origin
    const envType = paymentMode === 'live' && !locals.includes(origin) ? 'live' : 'test'

    // create unique reference number
    const now = new Date(Date.now())
    const confirmedCheckouts = await getTicketCheckout(req, { concert:product, status:"confirmed"})
    let bookedTickets =  confirmedCheckouts?.length ? confirmedCheckouts?.reduce((res, curr)=>{
      res += parseInt(curr?.quantity)
      return res
    },0) : 0

    let data = {};
    if (!backend) {
      // find client credentials
      const hobexCreds =
        clientId &&
        (await getClientCredentials(
          req,
          envType === 'test' ? 'mts-online.com' : origin,
          envType === 'test' ? 'u0000' : clientId,
          'hobex',
        ))
      const concertData =
        clientId &&
        (await getClientCredentials(
          req,
          envType === 'test' ? 'mts-online.com' : origin,
          envType === 'test' ? 'u0000' : clientId,
          product,
        ))
        const concertDataSources = {...hobexCreds, ...concertData}
        data.totalAmount = concertDataSources?.price * parseInt(personalData?.ticketCount) || 0
        data.pricePerTicket = concertDataSources?.price ||  0
        // console.log("bookedTickets?.length", bookedTickets)
        // console.log("total", concertDataSources?.total)
        if(concertDataSources.total < bookedTickets + parseInt(personalData?.ticketCount)){
          res.send({ error: 'Not enough tickets', available:concertDataSources?.total - bookedTickets , data: null })
          return 
        }
      const bodyString = createBodyString({
        entityId: concertDataSources.entityId,
        // entityId: '8a829418530df1d201531299e097175c',
        amount: data?.totalAmount,
        currency: options.currency || 'EUR',
        paymentType: 'DB',
        'customParameters[SHOPPER_module]': 'WidgetTicketBooking',
        'customParameters[SHOPPER_version]': '1',
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
          Authorization: `Bearer ${concertDataSources.password}`,
          // Authorization: 'Bearer OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
        },
        body: bodyString,
      })
      const result = await transaction.json()
      // const { id } = result
      data.id = result.id
      if (!result.id) {
        res.status(500).send({ error: 'problems retrieving the transaction ID', data: null })
        return
      }
    }
    const updatedTemplates = {
      ...emailTemplates,
      customerTemplate: {
        ...emailTemplates?.customerTemplate,
        template: emailTemplates?.customerTemplate?.template?.replace(/{{transactionId}}/g, `${data.id}`),
        failureTemplate: emailTemplates?.customerTemplate?.failureTemplate?.replace(/{{transactionId}}/g, `${data.id}`),
      },
      hotelTemplate: {
        ...emailTemplates?.hotelTemplate,
        template: emailTemplates?.hotelTemplate?.template?.replace(/{{transactionId}}/g, `${data.id}`),
        failureTemplate: emailTemplates?.hotelTemplate?.failureTemplate?.replace(/{{transactionId}}/g, `${data.id}`),
      },
    }
    const updatedPdfTemplate = {
      ...pdfTemplate,
      template: pdfTemplate?.template?.replace(/{{quantity}}/g,`${personalData?.ticketCount}`)?.replace(/{{total}}/g,`${data?.totalAmount}`)
    }
    const checkout = {
      checkoutId: data.id,
      clientId,
      domainId: domain,
      personalData,
      concert:product,
      ticketPrefix,
      ticketPrice: data.pricePerTicket,
      quantity: personalData?.ticketCount,
      emailTemplates: updatedTemplates,
      pdfTemplate : updatedPdfTemplate,
      paymentMode,
      ...(envType === 'test' ? { test: true } : {}),
      status:"created",
      totalAmount: data?.totalAmount,
      createdAt: now,
      transactions: [
        {
          id: uuidv4(),
          type: 'sale',
          createdAt: now,
          amount: data?.totalAmount,
        },
      ],
    }
    const saveCheckout = await addTicketCheckout(req, checkout)
    // console.log(saveCheckout, 'saveCheckout')

    if (data.totalAmount && data.totalAmount > 0) {
      res.json({ error: null, id:data.id })
      return
    } else {
      res.status(500).send({ error: 'problems saving the data', data: null })
      return
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: err, data: null })
  }
})

export default handler
