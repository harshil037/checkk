import { getTicketCheckout, updateTicketCheckout, revertHobexPayment } from '../db'
import { getHobexPaymentStatus } from '../utils'

/**
 * To Update ticket data
 * @param {Object} req clientId of customer
 * @param {string} clientId clientId of customer
 * @param {string} domain Domain of customer
 * @param {string} productName Product Name
 * @param {Object} data data coming from web hook
 */
export const ticketBookingConsumer = async (req, clientId, domain, productName, data) => {
  const { payload } = data
  const status = getHobexPaymentStatus(payload.result.code)
  try {
    if (payload && payload.result.code) {
      const ticketData = await getTicketCheckout(req, { checkoutId: payload.ndc })
      const ticket = ticketData[0]
      const confirmedCheckouts = await getTicketCheckout(req, { concert:product, status:"confirmed"})
      const codes = [];
      let bookedTickets =  confirmedCheckouts?.length ? confirmedCheckouts?.reduce((res, curr)=>{
        res += parseInt(curr?.quantity)
        return res
      },0) : 0
      for(let i = 0; i<parseInt(ticket?.quantity || 0); i++){
        codes.push(`${ticket?.ticketPrefix}-${bookedTickets+1 +i}`)
      }
      const updatedTemplates = {
        ...ticket?.emailTemplates,
        customerTemplate: {
          ...ticket?.emailTemplates?.customerTemplate,
          ...(status === 'success'
            ? {
                template: ticket?.emailTemplates?.customerTemplate?.template?.replace(/{{paymentStatus}}/g, `Success`),
              }
            : status === 'failed'
            ? {
                failureTemplate: ticket?.emailTemplates?.customerTemplate?.failureTemplate
                  ?.replace(/{{paymentStatus}}/g, `Failed`)
                  ?.replace(/{{reason}}/g, payload?.result?.description),
              }
            : {}),
        },
        hotelTemplate: {
          ...ticket?.emailTemplates?.hotelTemplate,
          ...(status === 'success'
            ? {
                template: ticket?.emailTemplates?.hotelTemplate?.template?.replace(/{{paymentStatus}}/g, `Success`),
              }
            : status === 'failed'
            ? {
                failureTemplate: ticket?.emailTemplates?.hotelTemplate?.failureTemplate
                  ?.replace(/{{paymentStatus}}/g, `Failed`)
                  ?.replace(/{{reason}}/g, payload?.result?.description),
              }
            : {}),
        },
      }
      const now = new Date(Date.now())
      if (ticket) {
        if (payload.paymentType == 'RF') {
          if (ticket?.paymentStatus !== 'cancelled') {
            if (status === 'success') {
              const result = await updateTicketCheckout(
                req,
                { checkoutId: payload.ndc },
                {
                  paymentStatus: 'failed',
                  confirmedBy: 'webhook',
                  status: 'cancelled',
                  emailTemplates: updatedTemplates,
                },
              )
              if (result) {
                console.log(`${ticket._id} refunded`)
              } else {
                console.log(`${ticket._id} refund failed to update in db.`)
              }
            } else {
              console.log(`${ticket._id} refund failed due to ${payload.result.code}`)
            }
          } else {
            console.log('ALREADY CANCEL')
          }
        } else if (payload.paymentType == 'DB') {
          if (ticket.paymentStatus !== 'success') {
            // ================ status is success =================
            if (status === 'success') {
              const result = await updateTicketCheckout(
                req,
                { checkoutId: payload.ndc },
                {
                  paymentStatus: 'success',
                  confirmedBy: 'webhook',
                  status: 'confirmed',
                  codes:paymentStatus === 'success' ? codes : [],
                  emailTemplates: updatedTemplates,
                  lastUpdatedAt: now,
                },
              )
              console.log('result', result)
              const mailStatus = await fetch(
                `https://worker.mts-online.com/api/ticketbooking/mailer/${clientId}/${domain}/${productName}/${payload.ndc}`,
                {
                  method: 'POST',
                },
              )
              const res = await mailStatus.json()
              console.log('Mail status: ', res)
              if (result) {
                console.log(`${ticket._id} payment success`)
              } else {
                console.log(`${ticket._id} payment success unable to update in db`)
              }
            }
            // ================ status is pending =================
            else if (status === 'pending') {
              const result = await updateTicketCheckout(
                req,
                { checkoutId: payload.ndc },
                { paymentStatus: 'pending', confirmedBy: 'webhook', lastUpdatedAt: now },
              )
              if (result) {
                console.log(`${ticket._id} payment pending updated to db.`)
              } else {
                console.log(`${ticket._id} payment pending unable to update`)
              }
            }
            // ================ status is failed =================
            else if (status === 'failed') {
              const result = await updateTicketCheckout(
                req,
                { checkoutId: payload.ndc },
                {
                  paymentStatus: 'failed',
                  confirmedBy: 'webhook',
                  status: 'cancelled',
                  emailTemplates: updatedTemplates,
                  lastUpdatedAt: now,
                },
              )
              if (result) {
                console.log(`${ticket._id} payment failed updated to db.`)
              } else {
                console.log(`${ticket._id} payment failed unable to update`)
              }
            }
            // ================ status is review =================
            else if (status === 'review') {
              const result = await updateTicketCheckout(
                req,
                { checkoutId: payload.ndc },
                { paymentStatus: 'revert', confirmedBy: 'webhook', status : "cancelled"},
              )
              await revertHobexPayment(
                req,
                {
                  amount: payload.amount,
                  test: ticket?.paymentMode === 'test',
                  currency: payload.currency,
                  checkoutId: payload.ndc,
                },
                clientId,
                req.headers.origin,
              )
              if (result) {
                console.log(`${ticket._id} payment review updated to db.`)
              } else {
                console.log(`${ticket._id} payment review unable to update`)
              }
            }
            // ================ Unable to configure status =================
            else {
              const result = await updateTicketCheckout(
                req,
                { checkoutId: payload.ndc },
                { webhookConfigFailure: payload.result },
              )
              console.log(`${paymentRecord._id} Unable to retrive status ${payload.result.code}`)
            }
          } else {
            console.log(`${ticket._id} ALREADY Proccessed`)
            // console.log(data);
          }
        } else {
          console.log(`${ticket._id} NEW TYPE ERROR FROM HOBEX OR PAYMENT TYPE NOT REGISTERED IN HOBEX CONSUMER`)
          // console.log(data);
        }
      } else {
        console.log(`No such tickets registered with us ${payload.ndc}`)
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
