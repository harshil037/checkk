import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'

const MTS_CLIENT_ID = 'u1060'
const MTS_CLIENT_SECRET = 'tofisch123'
const handler = nextConnect()
const isAuthorized = (req) => {
  const header = req.headers['authorization']

  console.log(req.headers)
  console.log({ header })

  if (!header) return false

  const base64 = header.replace('Basic ', '')
  const [username, password] = Buffer.from(base64, 'base64').toString().split(':')

  return username === MTS_CLIENT_ID && password === MTS_CLIENT_SECRET
}

handler.use(middleware) //

handler.get(async (req, res) => {
  const {
    query: { clientId, page },
  } = req

  // if (!isAuthorized(req)) {
  //   res.status(401).send({ error: 'Unauthorized' })
  //   return
  // }

  switch (clientId) {
    case 'u1060': {
      const pageData = {
        clientId: 'u1060',
        domainId: '6310ba6aa739f00009f302b4',
        languages: [
          {
            code: 'de',
            title: 'de',
            path: '/',
          },
          {
            code: 'en',
            title: 'en',
            path: '/en',
          },
          {
            code: 'it',
            title: 'it',
            path: '/it',
          },
        ],
        styles: {
          maxWidth: '1680px',
          'color-primary': '#5D4D46',
          'color-secondary': '#D9C6B0',
          'color-secondary-dark': '#7E7E7E',
          'backgroundColor-primary': '#D9C6B0',
          'backgroundColor-primary-light': '#ECE3D8',
          'backgroundColor-primary-dark': '#C4B2A1',
          'backgroundColor-secondary': '#5D4D46',
          'backgroundColor-surface': '#fff',
          'color-button': '#5D4D46',
          'color-button-hover': '#D9C6B0',
          'color-button-hover': '#D9C6B0',
          'color-button-hover': '#D9C6B0',
          'backgroundColor-button': 'transparent',
          'backgroundColor-button-hover': '#5D4D46',
          'color-button-dark': '#D9C6B0',
          'color-button-hover-dark': '#5D4D46',
          'color-button-cta': '#D9C6B0',
          'color-button-hover-cta': '#5D4D46',
          'backgroundColor-button-dark': '#5D4D46',
          'backgroundColor-button-hover-dark': 'transparent',
          'backgroundColor-button-cta': '#5D4D46',
          'backgroundColor-button-hover-cta': 'transparent',
          'borderColor-primary': '#3E5951',
          'borderWidth-button': '1px',
          'transition-button': 'all 0.2s ease-in-out',
          'padding-button': '0.5rem 1.5em',
          'fontSize-base': '16px',
          'fontSize-heading': '40px',
          'lineHeight-heading': '1',
          'fontSize-button': '16px',
          'fontFamily-heading': 'Viaoda Libre, serif',
          'fontFamily-body': 'Kari, sans-serif',
          'fontFamily-button': 'Karia, sans-serif',
          "maxWidth-copyrights": '1140px',
          'borderColor-secondary':'#00000080',
          'borderWidth': '1px'
        },
        pages: [
          {
            path: '/',
            language: 'de',
            hrefLang: {
              en: '/en',
              it: '/it',
            },
            meta: {
              title: "Ariane's Guesthouse | Sexten",
              description: "Ariane's Guesthouse",
            },
            layout: {
              module: 'MenuHeaderContentFooter',
              library: '@mts-online/library-light',
              blockProps: {
                active: true,
                headerBar: { active: true, fixed: true },
                slots: {
                  logo: {
                    active: true,
                  },
                  menu: {
                    active: true,
                  },
                  languageMenu: {
                    active: true,
                  },
                  header: {
                    active: true,
                  },
                  content: {
                    active: true,
                  },
                  footer: {
                    active: true,
                  },
                },
              },
            },
            modules: [
              {
                id: 'mod1',
                module: 'Logo',
                library: '@mts-online/library-light',
                slot: 'logo',
                blockProps: {
                  active: true,
                  src: 'https://cdn.mts-online.com/u1060/static/img/logo.svg',
                  alt: "Ariane's Guesthouse",
                  width: 300,
                  height: 53,
                },
              },
              {
                id: 'mod2',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'menu',
                blockProps: {
                  active: true,
                  items: [
                    { id: 'item1', title: "Ariane's Guesthouse", anchor: 'header', active: true },
                    { id: 'item2', title: 'Wohnen', anchor: 'wohnen', active: true },
                    {
                      id: 'item3',
                      title: 'Kontakt',
                      href: 'tel:+39 0471 79 00 00',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/phone.svg',
                      active: true,
                      iconWidth: 24,
                      iconHeight: 24,
                      iconLazy: false,
                    },
                    {
                      id: 'item4',
                      title: 'Anfragen',
                      action: 'openRequestForm',
                      active: true,
                      itemVariant: 'button-text',
                      buttonVariant: 'primary',
                    },
                    {
                      id: 'item5',
                      title: 'Anfragen',
                      to: 'https://booking.arianes-guesthouse.com/?skd-language-code=de',
                      target: '_blank',
                      active: true,
                      itemVariant: 'button-text',
                      buttonVariant: 'cta',
                    },
                  ],
                },
              },
              {
                id: 'mod3',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'languageMenu',
                blockProps: {
                  active: true,
                  variation: 'dropdown',
                  items: [
                    { id: 'item1', title: 'de', href: '/', hrefLang: 'de', active: true },
                    { id: 'item2', title: 'en', href: '/en', hrefLang: 'en', active: true },
                    { id: 'item3', title: 'it', href: '/it', hrefLang: 'it', active: true },
                  ],
                },
              },
              {
                id: 'mod4',
                module: 'ImageSlider',
                library: '@mts-online/library-light',
                slot: 'header',
                blockProps: {
                  active: true,
                  slides: [
                    {
                      id: 'item1',
                      src: 'https://cdn.mts-online.com/u1060/static/img/ariana-banner.jpg',
                      alt: "Ariane's Guesthouse",
                      fit: 'cover',
                      lazy: false,
                    },
                  ],
                },
              },
              {
                id: 'mod5',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  active: true,
                  general: {
                    position: 'right',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Cam_21.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    active: true,
                    title: "Ariane's Guesthouse",
                    text: "<p>Einfach ankommen, den gewissen Luxus inmitten einer atemberaubenden Landschaft erleben und gleichzeitig zurück zum Ursprung finden. Das ist das Motto von Ariane, Helmut, Marcel und Pirmin Villgrater!</p><p>Ariane's Guesthouse ist ein Ort zum Loslassen, zum Entspannen, zum Genießen... ein Ort, wo man inmitten der Sextner Bergwelt ankommt.</p><p>Alle Wohnungen in Ariane's Guesthouse sind modern, ganz speziell, offen und mit viel Liebe zum Detail eingerichtet. Lassen Sie sich überraschen von dieser einzigartigen Atmosphäre.</p>",
                  },
                },
              },
              {
                id: 'mod6',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  active: true,
                  general: {
                    position: 'left',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Inspiration-Küche1(1)1.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    active: true,
                    title: 'Nimm dir Zeit spontan zu sein',
                    text: '<p>In einer Welt, die sich immer schneller dreht, immer flüchtiger und lauter wird – wo bleibt da die Zeit für Bewusstsein und Phantasie? Wohin gehen wir, wenn wir uns nach Stille, echten Werten, Ursprünglichkeit und Natürlichkeit sehnen?</p><p>Ziel ist Ganzheitlichkeit und Achtsamkeit: Natur, Gesundheit & Genuss für die ganze Familie. “Hier leben wir in und mit der Natur. Das sollen auch unsere Gäste erleben dürfen, wenn sie ihren Urlaub hier verbringen!”, so die Gastgeber.</p><p>Ariane kocht gerne und bereitet liebevoll Schlutzkrapfen und Knödel vor, welche die Gäste jederzeit erwerben können - sie kann Dir einige Tipps geben und Dich vielleicht auch mal mitkochen lassen, wer weiß…</p>',
                  },
                },
              },
            ],
          },
          {
            path: '/impressum',
            language: 'de',
            meta: {
              title: "Impressum | Ariane's Guesthouse | Sexten",
              description: "Ariane's Guesthouse",
            },
            layout: {
              module: 'MenuHeaderContentFooter',
              library: '@mts-online/library-light',
              blockProps: {
                active: true,
                headerBar: { active: true, fixed: true },
                slots: {
                  logo: {
                    active: true,
                  },
                  menu: {
                    active: true,
                  },
                  languageMenu: {
                    active: true,
                  },
                  header: {
                    active: false,
                  },
                  content: {
                    active: true,
                  },
                },
              },
            },
            modules: [
              {
                id: 'mod7',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  general: {
                    position: 'right',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Inspiration-Küche1(1)1.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    title: 'Nimm dir Zeit spontan zu sein',
                    text: '<p>Wir ließen uns inspirieren von kreativen Ideen, die wir auf Reisen gesammelt haben und schufen dabei einen einzigartigen Stil mit Südtiroler Wurzeln und Ethnoeinflüssen aus liebgewonnenen Sehnsuchtsorten.</p>',
                  },
                },
              },
            ],
          },
          {
            path: '/it',
            language: 'it',
            hrefLang: {
              en: '/en',
              de: '/',
            },
            meta: {
              title: "Ariane's Guesthouse | Sesto",
              description: "Ariane's Guesthouse",
            },
            layout: {
              module: 'MenuHeaderContentFooter',
              library: '@mts-online/library-light',
              blockProps: {
                active: true,
                headerBar: { active: true, fixed: true },
                slots: {
                  logo: {
                    active: true,
                  },
                  menu: {
                    active: true,
                  },
                  languageMenu: {
                    active: true,
                  },
                  header: {
                    active: true,
                  },
                  content: {
                    active: true,
                  },
                },
              },
            },
            modules: [
              {
                id: 'mod8',
                module: 'Logo',
                library: '@mts-online/library-light',
                slot: 'logo',
                blockProps: {
                  active: true,
                  src: 'https://cdn.mts-online.com/u1060/static/img/logo.svg',
                  alt: "Ariane's Guesthouse",
                  width: 300,
                  height: 53,
                },
              },
              {
                id: 'mod9',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'menu',
                blockProps: {
                  active: true,
                  items: [
                    { id: 'item1', title: "Ariane's Guesthouse", anchor: 'header', active: true },
                    { id: 'item2', title: 'Wohnen', anchor: 'wohnen', active: true },
                    {
                      id: 'item3',
                      title: 'Kontakt',
                      href: 'tel:+39 0471 79 00 00',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/phone.svg',
                      active: true,
                      iconWidth: 24,
                      iconHeight: 24,
                      iconLazy: false,
                    },
                    {
                      id: 'item4',
                      title: 'Anfragen',
                      action: 'openRequestForm',
                      active: true,
                      itemVariant: 'button-text',
                      buttonVariant: 'primary',
                    },
                    {
                      id: 'item5',
                      title: 'Anfragen',
                      to: 'https://booking.arianes-guesthouse.com/?skd-language-code=de',
                      target: '_blank',
                      active: true,
                      itemVariant: 'button-text',
                      buttonVariant: 'cta',
                    },
                  ],
                },
              },
              {
                id: 'mod10',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'languageMenu',
                blockProps: {
                  active: true,
                  variation: 'dropdown',
                  items: [
                    { id: 'item1', title: 'de', href: '/', hrefLang: 'de', active: true },
                    { id: 'item2', title: 'en', href: '/en', hrefLang: 'en', active: true },
                    { id: 'item3', title: 'it', href: '/it', hrefLang: 'it', active: true },
                  ],
                },
              },
              {
                id: 'mod11',
                module: 'ImageSlider',
                library: '@mts-online/library-light',
                slot: 'header',
                blockProps: {
                  active: true,
                  slides: [
                    {
                      id: 'item1',
                      src: 'https://cdn.mts-online.com/u1060/static/img/ariana-banner.jpg',
                      alt: "Ariane's Guesthouse",
                      fit: 'cover',
                      lazy: false,
                    },
                  ],
                },
              },
              {
                id: 'mod12',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  active: true,
                  general: {
                    position: 'right',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Cam_21.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    active: true,
                    title: "Ariane's Guesthouse",
                    text: "<p>Einfach ankommen, den gewissen Luxus inmitten einer atemberaubenden Landschaft erleben und gleichzeitig zurück zum Ursprung finden. Das ist das Motto von Ariane, Helmut, Marcel und Pirmin Villgrater!</p><p>Ariane's Guesthouse ist ein Ort zum Loslassen, zum Entspannen, zum Genießen... ein Ort, wo man inmitten der Sextner Bergwelt ankommt.</p><p>Alle Wohnungen in Ariane's Guesthouse sind modern, ganz speziell, offen und mit viel Liebe zum Detail eingerichtet. Lassen Sie sich überraschen von dieser einzigartigen Atmosphäre.</p>",
                  },
                },
              },
              {
                id: 'mod13',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  active: true,
                  general: {
                    position: 'left',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Inspiration-Küche1(1)1.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    active: true,
                    title: 'Nimm dir Zeit spontan zu sein',
                    text: '<p>In einer Welt, die sich immer schneller dreht, immer flüchtiger und lauter wird – wo bleibt da die Zeit für Bewusstsein und Phantasie? Wohin gehen wir, wenn wir uns nach Stille, echten Werten, Ursprünglichkeit und Natürlichkeit sehnen?</p><p>Ziel ist Ganzheitlichkeit und Achtsamkeit: Natur, Gesundheit & Genuss für die ganze Familie. “Hier leben wir in und mit der Natur. Das sollen auch unsere Gäste erleben dürfen, wenn sie ihren Urlaub hier verbringen!”, so die Gastgeber.</p><p>Ariane kocht gerne und bereitet liebevoll Schlutzkrapfen und Knödel vor, welche die Gäste jederzeit erwerben können - sie kann Dir einige Tipps geben und Dich vielleicht auch mal mitkochen lassen, wer weiß…</p>',
                  },
                },
              },
            ],
          },
          {
            path: '/en',
            language: 'en',
            hrefLang: {
              it: '/it',
              de: '/',
            },
            meta: {
              title: "Ariane's Guesthouse | Sesto",
              description: "Ariane's Guesthouse",
            },
            layout: {
              module: 'MenuHeaderContentFooter',
              library: '@mts-online/library-light',
              blockProps: {
                active: true,
                headerBar: { active: true, fixed: true },
                slots: {
                  logo: {
                    active: true,
                  },
                  menu: {
                    active: true,
                  },
                  languageMenu: {
                    active: true,
                  },
                  header: {
                    active: true,
                  },
                  content: {
                    active: true,
                  },
                },
              },
            },
            modules: [
              {
                id: 'mod14',
                module: 'Logo',
                library: '@mts-online/library-light',
                slot: 'logo',
                blockProps: {
                  active: true,
                  src: 'https://cdn.mts-online.com/u1060/static/img/logo.svg',
                  alt: "Ariane's Guesthouse",
                  width: 300,
                  height: 53,
                },
              },
              {
                id: 'mod15',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'menu',
                blockProps: {
                  active: true,
                  items: [
                    { id: 'item1', title: "Ariane's Guesthouse", anchor: 'header', active: true },
                    { id: 'item2', title: 'Wohnen', anchor: 'wohnen', active: true },
                    {
                      id: 'item3',
                      title: 'Kontakt',
                      href: 'tel:+39 0471 79 00 00',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/phone.svg',
                      active: true,
                      iconWidth: 24,
                      iconHeight: 24,
                      iconLazy: false,
                    },
                    {
                      id: 'item4',
                      title: 'Anfragen',
                      action: 'openRequestForm',
                      active: true,
                      itemVariant: 'button-text',
                      buttonVariant: 'primary',
                    },
                    {
                      id: 'item5',
                      title: 'Anfragen',
                      to: 'https://booking.arianes-guesthouse.com/?skd-language-code=de',
                      target: '_blank',
                      active: true,
                      itemVariant: 'button-text',
                      buttonVariant: 'cta',
                    },
                  ],
                },
              },
              {
                id: 'mod16',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'languageMenu',
                blockProps: {
                  active: true,
                  variation: 'dropdown',
                  items: [
                    { id: 'item1', title: 'de', href: '/', hrefLang: 'de', active: true },
                    { id: 'item2', title: 'en', href: '/en', hrefLang: 'en', active: true },
                    { id: 'item3', title: 'it', href: '/it', hrefLang: 'it', active: true },
                  ],
                },
              },
              {
                id: 'mod17',
                module: 'ImageSlider',
                library: '@mts-online/library-light',
                slot: 'header',
                blockProps: {
                  active: true,
                  slides: [
                    {
                      id: 'item1',
                      src: 'https://cdn.mts-online.com/u1060/static/img/ariana-banner.jpg',
                      alt: "Ariane's Guesthouse",
                      fit: 'cover',
                      lazy: false,
                    },
                  ],
                },
              },
              {
                id: 'mod18',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  active: true,
                  general: {
                    position: 'right',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Cam_21.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    active: true,
                    title: "Ariane's Guesthouse",
                    text: "<p>Einfach ankommen, den gewissen Luxus inmitten einer atemberaubenden Landschaft erleben und gleichzeitig zurück zum Ursprung finden. Das ist das Motto von Ariane, Helmut, Marcel und Pirmin Villgrater!</p><p>Ariane's Guesthouse ist ein Ort zum Loslassen, zum Entspannen, zum Genießen... ein Ort, wo man inmitten der Sextner Bergwelt ankommt.</p><p>Alle Wohnungen in Ariane's Guesthouse sind modern, ganz speziell, offen und mit viel Liebe zum Detail eingerichtet. Lassen Sie sich überraschen von dieser einzigartigen Atmosphäre.</p>",
                  },
                },
              },
              {
                id: 'mod19',
                module: 'ImageTextBox',
                library: '@mts-online/library-light',
                slot: 'content',
                blockProps: {
                  active: true,
                  general: {
                    position: 'left',
                    variation: 'box-in-box',
                  },
                  image: {
                    active: true,
                    zoom: true,
                    src: 'https://cdn.mts-online.com/u1060/static/img/Inspiration-Küche1(1)1.png',
                    alt: "Ariane's Guesthouse",
                  },
                  content: {
                    active: true,
                    title: 'Nimm dir Zeit spontan zu sein',
                    text: '<p>In einer Welt, die sich immer schneller dreht, immer flüchtiger und lauter wird – wo bleibt da die Zeit für Bewusstsein und Phantasie? Wohin gehen wir, wenn wir uns nach Stille, echten Werten, Ursprünglichkeit und Natürlichkeit sehnen?</p><p>Ziel ist Ganzheitlichkeit und Achtsamkeit: Natur, Gesundheit & Genuss für die ganze Familie. “Hier leben wir in und mit der Natur. Das sollen auch unsere Gäste erleben dürfen, wenn sie ihren Urlaub hier verbringen!”, so die Gastgeber.</p><p>Ariane kocht gerne und bereitet liebevoll Schlutzkrapfen und Knödel vor, welche die Gäste jederzeit erwerben können - sie kann Dir einige Tipps geben und Dich vielleicht auch mal mitkochen lassen, wer weiß…</p>',
                  },
                },
              },
              {
                id: 'mod20',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'contact',
                blockProps: {
                  active: true,
                  variation: 'vertical',
                  align: 'center',
                  items: [
                    {
                      id: 'item1',
                      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                      anchor: 'location',
                      active: true,
                      itemVariant: 'icon-text',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/one.png',
                      iconWidth: 24,
                      iconHeight: 24,
                      hoverVariant: 'underline',
                      itemClassName: 'MTS__justify-between MTS__my-2 MTS__gap-3',
                    },
                    {
                      id: 'item2',
                      title: '+39 366 3533442',
                      anchor: 'phone',
                      active: true,
                      itemVariant: 'icon-text',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/phone.svg',
                      iconWidth: 24,
                      iconHeight: 24,
                      hoverVariant: 'underline',
                      itemClassName: 'MTS__justify-between MTS__my-2 MTS__gap-3',
                    },
                    {
                      id: 'item2',
                      title: 'info@arianes-guesthouse.com',
                      anchor: 'mail',
                      active: true,
                      itemVariant: 'icon-text',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/two.png',
                      iconWidth: 24,
                      iconHeight: 24,
                      hoverVariant: 'underline',
                      itemClassName: 'MTS__justify-between MTS__my-2 MTS__gap-3',
                    },
                  ],
                }
              },
              {
                id: 'mod21',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'map',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'xlarge',
                  align: 'center',
                  items: [
                    {
                      id: 'item1',
                      title: '',
                      href: 'map',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/three.png',
                      active: true,
                      iconWidth: 605,
                      iconHeight: 281,
                      iconLazy: false,
                    },
                  ],
                }
              },
              {
                id: 'mod22',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'newsletter',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'xlarge',
                  align: 'left',
                  items: [{ id: 'item1', title: 'NEWSLETTER', active: true }],
                  className:"MTS__my-3 MTS__text-base MTS__text-primary MTS__font-bold",
                }
              },
              {
                id: 'mod23',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'followus',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'none',
                  align: 'left',
                  className:'MTS__gap-1',
                  items: [
                    { id: 'item1', title: 'Follow us on', active: true , className:"MTS__mr-3"},
                    {
                      id: 'item2',
                      title: '',
                      anchor: 'mail',
                      active: true,
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/instagram.png',
                      iconWidth: 18,
                      iconHeight: 18,
                      hoverVariant: 'underline',
                      itemClassName: 'MTS__justify-between MTS__my-2',
                    },
                    {
                      id: 'item3',
                      anchor: 'mail',
                      title: '',
                      active: true,
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/facebook.png',
                      iconWidth: 18,
                      iconHeight: 18,
                      hoverVariant: 'underline',
                      itemClassName: 'MTS__justify-between MTS__my-2',
                    },
                  ],
                }
              },
              {
                id: 'mod24',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'social',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'xlarge',
                  align: 'center',
                  items: [
                    {
                      id: 'item1',
                      title: '',
                      href: '3zinnen',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/zinnen.png',
                      active: true,
                      iconWidth: 75,
                      iconHeight: 60,
                      iconLazy: false,
                    },
                    {
                      id: 'item1',
                      title: '',
                      href: 'suedtirol',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/suvtirol.png',
                      active: true,
                      iconWidth: 75,
                      iconHeight: 60,
                      iconLazy: false,
                    },
                    {
                      id: 'item1',
                      title: '',
                      href: 'sexten',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/sexten.png',
                      active: true,
                      iconWidth: 114,
                      iconHeight: 35,
                      iconLazy: false,
                    },
                  ],
                }
              },
              {
                id: 'mod25',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'copyright',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'xlarge',
                  align: 'center',
                  items: [{ id: 'item1', title: '2022 © Ariane’s Guesthouse', active: true }],
                }
              },
              {
                id: 'mod26',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'logomts',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'xlarge',
                  align: 'center',
                  className: 'MTS__w-auto',
                  items: [
                    {
                      id: 'item1',
                      title: '',
                      href: '3zinnen',
                      itemVariant: 'icon',
                      icon: 'https://cdn.mts-online.com/u1060/static/icons/mts.png',
                      active: true,
                      iconWidth: 18,
                      iconHeight: 18,
                      iconLazy: false,
                    },
                  ],
                }
              },
              {
                id: 'mod27',
                module: 'Menu',
                library: '@mts-online/library-light',
                slot: 'copyright2',
                blockProps: {
                  active: true,
                  variation: 'horizontal',
                  spacing: 'none',
                  align: 'center',
                  className:"",
                  items: [
                    { id: 'item1', title: ' Impressum', active: true  ,className:"MTS__px-8" },
                    { id: 'item2', title: 'Datenschutz', active: true ,className:"MTS__px-8  MTS__border-l MTS__border-[color:var(--MTS-color-primary)]" },
                    { id: 'item3', title: 'AGB', active: true  ,className:"MTS__px-8 MTS__border-l MTS__border-[color:var(--MTS-color-primary)]"},
                  ],
                }
              },
            ],
          },
        ],
      }
      page !== 'nocache' && res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600')
      res.status(200).send(pageData)
      break
    }
    default: {
      res.status(404).send({ error: 'Not Found' })
      break
    }
  }
})

export default handler
