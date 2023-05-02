import puppeteer from 'puppeteer'

const pdfBuilder = async ({ html, filename }) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 794, height: 1122 },
  })

  // console.log({ html })
  const page = await browser.newPage()
  await page.setViewport({ width: 794, height: 1122, deviceScaleFactor: 2 })
  await page.setContent(`<html>
    <head>
      <style>
        html,
        body {
          -webkit-print-color-adjust: exact;
          margin: 0 !important;
          padding: 0 !important;
        }
        body {
          width: 794px;
          height: 1122px;
          overflow: hidden;
        }
      </style>
    </head>
    <body>${html}</body>
  </html>`)
  const output = await page.pdf({ path: `./vouchers/${filename}`, format: 'A4', pageRanges: '1' })
  await browser.close()

  return output
  // return 4
}

export default pdfBuilder
