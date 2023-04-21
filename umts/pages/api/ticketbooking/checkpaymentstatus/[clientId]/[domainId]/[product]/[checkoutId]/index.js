import nextConnect from 'next-connect'
import middleware from '../../../../../../../../middlewares/middleware'
import cors from '../../../../../../../../middlewares/cors'
import { getClientDataSource, updateTicketCheckout, getTicketCheckout } from '../../../../../../../../lib/db'
import { getHobexPaymentStatus } from '../../../../../../../../lib/utils'

const handler = nextConnect()

handler.use(middleware).use(cors)

const getClientCredentials = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler.get(async (req, res) => {
  try {
    const origin = req.headers?.origin
    const locals = ['http://10.10.10.119:3004', 'http://localhost:3000']

    const { domainId, clientId, product, checkoutId } = req.query
    const ticket = await getTicketCheckout(req, { checkoutId: checkoutId, domainId, clientId, concert:product })
    const envType = ticket[0]?.paymentMode === 'live' && !locals.includes(origin) ? 'live' : 'test'
    // find client credientals
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
    const testHobexUrl = 'https://eu-test.oppwa.com/v1/checkouts'
    const liveHobexUrl = 'https://oppwa.com/v1/checkouts'

    const result = await fetch(
      `${envType === 'test' ? testHobexUrl : liveHobexUrl}/${checkoutId}/payment?entityId=${concertDataSources?.entityId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${concertDataSources.password}`,
        },
      },
    )
    const status = await result.json()
    if (status.id) {
    //   fs.appendFile(
      //     './voucher_log.txt',
    //     `\n${new Date(
    //       Date.now(),
    //     ).toISOString()} | DOMAIN: ${domainId} | CLIENT: ${clientId} | TRANSACTION ID: ${checkoutId} | CODE: ${
      //       status?.result?.code
      //     }`,
      //     function (err) {
    //       console.log(err)
    //     },
    //   )
      const uniqueId = status.id
      const paymentStatus = getHobexPaymentStatus(status.result.code)
      if (paymentStatus && paymentStatus !== '') {
        const confirmedCheckouts = await getTicketCheckout(req, { concert:product, status:"confirmed"})
        const codes = [];
        let bookedTickets =  confirmedCheckouts?.length ? confirmedCheckouts?.reduce((res, curr)=>{
          res += parseInt(curr?.quantity)
          return res
        },0) : 0
        for(let i = 0; i<parseInt(ticket?.[0]?.quantity || 0); i++){
          codes.push(`${ticket?.[0]?.ticketPrefix}-${bookedTickets+1 +i}`)
        }
        const updatedTemplates = {
          ...ticket[0]?.emailTemplates,
          customerTemplate: {
            ...ticket[0]?.emailTemplates?.customerTemplate,
            ...(paymentStatus === 'success'
              ? {
                  template: ticket[0]?.emailTemplates?.customerTemplate?.template?.replace(
                    /{{paymentStatus}}/g,
                    `Success`,
                  ),
                }
              : paymentStatus === 'failed'
              ? {
                  failureTemplate: ticket[0]?.emailTemplates?.customerTemplate?.failureTemplate
                    ?.replace(/{{paymentStatus}}/g, `Failed`)
                    ?.replace(/{{reason}}/g, status?.result?.description),
                }
              : {}),
          },
          hotelTemplate: {
            ...ticket[0]?.emailTemplates?.hotelTemplate,
            ...(paymentStatus === 'success'
              ? {
                  template: ticket[0]?.emailTemplates?.hotelTemplate?.template?.replace(
                    /{{paymentStatus}}/g,
                    `Success`,
                  ),
                }
              : paymentStatus === 'failed'
              ? {
                  failureTemplate: ticket[0]?.emailTemplates?.hotelTemplate?.failureTemplate
                    ?.replace(/{{paymentStatus}}/g, `Failed`)
                    ?.replace(/{{reason}}/g, status?.result?.description),
                }
              : {}),
          },
        }
        const now = new Date(Date.now())
        const result = await updateTicketCheckout(
          req,
          { checkoutId: checkoutId },
          {
            paymentStatus: paymentStatus,
            transactionId: uniqueId,
            emailTemplates: updatedTemplates,
            codes:paymentStatus === 'success' ? codes : [],
            status: paymentStatus === 'success' ? 'confirmed' : 'created',
            lastUpdatedAt : now,
          },
        )
        if (paymentStatus === 'success' || paymentStatus === 'failed') {
          const mailStatus = await fetch(
            `https://worker.mts-online.com/api/ticketbooking/mailer/${clientId}/${domainId}/${product}/${checkoutId}`,
            {
              method: 'POST',
            },
          )
        }
        res.json({ success: status, error: false, paymentStatus: paymentStatus })
      } else {
        res.json({ error: status, success: false })
      }
    } else {
      res.json({ error: status, success: false })
    }
  } catch (e) {
    console.log('err form catch', e)
    res.json({ error: e.message, success: false })
  }
})

export default handler
