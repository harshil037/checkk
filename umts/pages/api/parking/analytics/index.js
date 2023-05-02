import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import { getParkingDetails } from '../../../../lib/db'

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  try {
      if(!req.query.fromDate){
          res.status(500).send({ success: false, error: "Please enter valid date." })
        }
        let fromDate = req.query.fromDate;
        let toDate = req.query.toDate ? req.query.toDate :  req.query.fromDate;
        const parking = await getParkingDetails(req,fromDate,toDate);
        res.status(200).send({success:true,data:parking});
  } catch (e) {
    res.status(500).send({ success: false, error: e.message })
  }
})

export default handler
