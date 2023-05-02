import nextConnect from 'next-connect'
import { ObjectId } from 'mongodb'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../middlewares/ensureReqBody'
import cors from '../../../../middlewares/cors'
import { createPaymentRecord, updatePaymentRecord, getPaymentRecords } from '../../../../lib/db'
import { getHobexPaymentStatus } from '../../../../lib/utils'
import { getClientCredientals } from '../../../../lib/db'
import { saltHashPassword,encryptHexa } from '../../../../lib/crypto'

const handler = nextConnect()

handler.use(middleware).use(cors)
//  .use(protectedAPI).use(ensureReqBody).use(cors)

// * status: created, paymentInitiated, PaymentProceed, completed
// * paymentStatus: pending, success, failed
const SECRET = process.env.ENCRYPTION_SECRET
handler.post(async (req, res) => {
  try {
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body)
    const { paymentMode,provider, ...bodyData } = data
    const result = await createPaymentRecord(req, {
      ...bodyData,
      paymentMode,
      provider: provider|| "HOBEX",
      status: 'created',
      createdAt: new Date(),
    })
    if (result.error) {
      res.status(500).json({
        error: { message: 'Problem while inserting the record in database.' },
      })
    } else {
      res.status(200).json(result)
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

handler.put(async (req, res) => {
  try {
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body)
    const { paymentMode, ...bodyData } = data

    const _id = typeof req.query.recordId === 'string' ? ObjectId(req.query.recordId) : req.query.recordId
    const paymentRecordsData = await getPaymentRecords(req, { _id })
    // const initiatPayment = await updatePaymentRecord(req, _id, {
    //   // checkoutId: bodyData?.checkoutId,
    //   // resourcePath: bodyData?.resourcePath,
    //   ...bodyData,
    //   status: 'paymentInitiated',
    //   updatedAt: new Date(),
    // })
    // if (initiatPayment.error) {
    //   res.status(500).json({
    //     error: { message: 'Problem while updating the payment record in database.' },
    //   })
    // }
    let HOBEX_ENDPOINT, CREDENTIALS
    if (paymentMode === 'live') {
      HOBEX_ENDPOINT = `https://eu-prod.oppwa.com/v1/checkouts/`
      CREDENTIALS =
        paymentRecordsData[0]?.client &&
        (await getClientCredientals(req, req?.headers?.origin, paymentRecordsData[0]?.client, 'hobex'))
    } else {
      HOBEX_ENDPOINT = `https://eu-test.oppwa.com/v1/checkouts/`
      CREDENTIALS = {
        entityId: '8a829418530df1d201531299e097175c',
        password: 'OGE4Mjk0MTg1MzBkZjFkMjAxNTMxMjk5ZTJjMTE3YWF8ZzJnU3BnS2hLUw==',
      }
    }
    const paymnet = await fetch(`${HOBEX_ENDPOINT}${bodyData?.checkoutId}/payment?entityId=${CREDENTIALS.entityId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CREDENTIALS.password}`,
      },
    })
    const paymentResponse = await paymnet.json()

    const paymentStatus = paymentResponse.id && getHobexPaymentStatus(paymentResponse?.result?.code)

    let status = '',
      customerTemplate = paymentRecordsData[0]?.customerTemplate?.template,
      hotelTemplate = paymentRecordsData[0]?.hotelTemplate?.template,
      failureCustomerTemplate = paymentRecordsData[0]?.customerTemplate?.failureTemplate,
      failureHotelTemplate = paymentRecordsData[0]?.hotelTemplate?.failureTemplate

    if (paymentStatus === 'success') {
      status = 'completed'
      customerTemplate = paymentRecordsData[0]?.customerTemplate?.template
        ?.replace(/{{paymentStatus}}/g, `${paymentStatus}`)
        ?.replace(/{{transactionId}}/g, `${paymentResponse?.id}`)
      hotelTemplate = paymentRecordsData[0]?.hotelTemplate?.template
        ?.replace(/{{paymentStatus}}/g, `${paymentStatus}`)
        ?.replace(/{{transactionId}}/g, `${paymentResponse?.id}`)
    } else if (paymentStatus === 'pending') {
      status = 'paymentProceed'
    } else if (paymentStatus === 'failed') {
      status = 'completed'
      failureCustomerTemplate = paymentRecordsData[0]?.customerTemplate?.failureTemplate
        ?.replace(/{{paymentStatus}}/g, `${paymentStatus}`)
        ?.replace(/{{transactionId}}/g, `${paymentResponse?.id}`)
        ?.replace(/{{reason}}/g, `${paymentResponse?.result?.description}`)
      failureHotelTemplate = paymentRecordsData[0]?.hotelTemplate?.failureTemplate
        ?.replace(/{{paymentStatus}}/g, `${paymentStatus}`)
        ?.replace(/{{transactionId}}/g, `${paymentResponse?.id}`)
        ?.replace(/{{reason}}/g, `${paymentResponse?.result?.description}`)
    } else if (paymentStatus === 'review') {
      status = 'completed'
      failureCustomerTemplate = paymentRecordsData[0]?.customerTemplate?.failureTemplate
        ?.replace(/{{paymentStatus}}/g, `${paymentStatus}`)
        ?.replace(/{{transactionId}}/g, `${paymentResponse?.id}`)
        ?.replace(/{{reason}}/g, `${paymentResponse?.result?.description}`)
      failureHotelTemplate = paymentRecordsData[0]?.hotelTemplate?.failureTemplate
        ?.replace(/{{paymentStatus}}/g, `${paymentStatus}`)
        ?.replace(/{{transactionId}}/g, `${paymentResponse?.id}`)
        ?.replace(/{{reason}}/g, `${paymentResponse?.result?.description}`)
    } else {
      status = 'paymentProceed'
    }

    const { card, threeDSecure, customParameters, buildNumber, ...requiredPaymentResponse } = paymentResponse

    let record = paymentStatus
      ? {
          paymentResponse: {
            ...requiredPaymentResponse,
          },
          transactionData: {fetched:false, debug : encryptHexa(SECRET, JSON.stringify(card))},
          customerTemplate: {
            ...paymentRecordsData[0]?.customerTemplate,
            template: customerTemplate,
            failureTemplate: failureCustomerTemplate,
          },
          hotelTemplate: {
            ...paymentRecordsData[0]?.hotelTemplate,
            template: hotelTemplate,
            failureTemplate: failureHotelTemplate,
          },
          status,
          confirmedBy: 'widget',
          paymentStatus,
          resourcePath: bodyData?.resourcePath,
          updatedAt: new Date(),
        }
      : {}

    const completePayment = await updatePaymentRecord(req, _id, {
      ...record,
      updatedAt: new Date(),
    })

    if (completePayment.error) {
      res.status(500).json({
        error: { message: 'Problem while updating the payment record in database.' },
      })
    } else {
      const mailStatus = await fetch(
        `https://worker.mts-online.com/api/paymentWidget/mailer/${paymentRecordsData[0]?.client}/${paymentRecordsData[0]?.domainId}/${bodyData?.checkoutId}`,
        {
          method: 'POST',
        },
      )
      const mailStatusRes = mailStatus?.ok && (await mailStatus.json())
      res.status(200).json(completePayment)
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
