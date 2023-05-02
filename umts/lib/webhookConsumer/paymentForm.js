import { getPaymentRecords, updatePaymentRecords , revertHobexPayment} from '../db'
import { getHobexPaymentStatus } from '../utils'
import { saltHashPassword,encryptHexa } from '../../lib/crypto'

/**
 * To Update Payment Record data
 * @param {Object} req clientId of customer
 * @param {string} clientId clientId of customer
 * @param {string} domain Domain of customer
 * @param {string} productName Product Name
 * @param {Object} data data coming from web hook
 */
export const paymentRecordUpdate = async (req, clientId, domain, productName, data) => {
  const { payload } = data
  const status = getHobexPaymentStatus(payload.result.code)
  try {
    if (payload && payload.result.code) {
      const paymentRecordsData = await getPaymentRecords(req, { checkoutId: payload.ndc })
      const paymentRecord = paymentRecordsData[0]
      if (paymentRecord) {
        // Payment type Refund
        if (payload.paymentType == 'RF') {
          if (paymentRecord?.paymentStatus !== 'cancelled') {
            if (status === 'success') {
              const result = await updatePaymentRecords(
                req,
                { checkoutId: payload.ndc },
                { ...paymentRecord, paymentStatus: 'failed', confirmedBy: 'webhook', status: 'refunded',
                customerTemplate: {
                  ...paymentRecord?.customerTemplate,
                  failureTemplate: paymentRecord?.customerTemplate?.failureTemplate
                    ?.replace(/{{paymentStatus}}/g, `failed`)
                    ?.replace(/{{transactionId}}/g, `${payload?.id}`)
                    ?.replace(/{{reason}}/g, `Refunded successfully`),
                },
                hotelTemplate: {
                  ...paymentRecord?.hotelTemplate,
                  failureTemplate: paymentRecord?.hotelTemplate?.failureTemplate
                    ?.replace(/{{paymentStatus}}/g, `${status}`)
                    ?.replace(/{{transactionId}}/g, `${payload?.id}`)
                    ?.replace(/{{reason}}/g, `Refunded successfully`),
                }, },
              )
              const mailStatus = await fetch(
                `https://worker.mts-online.com/api/paymentWidget/mailer/${clientId}/${domain}/${payload.ndc}`,
                {
                  method: 'POST',
                },
              )
              const res = await mailStatus.json()
              console.log('Mail status: ', res)
              if (result) {
                console.log(`${paymentRecord._id} refunded`)
              } else {
                console.log(`${paymentRecord._id} refund failed to update in db.`)
              }
            } else {
              console.log(`${paymentRecord._id} refund failed due to ${payload.result.code}`)
            }
          } else {
            console.log('ALREADY CANCEL')
          }
        }

        // Payment Type Debit
        else if (payload.paymentType == 'DB') {
          if (paymentRecord?.paymentStatus !== 'success') {
            // ================ status is success =================
            if (status === 'success') {
              const { card, threeDSecure, customParameters, buildNumber, ...requiredPaymentResponse } = payload
              const result = await updatePaymentRecords(
                req,
                { checkoutId: payload.ndc },
                {
                  ...paymentRecord,
                  paymentStatus: 'success',
                  confirmedBy: 'webhook',
                  status: 'completed',
                  paymentResponse : requiredPaymentResponse,
                  transactionData: {fetched:false, debug : encryptHexa(SECRET, JSON.stringify(card))},
                  customerTemplate: {
                    ...paymentRecord?.customerTemplate,
                    template: paymentRecord?.customerTemplate?.template
                      ?.replace(/{{paymentStatus}}/g, `${status}`)
                      ?.replace(/{{transactionId}}/g, `${payload?.id}`),
                  },
                  hotelTemplate: {
                    ...paymentRecord?.hotelTemplate,
                    template: paymentRecord?.hotelTemplate?.template
                      ?.replace(/{{paymentStatus}}/g, `${status}`)
                      ?.replace(/{{transactionId}}/g, `${payload?.id}`),
                  },
                },
              )
              const mailStatus = await fetch(
                `https://worker.mts-online.com/api/paymentWidget/mailer/${clientId}/${domain}/${payload.ndc}`,
                {
                  method: 'POST',
                },
              )
              const res = await mailStatus.json()
              console.log('Mail status: ', res)
              if (result) {
                console.log(`${paymentRecord._id} payment success updated to db.`)
              } else {
                console.log(`${paymentRecord._id} payment success unable to update in db`)
              }
            }
            // ================ status is pending =================
            else if (status === 'pending') {
              const result = await updatePaymentRecords(
                req,
                { checkoutId: payload.ndc },
                { ...paymentRecord, paymentStatus: 'pending', confirmedBy: 'webhook', status: 'PaymentProceed' },
              )
              if (result) {
                console.log(`${paymentRecord._id} payment pending updated to db.`)
              } else {
                console.log(`${paymentRecord._id} payment pending unable to update`)
              }
            }
            // ================ status is failed =================
            else if (status === 'failed') {
              const { card, threeDSecure, customParameters, buildNumber, ...requiredPaymentResponse } = payload
              const result = await updatePaymentRecords(
                req,
                { checkoutId: payload.ndc },
                {
                  ...paymentRecord,
                  paymentStatus: 'failed',
                  confirmedBy: 'webhook',
                  status: 'completed',
                  paymentResponse : requiredPaymentResponse,
                  transactionData: {fetched:false, debug : encryptHexa(SECRET, JSON.stringify(card))},
                  customerTemplate: {
                    ...paymentRecord?.customerTemplate,
                    failureTemplate: paymentRecord?.customerTemplate?.failureTemplate
                      ?.replace(/{{paymentStatus}}/g, `${status}`)
                      ?.replace(/{{transactionId}}/g, `${payload?.id}`)
                      ?.replace(/{{reason}}/g, `${payload.result?.description}`),
                  },
                  hotelTemplate: {
                    ...paymentRecord?.hotelTemplate,
                    failureTemplate: paymentRecord?.hotelTemplate?.failureTemplate
                      ?.replace(/{{paymentStatus}}/g, `${status}`)
                      ?.replace(/{{transactionId}}/g, `${payload?.id}`)
                      ?.replace(/{{reason}}/g, `${payload.result?.description}`),
                  },
                },
              )
              const mailStatus = await fetch(
                `https://worker.mts-online.com/api/paymentWidget/mailer/${clientId}/${domain}/${payload.ndc}`,
                {
                  method: 'POST',
                },
              )
              const res = await mailStatus.json()
              console.log('Mail status: ', res)
              if (result) {
                console.log(`${paymentRecord._id} payment failed updated to db.`)
              } else {
                console.log(`${paymentRecord._id} payment failed unable to update`)
              }
            }
            // ================ status is review =================
            else if (status === 'review') {
              const result = await updatePaymentRecords(
                req,
                { checkoutId: payload.ndc },
                { ...paymentRecord, paymentStatus: 'revert', confirmedBy: 'webhook', status: 'PaymentProceed' },
              )
              await revertHobexPayment(
                req,
                { amount: payload.amount, test: paymentRecord.paymentMode === 'test', currency: payload.currency, checkoutId:payload.ndc },
                clientId,
                req.headers.origin,
              )
              //
              if (result) {
                console.log(`${paymentRecord._id} payment reverted updated to db.`)
              } else {
                console.log(`${paymentRecord._id} payment revert unable to update`)
              }
            }
            // ================ Unable to configure status =================
            else {
              const result = await updatePaymentRecords(
                req,
                { checkoutId: payload.ndc },
                { ...paymentRecord, webhookConfigFailure: payload.result },
              )
              if (result) {
                console.log(`${paymentRecord._id} webhookConfigFailure updated to db.`)
              } else {
                console.log(`${paymentRecord._id} unable to update webhookConfigFailure`)
              }
              console.log(`${paymentRecord._id} Unable to retrive status ${payload.result.code}`)
            }
          } else {
            console.log(`${paymentRecord._id} ALREADY Proccessed`)
            // console.log(data);
          }
        } else {
          console.log(`${paymentRecord._id} NEW TYPE ERROR FROM HOBEX`)
          // console.log(data);
        }
      } else {
        console.log(`No such payment records registered with us ${payload.ndc}`)
      }
    } else {
      console.log('NOT OUR REQUEST')
      // console.log(data);
    }
  } catch (err) {
    console.log('GONE TO CATCH BLOCK')
    console.log(err)
  }
}
