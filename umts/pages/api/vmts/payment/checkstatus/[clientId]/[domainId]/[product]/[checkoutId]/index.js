import nextConnect from 'next-connect'
import middleware from '../../../../../../../../../middlewares/middleware'
import cors from '../../../../../../../../../middlewares/cors'
import { getClientDataSource, updateVmtsVoucher, getVmtsVoucherCheckout } from '../../../../../../../../../lib/db'
// import pdfBuilder from '../../../../../../../../../lib/pdf'
import fs from 'fs'
// import Mailer from '../../../../../../../../../lib/mail2'
import { getHobexPaymentStatus } from '../../../../../../../../../lib/utils'

const handler = nextConnect()

handler.use(middleware).use(cors)

const getClientCredientals = async (req, domain, client, dataSource) => {
  const data = await getClientDataSource(req, domain, client, dataSource)
  return data ? data : null
}

handler.get(async (req, res) => {
  try {
    const origin = req.headers?.origin
    const locals = ['http://10.10.10.119:3004', 'http://localhost:3000']

    const { domainId, clientId, product, checkoutId } = req.query
    const voucher = await getVmtsVoucherCheckout(req, { checkoutId: checkoutId, domainId, clientId, product })
    const envType = voucher[0]?.paymentMode === 'live' && !locals.includes(origin) ? 'live' : 'test'
    // find client credientals
    const credientals =
      clientId &&
      (await getClientCredientals(
        req,
        envType === 'test' ? 'mts-online.com' : origin,
        envType === 'test' ? 'u0000' : clientId,
        'hobex',
      ))
    const testHobexUrl = 'https://eu-test.oppwa.com/v1/checkouts'
    const liveHobexUrl = 'https://oppwa.com/v1/checkouts'

    //   console.log("credientals",credientals)
    const result = await fetch(
      `${envType === 'test' ? testHobexUrl : liveHobexUrl}/${checkoutId}/payment?entityId=${credientals?.entityId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${credientals.password}`,
        },
      },
    )
    const status = await result.json()
    if (status.id) {
      fs.appendFile(
        './voucher_log.txt',
        `\n${new Date(
          Date.now(),
        ).toISOString()} | DOMAIN: ${domainId} | CLIENT: ${clientId} | TRANSACTION ID: ${checkoutId} | CODE: ${
          status?.result?.code
        }`,
        function (err) {
          console.log(err)
        },
      )
      const uniqueId = status.id
      const paymentStatus = getHobexPaymentStatus(status.result.code)
      if (paymentStatus && paymentStatus !== '') {
        const updatedTemplates = {
          ...voucher[0]?.emailTemplates,
          customerTemplate: {
            ...voucher[0]?.emailTemplates?.customerTemplate,
            ...(paymentStatus === 'success'
              ? {
                  template: voucher[0]?.emailTemplates?.customerTemplate?.template?.replace(
                    /{{paymentStatus}}/g,
                    `Success`,
                  ),
                }
              : paymentStatus === 'failed'
              ? {
                  failureTemplate: voucher[0]?.emailTemplates?.customerTemplate?.failureTemplate
                    ?.replace(/{{paymentStatus}}/g, `Failed`)
                    ?.replace(/{{reason}}/g, status?.result?.description),
                }
              : {}),
          },
          hotelTemplate: {
            ...voucher[0]?.emailTemplates?.hotelTemplate,
            ...(paymentStatus === 'success'
              ? {
                  template: voucher[0]?.emailTemplates?.hotelTemplate?.template?.replace(
                    /{{paymentStatus}}/g,
                    `Success`,
                  ),
                }
              : paymentStatus === 'failed'
              ? {
                  failureTemplate: voucher[0]?.emailTemplates?.hotelTemplate?.failureTemplate
                    ?.replace(/{{paymentStatus}}/g, `Failed`)
                    ?.replace(/{{reason}}/g, status?.result?.description),
                }
              : {}),
          },
        }
        const now = new Date(Date.now()).toISOString()
        const result = await updateVmtsVoucher(
          req,
          { checkoutId: checkoutId },
          {
            paymentStatus: paymentStatus,
            transactionId: uniqueId,
            emailTemplates: updatedTemplates,
            'voucherItems.$[].status': paymentStatus === 'success' ? 'redeemable' : 'registered',
            'voucherItems.$[].lastUpdatedAt': now,
          },
        )
        if (paymentStatus === 'success' || paymentStatus === 'failed') {
          const mailStatus = await fetch(
            `https://worker.mts-online.com/api/vmts/payment/mailer/${clientId}/${domainId}/${product}/${checkoutId}`,
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
