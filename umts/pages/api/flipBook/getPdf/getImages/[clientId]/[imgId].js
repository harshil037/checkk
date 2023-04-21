import nextConnect from 'next-connect'
import fs from 'fs'

const handler = nextConnect()

handler.get(async (req, res) => {
  const clientId = req.query.clientId
  const imgId = req.query.imgId
  if (fs.existsSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/pdf/images/${imgId}`)) {
    var stat = fs.statSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/pdf/images/${imgId}`)

    res.writeHead(200, {
      'Content-Type': 'image/jpg',
      'Content-Length': stat.size,
    })
    var readStream = fs.createReadStream(`../cdn.mts-online.com/httpdocs/${clientId}/static/pdf/images/${imgId}`)
    readStream.pipe(res)
  } else {
    res.json(false)
  }
})

export default handler
