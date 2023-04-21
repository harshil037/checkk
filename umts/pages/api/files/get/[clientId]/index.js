import nextConnect from 'next-connect'
import fs from 'fs'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'

const handler = nextConnect()

handler.use(middleware).use(cors)
handler.get((req, res) => {
  console.log('getting data  .... ', req.headers['key1'])
  let path = `../cdn.mts-online.com/httpdocs/${req.headers['key1']}/`
  if (fs.existsSync(path)) {
    try {
      let uploadedImages = []
      fs.readdirSync(path).forEach((file) => {
        uploadedImages.push({ name: file, url: `https://cdn.mts-online.com/${req.headers['key1']}/${file}` })
      })
      res.json({ success: true, message: 'uploaded', images: uploadedImages })
    } catch (err) {
      res.json({ success: false, error: err })
    }
  } else {
    res.json({ success: false, message: 'something wrong' })
  }
})

export default handler
