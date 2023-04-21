import nextConnect from 'next-connect'
import fs from 'fs'

const handler = nextConnect()

handler.get((req, res) => {
  const clientId = req.query.clientId
  const image = req.query.imgName
  let path = `../cdn.mts-online.com/httpdocs/${clientId}/static/${image}`

  if (fs.existsSync(path)) {
    var stat = fs.statSync(path)
    res.writeHead(200, {
      'Content-Type': 'image/jpg',
      'Content-Length': stat.size,
    })
    var readStream = fs.createReadStream(path)
    readStream.pipe(res)
  } else {
    res.json({ success: false, message: 'image not found' })
  }
})

export default handler
