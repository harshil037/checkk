import nextConnect from 'next-connect'
import middleware from '../../../middlewares/middleware'
import pdfBuilder from '../../../lib/pdf2'
import cors from '../../../middlewares/cors'

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.post(async (req, res) => {
  try {
    const data = typeof req.body === 'object' ? req.body : JSON.parse(req.body)
    const { html, path, filename, width, height, landscape, format, pageRanges, printBackground } = data
    const pdf = await pdfBuilder({
      html,
      path,
      filename,
      width,
      height,
      landscape,
      format,
      pageRanges,
      printBackground,
    })
    if (!pdf) {
      res.status(200).json({ success: false })
    } else {
      res.status(200).json({ success: true, pdf })
    }
  } catch (e) {
    console.log({ e })
    res.status(500).send({ success: false, error: e.message })
  }
})

export default handler
