import nextConnect from 'next-connect'
import fs from 'fs'
import middleware from '../../../../../middlewares/middleware'
import cors from '../../../../../middlewares/cors'

const handler = nextConnect()

handler.use(middleware).use(cors)
handler.post((req, res) => {
  const clientId = req.query.clientId
  const image = req.query.image
  let path = `../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages/${image}`
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path)
      let uploadedImages = []
      fs.readdirSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages/`).forEach((file) => {
        uploadedImages.push({ name: file, url: `https://cdn.mts-online.com/${clientId}/static/vmtsimages/${file}` })
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
