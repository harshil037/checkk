import nextConnect from 'next-connect'
import middleware from '../../../../../../../../middlewares/middleware';
import cors from '../../../../../../../../middlewares/cors'
import {getTicketCheckout} from "../../../../../../../../lib/db"

const handler = nextConnect()

handler.use(middleware).use(cors);

handler.get(async (req, res) => {
  try {
	const {domain, clientId, product, checkoutId} = req.query;
	const ticketData = await getTicketCheckout(req, { checkoutId: checkoutId, domainId:domain, clientId, concert:product })
  // console.log(ticketData)
  if(ticketData?.length){
    if(ticketData[0]?.paymentStatus){
      res.json({error: false, success: true, paymentStatus:ticketData[0]?.paymentStatus})
    }else{
        res.json({error: 'Status not updated yet', success: false})
      }
  }else{
    res.json({error: "No Data found", success: false})
  }
  } catch (e) {
    res.json({ error: e.message, success: false })
  }
})

export default handler
