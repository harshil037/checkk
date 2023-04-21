import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import cors from '../../../../middlewares/cors'
import fs from 'fs'
import multer from 'multer'
import http from 'http'
import https from 'https'
import { Transform as Stream } from 'stream'

const handler = nextConnect()

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const clientId = req.query.id
    try {
      if (fs.existsSync(`../cdn.mts-online.com/httpdocs/${clientId}`)) {
        if (fs.existsSync(`../cdn.mts-online.com/httpdocs/${clientId}/static`)) {
          if (fs.existsSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)) {
            cb(null, `../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
          } else {
            fs.mkdirSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
            cb(null, `../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
          }
        } else {
          fs.mkdirSync(`../cdn.mts-online.com/httpdocs/${clientId}/static`)
          fs.mkdirSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
          cb(null, `../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
        }
      } else {
        fs.mkdirSync(`../cdn.mts-online.com/httpdocs/${clientId}`)
        fs.mkdirSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/`)
        fs.mkdirSync(`../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
        cb(null, `../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages`)
      }
    } catch (err) {
      console.log(err)
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.${file.originalname.split(".")?.[1] || 'jpeg'}`)
  },
})

var upload = multer({ storage: storage }).any()

export const config = {
  api: {
    bodyParser: false,
  },
}

handler.use(middleware).use(cors).use(upload)
handler.post(async (req, res) => {
  const myFiles = req.files
  const clientId = req.query.id
  let path = `../cdn.mts-online.com/httpdocs/${clientId}/static/vmtsimages/`


  if (fs.existsSync(path)) {
    try {
      let uploadedImages = []
      myFiles?.forEach((file) => {
        uploadedImages.push({ name: file.filename, url: `https://cdn.mts-online.com/${clientId}/static/vmtsimages/${file.filename}` })
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
