import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import protectedAPI from '../../../middlewares/protectedAPI'
import multer from 'multer'
import FormData from 'form-data'

const handler = nextConnect()

var upload = multer().single('flipBookPdf')

export const config = {
  api: {
    bodyParser: false,
  },
}

handler.use(middleware).use(protectedAPI).use(upload)

handler.post(async (req, res) => {
  const myFile = req.file

  const { originalname, buffer } = myFile
  const { clientId, productName, language, version } = req.body
  let form = new FormData()
  form.append('clientId', clientId)
  form.append('productName', productName)
  form.append('version', version)
  form.append('language', language)
  form.append('flipBookPdf', buffer, originalname)

  const response = await fetch(`https://worker.mts-online.com/api/flipBook/pdf`, {
    method: 'POST',
    body: form,
  })
  // const response = await fetch(`http://10.10.10.119:3004/api/flipBook/pdf`, {
  //   method: 'POST',
  //   body: form,
  // })

  const data = await response.json()

  res.json(data)
})

export default handler
