import nextConnect from 'next-connect'
import cors from '../../../../middlewares/cors'
import middleware from '../../../../middlewares/middleware'
const htmlparser2 = require('htmlparser2')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const handler = nextConnect()

handler.use(middleware).use(cors)

handler.get(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const {
    query: { client, product },
  } = req

  // const widgetURL = `https://u.mts-online.com/clients/${client}/index.html`
  // const widgetURL = `http://localhost:8010/${client}/${product}/`
  const widgetURL = `https://cdn.mts-online.com/${client}/${product}/`
  // const widgetURL =  `http://localhost:8010/u0724/vmts/`
  const widgetMetaTags = ['next-head-count']
  const isJson = (text) => {
    try {
      JSON.parse(text)
      return true
    } catch (error) {
      return false
    }
  }

  console.log({ client })
  console.log({ product })

  const widgetsFetch = await fetch(widgetURL)
    .then((res) => {
      return { data: res.text(), error: null }
    })
    .catch((error) => {
      return { data: null, error: 'no widgets found' }
    })

  const { data: widgetsText, error } = widgetsFetch
  if (error) {
    res.statusCode = 404
    res.json({ body: [], links: [], metas: [], error })
  } else {
    const dom = new JSDOM(await widgetsText)
    const body = dom && dom.window.document.querySelector('body')
    const head = dom && dom.window.document.querySelector('head')
    const links = (head && Array.from(head.querySelectorAll('link'))) || []
    const styles = (head && Array.from(head.querySelectorAll('style'))) || []
    const metas = (head && Array.from(head.querySelectorAll('meta'))) || []
    let linksArray = []
    let stylesArray = []
    let metasArray = []
    const parser = new htmlparser2.Parser({
      onopentag(tagname, attribs) {
        // tagname === 'link' && linksArray.push({ ...attribs, ...(attribs.href && { href: widgetURL.replace('/index.html', '') + attribs.href }) })
        tagname === 'link' && linksArray.push({ ...attribs, ...(attribs.href && { href: attribs.href }) })
        tagname === 'style' && stylesArray.push(attribs)
        tagname === 'meta' && attribs.name && widgetMetaTags.includes(attribs.name) && metasArray.push(attribs)
      },
    })
    for (const link of links) {
      parser.write(link.outerHTML)
    }
    for (const meta of metas) {
      parser.write(meta.outerHTML)
    }
    for (const style of styles) {
      parser.write(style.outerHTML)
    }
    parser.end()
    const widgetScriptsStringBody =
      body &&
      Array.from(body.querySelectorAll('script')).reduce((acc, w) => {
        if (!isJson(w.innerHTML)) {
          return [
            ...acc,
            {
              // ...(w.src && { url: widgetURL.replace('/index.html', '') + w.src }),
              ...(w.src && { url: w.src }),
              ...(w.innerHTML && { body: w.innerHTML }),
              ...(w.id && { id: w.id }),
              ...(w.className && { class: w.className }),
              ...(w.type && { type: w.type }),
              ...(w.nomodule && { preload: w.nomodule }),
            },
          ]
        } else return [...acc]
      }, [])

    const widgetScriptsStringHead =
      head &&
      Array.from(head.querySelectorAll('script')).reduce((acc, w) => {
        if (!isJson(w.innerHTML)) {
          return [
            ...acc,
            {
              // ...(w.src && { url: widgetURL.replace('/index.html', '') + w.src }),
              ...(w.src && { url: w.src }),
              ...(w.innerHTML && { body: w.innerHTML }),
              ...(w.id && { id: w.id }),
              ...(w.className && { class: w.className }),
              ...(w.type && { type: w.type }),
              ...(w.nomodule && { preload: w.nomodule }),
            },
          ]
        } else return [...acc]
      }, [])

    const widgetScriptsString = [...widgetScriptsStringBody, ...widgetScriptsStringHead]

    body &&
      body.querySelectorAll('script').forEach((e) => {
        !isJson(e.innerHTML) && e.remove()
      })

    const bodyString = body && body.innerHTML

    const response = body
      ? { body: bodyString, scripts: widgetScriptsString, links: linksArray, metas: metasArray }
      : { body: '', scripts: [], metas: [], errors: 'no widgets found' }

    res.statusCode = body ? 200 : 404
    res.json(response)
  }
})

export default handler
