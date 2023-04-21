import nextConnect from 'next-connect'
import middleware from '../../../../middlewares/middleware'
import protectedAPI from '../../../../middlewares/protectedAPI'
import multer from 'multer'
import FormData from 'form-data'

const handler = nextConnect()

var upload = multer().any()

export const config = {
  api: {
    bodyParser: false,
  },
}

handler.use(middleware).use(protectedAPI).use(upload)

handler.post(async (req, res) => {
  const myFiles = req.files
  const clientId = req.query.id
  const kognitiveImages = JSON.parse(req.body.kognitiveImages)

  let form = new FormData()

  for (let i = 0; i < myFiles.length; i++) {
    form.append(`myImage-${i}`, myFiles[i].buffer, myFiles[i].originalname)
  }

  if (kognitiveImages) {
    form.append('kognitiveImages', JSON.stringify(kognitiveImages))
  } else {
    form.append('kognitiveImages', '')
  }

  const response = await fetch(`https://worker.mts-online.com/api/images/upload/${clientId}`, {
    method: 'POST',
    body: form,
  })
  // const response = await fetch(`http://10.10.10.119:3004/api/images/upload/${clientId}`, {
  //   method: 'POST',
  //   body: form,
  // })

  const data = await response.json()

  res.json(data)
})

export default handler
