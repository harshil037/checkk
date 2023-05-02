import nextConnect from 'next-connect'
import fs from 'fs'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'

const handler = nextConnect()

handler.use(middleware)
handler.post((req, res) => {
  const clientId = req.query.clientId

  console.log('hello there this is path ... for delete ,,, ', req.headers['key1'])
  const image = req.query.image
  let path = `../cdn.mts-online.com/httpdocs/${req.headers['key1']}/${image}`
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path)
      let uploadedImages = []
      fs.readdirSync(`../cdn.mts-online.com/httpdocs/${req.headers['key1']}/`).forEach((file) => {
        uploadedImages.push({ name: file, url: `https://cdn.mts-online.com/${req.headers['key1']}/${file}` })
      })
      res.json({ success: true, message: 'deleted', images: uploadedImages })
    } catch (err) {
      console.log(err)
    }
  } else {
    res.json({ success: false, message: 'image not found' })
  }
})

export default handler
