import nextConnect from 'next-connect'
import middleware from '../../../../../../../../middlewares/middleware';
import cors from '../../../../../../../../middlewares/cors'
import {getVmtsVoucherCheckout} from "../../../../../../../../lib/db"

const handler = nextConnect()

handler.use(middleware).use(cors);

handler.get(async (req, res) => {
  try {
	const {domainId, clientId, product, checkoutId} = req.query;
	const voucherData = await getVmtsVoucherCheckout(req,{checkoutId:checkoutId, clientId:clientId, domainId:domainId, product:product})
  if(voucherData?.length){
    if(voucherData[0]?.paymentStatus){
      res.json({error: false, success: true, paymentStatus:voucherData[0]?.paymentStatus})
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
