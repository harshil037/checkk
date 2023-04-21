import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import protectedAPI from '../../../../../../middlewares/protectedAPI'
import ensureReqBody from '../../../../../../middlewares/ensureReqBody'
import { isArray, isObject } from '../../../../../../lib/utils'
import { parseStringPromise } from 'xml2js'

const handler = nextConnect()

// remove namespacing and sanitize the xml
const cleanKognitivXML = (XML) =>
  [
    {
      match:
        /ota:| xmlns:ota="http:\/\/www.opentravel\.org\/OTA\/2003\/05"| xmlns="http:\/\/www.opentravel.org\/OTA\/2003\/05"|seekda:| xmlns:seekda="http:\/\/connect.seekda.com\/2009\/04"/g,
      replaceWith: '',
    },
    { match: /[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\x9F]/u, replaceWith: '' }, // remove non visible control characters
    { match: /[\xA0]/u, replaceWith: ' ' }, // replace utf8 non breaking space
    { match: /\r?\n/m, replaceWith: ' ' }, // remove newlines
    { match: /[\t\s]+/m, replaceWith: ' ' }, // replace tabs and spaces with one space
    { match: /s*&euro;s*/, replaceWith: '&nbsp;€&nbsp;' }, // avoid € breaking to the next line
  ].reduce((acc, rule) => acc.replace(rule.match, rule.replaceWith), XML)

const resolveXMLRates = (rates, accessCode) => {
  return rates.RatePlan.reduce((acc, ratePlan) => {
    if (isObject(ratePlan.Rates.Rate) && ratePlan.RateAccessCode === accessCode) {
      acc[ratePlan.Rates.Rate.InvTypeCode]
        ? acc[ratePlan.Rates.Rate.InvTypeCode].push(ratePlan.RatePlanCode)
        : (acc[ratePlan.Rates.Rate.InvTypeCode] = Array(1).fill(ratePlan.RatePlanCode))
    } else if (isArray(ratePlan.Rates.Rate) && ratePlan.RateAccessCode === accessCode) {
      acc[ratePlan.Rates.Rate[0].InvTypeCode]
        ? acc[ratePlan.Rates.Rate[0].InvTypeCode].push(ratePlan.RatePlanCode)
        : (acc[ratePlan.Rates.Rate[0].InvTypeCode] = Array(1).fill(ratePlan.RatePlanCode))
    }
    return acc
  }, {})
}

handler
  .use(middleware) //
  .use(protectedAPI)
  .use(ensureReqBody)

handler.get(async (req, res) => {
  const { propertyCode, accessCode } = req.query

  const url = `https://switch.seekda.com/switch/1.009/rest/${propertyCode}/rates?skd-channel-id=ibe`

  // console.log(accessCode)

  const response = await fetch(url, {
    headers: {
      Authorization: 'Basic aW5mb0BtdHMtaXRhbGlhLml0OkFGNTdVVDNTVE00Wg==',
      'Content-Type': 'application/xml',
    },
  })

  const xml = await response.text()

  const ratesXML = cleanKognitivXML(xml)

  const ratesJSON = await parseStringPromise(ratesXML, { mergeAttrs: true, explicitArray: false })
  const ratePlans = ratesJSON?.OTA_HotelRatePlanRS?.RatePlans

  res.status(200).json({ success: true, data: resolveXMLRates(ratePlans, accessCode) })
})

export default handler
