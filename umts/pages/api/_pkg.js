import nextConnect from 'next-connect'
import middleware from '../../middlewares/middleware'
// import * as esbuild from '@mts-online/eswasm'
// import * as esbuild from 'esbuild-wasm'
// import { unpkgPathPlugin } from '../../lib/unpkg-path-plugin'
// import stream from 'stream'
// import protectedAPI from "../../../middlewares/protectedAPI";
// import cors from "../../../middlewares/cors";

const handler = nextConnect()

// const checkStatus = (response) => {
//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status} - ${response.statusText}`)
//   }
//   return response
// }

handler.use(middleware) //

handler.get(async (req, res) => {
  // const path = encodeURIComponent('src/components/elements/Button/v_1').replace(/\_/g, '%5f')
  // const path = encodeURIComponent('src').replace(/\_/g, '%5f')
  // const pathWithFile = path + encodeURIComponent(`/index.ts`).replace(/\./g, '%2E').replace(/\_/g, '%5f')
  // const pathWithFile = encodeURIComponent(`${path}/index.js`).replace(/\./g, '%2E')

  // console.log({ pathWithFile })

  // const result = await fetch(`https://gitlab.com/api/v4/projects/31989629/repository/files/${pathWithFile}?ref=main`, {
  //   // const result = await fetch(`https://cdn.mts-online.com/u0000/dist/cjs/index.js`, {
  //   method: 'GET',
  //   headers: new Headers({
  //     'PRIVATE-TOKEN': 'glpat-3GbvwkDLQHs9nG8ym8Nr',
  //     'Content-Type': 'application/json',
  //   }),
  // })
  //   // .then((response) => checkStatus(response) && response.text())
  //   .then((response) => checkStatus(response) && response.json())
  //   .catch((err) => console.error(err)) // Never forget the final catch!

  // console.log({ result })
  // const decodedContent = result?.content && Buffer.from(result.content, 'base64').toString('utf-8')

  // console.log({ decodedContent })

  // try {
  //   esbuild.build({})
  // } catch (error) {
  //   if (error instanceof Error && error.message.includes('initialize')) {
  //     esbuild.initialize({
  //       worker: false,
  //     })
  //   } else {
  //     throw error
  //   }
  // }

  // // const text = `import {Button} from '@mts-online/library'
  // // console.log(Button)
  // // `
  // const styles = {
  //   'fontFamily-body': '"BodoniSvtyTwoITCTT-Book", sans-serif',
  //   'fontFamily-subHeading': '"SaveurSans-Regular", sans-serif',
  //   'fontFamily-heading': '"BodoniLTPro", serif',
  //   'fontFamily-button': '"SaveurSans-Regular", sans-serif',
  //   'fontSize-max': '22px',
  //   'fontSize-min': '16px',
  //   'fontSize-heading-max': '76.8',
  //   'fontSize-heading-min': '25.5',
  //   'fontSize-subHeading-max': '28.8',
  //   'fontSize-subHeading-min': '17.51',
  //   'fontSize-button-max': '24',
  //   'fontSize-button-min': '14.96',
  //   'lineHeight-body': '1.2',
  //   'fontWeight-heading': '400',
  //   'fontWeight-body': '400',
  //   'backgroundColor-primary': 'transparent',
  //   'backgroundColor-light': '#d2e4d8',
  //   'color-primary': '#2f1e19',
  //   'color-secondary': '#307e80',
  //   'color-light': '#d2e3d8',
  //   'color-button': '#307e80',
  //   'color-button-hover': '#2f1e19',
  //   'backgroundColor-button': '#2f1e19',
  //   'backgroundColor-button-hover': '#307e80',
  //   'viewPort-min': '640px',
  //   'viewPort-max': '1600px',
  //   'borderColor-button': '#307e80',
  //   'borderWidth-button': '5px',
  //   'padding-button': '.5em',
  //   'borderColor-button-hover': '#2f1e19',
  //   'textTransform-title': 'uppercase',
  //   'textTransform-subTitle': 'uppercase',
  //   'textTransform-button': 'uppercase',
  //   'opacity-button-hover': '.7',
  //   breakpoints: [
  //     {
  //       min: '400px',
  //       max: '900px',
  //       styles: {
  //         'color-button': 'red',
  //       },
  //     },
  //   ],
  // }

  // const text = `
  // import React from 'react'
  // import ReactDOM from 'react-dom'
  // import { default as ThemeProvider } from './components/themes/provider/v_1/Provider'
  // import { default as Button } from './components/elements/Button/v_1/Button'
  // ReactDOM.render(
  //   <React.StrictMode>
  //   <ThemeProvider>
  //       <Button onClick={() => console.log('Here we go')} text="Here we go" variation="primary" />
  //   </ThemeProvider>
  //   </React.StrictMode>,
  //   document.getElementById('__MTS'),
  // )
  // `

  // const data = esbuild
  //   .build({
  //     entryPoints: ['index.js'],
  //     bundle: true,
  //     minify: true,
  //     target: 'esnext',
  //     write: false,
  //     define: {
  //       'process.env.NODE_ENV': '"production"',
  //       global: 'window',
  //     },
  //     // plugins: [unpkgPathPlugin(decodedContent, 'https://cdn.mts-online.com/u0000/dist/cjs', 'https://unpkg.com')],
  //     plugins: [
  //       unpkgPathPlugin(
  //         text,
  //         // decodedContent,
  //         `https://gitlab.com/api/v4/projects/31704620/repository/files/src`,
  //         // `https://gitlab.com/api/v4/projects/31989629/repository/files/${path}`,
  //         'https://unpkg.com',
  //         '?ref=main',
  //       ),
  //     ],
  //     // plugins: [unpkgPathPlugin(text, 'https://unpkg.com', 'https://unpkg.com')],
  //   })
  //   .then((result) => result.outputFiles?.[0]?.text)

  // console.log({ data: await data })
  // res.setHeader('Cache-Control', 's-maxage=86400')
  res.json({ data: 4 })
  // res.setHeader('Content-Type', 'text/javascript')
  // res.send('console.log(`futaa`)')
  // res.send(await data)
})

export default handler
