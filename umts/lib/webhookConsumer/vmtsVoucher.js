import { getVmtsVoucherCheckout, updateVmtsVoucher, revertHobexPayment } from '../db'
import { getHobexPaymentStatus } from '../utils'

/**
 * To Update Voucher data
 * @param {Object} req clientId of customer
 * @param {string} clientId clientId of customer
 * @param {string} domain Domain of customer
 * @param {string} productName Product Name
 * @param {Object} data data coming from web hook
 */
export const vmtsVoucherUpdate = async (req, clientId, domain, productName, data) => {
  const { payload } = data
  const status = getHobexPaymentStatus(payload.result.code)
  try {
    if (payload && payload.result.code) {
      const voucherData = await getVmtsVoucherCheckout(req, { checkoutId: payload.ndc })
      const voucher = voucherData[0]
      const updatedTemplates = {
        ...voucher?.emailTemplates,
        customerTemplate: {
          ...voucher?.emailTemplates?.customerTemplate,
          ...(status === 'success'
            ? {
                template: voucher?.emailTemplates?.customerTemplate?.template?.replace(/{{paymentStatus}}/g, `Success`),
              }
            : status === 'failed'
            ? {
                failureTemplate: voucher?.emailTemplates?.customerTemplate?.failureTemplate
                  ?.replace(/{{paymentStatus}}/g, `Failed`)
                  ?.replace(/{{reason}}/g, payload?.result?.description),
              }
            : {}),
        },
        hotelTemplate: {
          ...voucher?.emailTemplates?.hotelTemplate,
          ...(status === 'success'
            ? {
                template: voucher?.emailTemplates?.hotelTemplate?.template?.replace(/{{paymentStatus}}/g, `Success`),
              }
            : status === 'failed'
            ? {
                failureTemplate: voucher?.emailTemplates?.hotelTemplate?.failureTemplate
                  ?.replace(/{{paymentStatus}}/g, `Failed`)
                  ?.replace(/{{reason}}/g, payload?.result?.description),
              }
            : {}),
        },
      }
      const now = new Date(Date.now()).toISOString()
      if (voucher) {
        if (payload.paymentType == 'RF') {
          if (voucher?.paymentStatus !== 'cancelled') {
            if (status === 'success') {
              const result = await updateVmtsVoucher(
                req,
                { checkoutId: payload.ndc },
                {
                  paymentStatus: 'failed',
                  confirmedBy: 'webhook',
                  status: 'refunded',
                  emailTemplates: updatedTemplates,
                },
              )
              if (result) {
                console.log(`${voucher._id} refunded`)
              } else {
                console.log(`${voucher._id} refund failed to update in db.`)
              }
            } else {
              console.log(`${voucher._id} refund failed due to ${payload.result.code}`)
            }
          } else {
            console.log('ALREADY CANCEL')
          }
        } else if (payload.paymentType == 'DB') {
          if (voucher.paymentStatus !== 'success') {
            // ================ status is success =================
            if (status === 'success') {
              const result = await updateVmtsVoucher(
                req,
                { checkoutId: payload.ndc },
                {
                  paymentStatus: 'success',
                  confirmedBy: 'webhook',
                  status: 'completed',
                  emailTemplates: updatedTemplates,
                  'voucherItems.$[].status': 'redeemable',
                  'voucherItems.$[].lastUpdatedAt': now,
                },
              )
              console.log('result', result)
              const mailStatus = await fetch(
                `https://worker.mts-online.com/api/vmts/payment/mailer/${clientId}/${domain}/${productName}/${payload.ndc}`,
                {
                  method: 'POST',
                },
              )
              const res = await mailStatus.json()
              console.log('Mail status: ', res)
              if (result) {
                console.log(`${voucher._id} payment success`)
              } else {
                console.log(`${voucher._id} payment success unable to update in db`)
              }
            }
            // ================ status is pending =================
            else if (status === 'pending') {
              const result = await updateVmtsVoucher(
                req,
                { checkoutId: payload.ndc },
                { paymentStatus: 'pending', confirmedBy: 'webhook', status: 'PaymentProceed' },
              )
              if (result) {
                console.log(`${voucher._id} payment pending updated to db.`)
              } else {
                console.log(`${voucher._id} payment pending unable to update`)
              }
            }
            // ================ status is failed =================
            else if (status === 'failed') {
              const result = await updateVmtsVoucher(
                req,
                { checkoutId: payload.ndc },
                {
                  paymentStatus: 'failed',
                  confirmedBy: 'webhook',
                  status: 'completed',
                  emailTemplates: updatedTemplates,
                },
              )
              if (result) {
                console.log(`${voucher._id} payment failed updated to db.`)
              } else {
                console.log(`${voucher._id} payment failed unable to update`)
              }
            }
            // ================ status is review =================
            else if (status === 'review') {
              const result = await updateVmtsVoucher(
                req,
                { checkoutId: payload.ndc },
                { paymentStatus: 'revert', confirmedBy: 'webhook', status: 'PaymentProceed' },
              )
              await revertHobexPayment(
                req,
                {
                  amount: payload.amount,
                  test: voucher?.paymentMode === 'test',
                  currency: payload.currency,
                  checkoutId: payload.ndc,
                },
                clientId,
                req.headers.origin,
              )
              if (result) {
                console.log(`${voucher._id} payment review updated to db.`)
              } else {
                console.log(`${voucher._id} payment review unable to update`)
              }
            }
            // ================ Unable to configure status =================
            else {
              const result = await updateVmtsVoucher(
                req,
                { checkoutId: payload.ndc },
                { webhookConfigFailure: payload.result },
              )
              console.log(`${paymentRecord._id} Unable to retrive status ${payload.result.code}`)
            }
          } else {
            console.log(`${voucher._id} ALREADY Proccessed`)
            // console.log(data);
          }
        } else {
          console.log(`${voucher._id} NEW TYPE ERROR FROM HOBEX OR PAYMENT TYPE NOT REGISTERED IN HOBEX CONSUMER`)
          // console.log(data);
        }
      } else {
        console.log(`No such vouchers registered with us ${payload.ndc}`)
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
