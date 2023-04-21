import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import cors from '../../../../middlewares/cors'
import fs from 'fs'
import multer from 'multer'
import http from 'http'
import https from 'https'
import { Transform as Stream } from 'stream'
const handler = nextConnect()

function makeDirectory(arr, req) {
  for (let index = 0; index < arr.length; index++) {
    req.basePath = `${req.basePath}/${arr[index]}`
    req.relativePath = `${req.relativePath}/${arr[index]}`
    if (!fs.existsSync(req.basePath)) {
      fs.mkdirSync(req.basePath)
    }
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, req.basePath)
    },
    filename: function (req, file, cb) {
      const { pathId } = req.body
      cb(null, `img-${pathId}-localImg-${file.originalname}`)
    },
  }),
}).any()

export const config = {
  api: {
    bodyParser: false,
  },
}

async function apiConfig(req, res, next) {
  try {
    req.basePath = '../cdn.mts-online.com/httpdocs'
    req.relativePath = ''
    //const arr = [req.query.id, 'static', 'voucher-images']
    const arr = req.headers['key1'].split('/')
    makeDirectory(arr, req)
    next()
  } catch (err) {
    console.log('error Occured .... ', err)
    res.json({ success: false, error: err })
  }
}

handler.use(middleware).use(cors).use(apiConfig).use(upload)

handler.post(async (req, res) => {
  const clientId = req.query.id
  var kognitiveImages = null
  const { pathId } = req.body

  if (req.body.kognitiveImages) {
    kognitiveImages = JSON.parse(req.body.kognitiveImages)
  }

  if (kognitiveImages) {
    const downloadImageFromUrl = (url, filename, resolve, reject) => {
      var client = http
      if (url.toString().indexOf('https') === 0) {
        client = https
      }
      try {
        client
          .request(url, function (response) {
            var data = new Stream()

            response.on('data', function (chunk) {
              data.push(chunk)
            })

            response.on('end', function () {
              try {
                fs.writeFileSync(filename, data.read())
                resolve(true)
              } catch (err) {
                // console.log(err)
                res.json({ success: false, error: err })
              }
            })
            response.on('error', (err) => reject(err))
          })
          .end()
      } catch (err) {
        // console.log(err)
        res.json({ success: false, error: err })
      }
    }

    for (let i = 0; i < kognitiveImages.length; i++) {
      const extention = kognitiveImages[i].split('.').pop()
      let p = new Promise((resolve, reject) =>
        downloadImageFromUrl(
          kognitiveImages[i],
          `${req.basePath}/img-${pathId}-KognitiveImg${i}-${clientId}.${extention}`,
          resolve,
          reject,
        ),
      )
      try {
        await p
      } catch (err) {
        // console.log(err)
        res.json({ success: false, error: err })
      }
    }
  }

  if (fs.existsSync(req.basePath)) {
    try {
      let uploadedImages = []
      fs.readdirSync(req.basePath).forEach((file) => {
        uploadedImages.push({ name: file, url: `https://cdn.mts-online.com${req.relativePath}/${file}` })
      })
      res.json({ success: true, message: 'uploaded', images: uploadedImages })
    } catch (err) {
      console.log('error occured ...')
      res.json({ success: false, error: err })
    }
  } else {
    res.json({ success: false, message: 'something wrong' })
  }
})

export default handler
