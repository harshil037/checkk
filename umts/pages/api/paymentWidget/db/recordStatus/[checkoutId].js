import nextConnect from 'next-connect'
import middleware from '../../../../../middlewares/middleware';
import cors from '../../../../../middlewares/cors'
import {getPaymentRecords} from "../../../../../lib/db"

const handler = nextConnect()

handler.use(middleware).use(cors);

handler.get(async (req, res) => {
  try {
	const { checkoutId} = req.query;
	const paymentRecordsData = await getPaymentRecords(req, { 'checkoutId': checkoutId })
    const paymentRecord = paymentRecordsData[0]
    if(paymentRecord?.paymentStatus){
      res.json({error: false, success: true, paymentStatus:paymentRecord?.paymentStatus})
    }else{
        res.json({error: 'Status not updated yet', success: false})
      }
  } catch (e) {
    res.json({ error: e.message, success: false })
  }
})

export default handler
