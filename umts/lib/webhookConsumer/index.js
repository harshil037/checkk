import {vmtsVoucherUpdate} from "./vmtsVoucher"
import {paymentRecordUpdate} from "./paymentForm"
import {ticketBookingConsumer} from "./ticketBooking"
/**
 * To consume webhook data
 * @param {string} type type of consumer
 * @param {object} payload data coming from web hook
 */
const webhookConsumer = (type = '', payload = {}) => {
  switch (type) {
    case 'vmtsConsumer':
      vmtsVoucherUpdate(payload?.req, payload?.clientId ,payload?.domain,  payload?.product, payload.data)
      // console.log('VMTS consumer ===>', payload)
      break
    case 'paymentWidgetConsumer':
      paymentRecordUpdate(payload?.req, payload?.clientId ,payload?.domain,  payload?.product, payload.data)
      // console.log('VMTS consumer ===>', payload)
      break
    case 'ticketBookingConsumer':
      ticketBookingConsumer(payload?.req, payload?.clientId ,payload?.domain,  payload?.product, payload.data)
      // console.log('VMTS consumer ===>', payload)
      break
    default:
      // console.log('No consumer type defined ===>', payload)
  }
}

export default webhookConsumer
