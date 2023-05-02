import nextConnect from 'next-connect'
import formidable from "formidable"
// import fs from 'fs';
import { parseString } from "xml2js";
import { validateRequestXML } from '../../../lib/alpinebits/validations/validateRequestXML'
import { resolveHandshakingRequest } from '../../../lib/alpinebits/requests/resolveHandshakingRequest'
import { resolveHotelInfoRequest } from '../../../lib/alpinebits/requests/resolveHotelInfoRequest'

const handler = nextConnect()

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseXML = (xml) =>
  new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })

handler.post(async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return reject(err)

    if(!req.headers.authorization) {
      res.status(401).send('ERROR :: Bad request!! Need authorization.')
    } else if(req.headers.authorization) {
      const clientId = 'myclient';
      const apiUser = 'clientUsername'; // username for myclientid
      const apiPass = 'clientPassword'; // password for myclientid
      const auth = `Basic ${Buffer.from(`${apiUser}:${apiPass}`).toString('base64')}`
  
      if (req.headers.authorization == auth) {
        if (!(["2014-04", "2015-07", "2015-07b", "2017-10", "2018-10", "2020-10", "2022-10"].includes(req.headers?.['x-alpinebits-clientprotocolversion']))) {
          res.status(400).send('ERROR :: Bad request!! X-AlpineBits-ClientProtocolVersion header required.')
        }
        let response
        let reqestData
        let action = fields?.action;
        let reqXML = fields?.request
        if(!reqXML) {
            res.status(200).end('ERROR: not valid request parameters.')
        }
        // if(files?.request) {
        //     // read request xml file content
        //     const fileData = fs.readFileSync(reqXML.path, function (err, data) {
        //         const file = Buffer.from(data).toString('utf-8')
        //         return file
        //     });
        //     reqestData = fileData.toString('utf-8')
        // } else if(fields?.request) {
        //     reqestData = fields?.request
        // }
        reqestData = reqXML

        // Start :: validate xml request
        const validateReq = await validateRequestXML(req.headers?.['x-alpinebits-clientprotocolversion'], reqestData)
        if (!validateReq.result.ota || !validateReq.result.xsd || !validateReq.result.rng) {
          res.status(200).end('ERROR: not valid request xml.')
        }
        // End :: validate xml request
        // parse xml request content to json
        let parsedReqJson = await parseXML(reqestData.replace(/\r?\n+\s+|\r/g, " "))

        switch (action) {
          case "OTA_Ping:Handshaking":
            response = resolveHandshakingRequest(parsedReqJson);
            break;
          case "OTA_HotelDescriptiveInfo:Inventory":
            response = await resolveHotelInfoRequest(parsedReqJson);
            break;
          default:
            response = "ERROR:unknown or missing action."
            break;
        }
        res.setHeader("Content-Type", "application/xml");
        res.status(200).send(response)
      } else {
        res.status(400).send('ERROR :: Bad request!! Wrong credentials.')
      }
    }
  });
})

export default handler
