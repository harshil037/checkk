import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'

const MTS_CLIENT_ID = 'u1011'
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
    case 'u1011': {
      const pageData = {
        clientId: 'u1011',
        domainId: '6310ba6aa739f00009f302b4',
        domain: 'https://www.kohlerhof.com/',
        gtmParams: { id: '' },
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
          maxWidth: '1240px',
          'screenWidth-mobile': '640px',
          'color-primary': '#292929', // new
          'color-primary-light': '#7E7E7E',
          'color-secondary': '#D9C6B0',
          'color-secondary-dark': '#ffffff',
          'color-secondary-lighter': '#a6a6a6',
          'backgroundColor-primary': '#D9C6B0',
          'backgroundColor-primary-hover': '#D9C6B000',
          'backgroundColor-primary-light': '#ECE3D8',
          'backgroundColor-primary-lighter': '#D9C6B080',
          'backgroundColor-primary-dark': '#C4B2A1',
          'backgroundColor-secondary': '#292929',
          'backgroundColor-secondary-lighter': '#5D4D4680',
          'backgroundColor-secondary-dark': '#292929',
          'backgroundColor-effect-light': '#d9c6b059',
          'backgroundColor-surface': '#fff',
          'color-button': '#353535',
          'color-button-dark': '#ffffff',
          'color-surface': '#ffffff',
          'color-effect': '#D9C6B0',
          'color-button-hover': '#D9C6B0',
          'backgroundColor-button': 'transparent',
          'backgroundColor-button-hover': '#5D4D46',
          'color-button-darker': '#D9C6B0',
          'color-button-hover-dark': '#5D4D46',
          'color-button-cta': '#D9C6B0',
          'backgroundColor-btn-dark': '#D9C6B0',
          'color-button-hover-cta': '#5D4D46',
          'backgroundColor-button-dark': '#5D4D46',
          'backgroundColor-button-light': '#E6E6E6',
          'backgroundColor-button-hover-dark': 'transparent',
          'backgroundColor-button-cta': '#5D4D46',
          'backgroundColor-button-hover-cta': 'transparent',
          'borderColor-primary': '#ada8a0', // new
          'borderColor-button': '#5D4D46',
          'borderWidth-button': '1px',
          'transition-button': 'all 0.2s ease-in-out',
          'padding-button': '0.5rem 1.5em',
          'fontSize-base': '16px',
          'fontSize-heading': '21px',
          'fontWeight-bold': '600',
          'fontWeight-heading': '500',
          'fontSize-subHeading': '18px',
          'fontWeight-subHeading': '400',
          'lineHeight-heading': '1',
          'fontSize-button': '16px',
          'fontSize-label': '21px',
          'fontFamily-heading': 'Viaoda, serif',
          'fontFamily-body': 'Karla, sans-serif',
          'fontFamily-button': 'Karla, sans-serif',
          'maxWidth-copyrights': '1140px',
          'borderColor-secondary': '#00000080',
          'borderColor-surface': '#ffffff',
          'borderColor-button-dark': '#3E5951',
          'borderColor-primary-dark': '#D9C6B0',
          'borderColor-secondary-dark': '#D9C6B080',
          borderWidth: '1px',
          modalZindex: '20',
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
              title: "Hotel Kohlerhof | Sexten",
              description: "Hotel Kohlerhof",
            },
            scripts: [
              // {
              //   src: '//cdn.cookie-script.com/s/7b461d2cc1cc945e72911cb0e44943fd.js',
              // },
            ],
            layout: {
              module: 'MenuHeaderContentFooter',
              library: '@mts-online/library-light',
              blockProps: {
                active: true,
                headerBar: { active: true, fixed: false },
                slots: {
                  map: {
                    active: false,
                  },
                  newsletter: {
                    active: false,
                  },
                  followus: {
                    active: false,
                  },
                  social: {
                    active: false,
                  },
                  partners: {
                    active: false,
                  },
                  copyright: {
                    active: false,
                  },
                  copyright2: {
                    active: false,
                  },
                  copyright3: {
                    active: false,
                  },
                  roomslider: {
                    active: false,
                  },
                  requestform: {
                    active: false,
                  },
                  offerslider: {
                    active: false,
                  },
                  imagegallery: {
                    active: false,
                  },
                  videoplayer: {
                    active: false,
                  },
                  imageTextBox: {
                    active: false,
                  },
                  topics: {
                    active: false,
                  },
                  mobilenavbar: {
                    active: false,
                  },
                  mobileStickyFooter: {
                    active: false,
                  },
                  stickyButtons: {
                    active: false,
                  },
                  logo: {
                    active: true,
                  },
                  menu: {
                    active: false,
                  },
                  languagemenu: {
                    active: false,
                  },
                  header: {
                    active: true,
                  },
                  content: {
                    active: true,
                  },
                  pricecalculator: {
                    active: true,
                  },
                  contact: {
                    active: false,
                  },
                  copyright: {
                    active: false,
                  },
                  imagegallery: {
                    active: false,
                  },
                  footer: {
                    active: false,
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
                  src: 'https://cdn.mts-online.com/u1011/static/icons/logo.svg',
                  alt: "Hotel Kohlerhof",
                  anchor: 'headerslider1',
                  href: '/',
                  width: 300,
                  height: 53,
                },
              },
              {
                id: 'headerslider1',
                module: 'ImageSlider',
                library: '@mts-online/library-light',
                slot: 'header',
                blockProps: {
                  navigation:{fit:"contain", position:"bottom-right", height:820},
                slides: [
                  {
                    id: 'item1',
                    src: 'https://cdn.mts-online.com/u1011/static/img/banner.webp',
                    alt: "Ariane's Guesthouse",
                    fit: 'cover',
                    lazy: false,
                  },
                  {
                    id: 'item1',
                    src: 'https://cdn.mts-online.com/u1011/static/img/banner2.webp',
                    alt: "Ariane's Guesthouse",
                    fit: 'cover',
                    lazy: false,
                  },
                  {
                    id: 'item1',
                    src: 'https://cdn.mts-online.com/u1011/static/img/banner3.webp',
                    alt: "Ariane's Guesthouse",
                    fit: 'cover',
                    lazy: false,
                  },
                  {
                    id: 'item1',
                    src: 'https://cdn.mts-online.com/u1011/static/img/banner4.webp',
                    alt: "Ariane's Guesthouse",
                    fit: 'cover',
                    lazy: false,
                  },
                ],
                },
              },
              // {
              //   id: 'recommendedpackages',
              //   module: 'WidgetRecommendedPackages',
              //   library: '@mts-online/library-light',
              //   slot: 'content',
              //   blockProps: {
              //     labels:{
              //       "guest": {
              //         "de": "guest",
              //         "it": "guest",
              //         "en": "guest"
              //     },
              //     "guests": {
              //         "de": "guests",
              //         "it": "guests",
              //         "en": "guests"
              //     },
              //     "book": {
              //         "de": "BOOK NOW",
              //         "it": "BOOK NOW",
              //         "en": "BOOK NOW"
              //     },
              //     "bedroom": {
              //         "de": "bedroom",
              //         "it": "bedroom",
              //         "en": "bedroom"
              //     },
              //     "bedrooms": {
              //         "de": "bedrooms",
              //         "it": "bedrooms",
              //         "en": "bedrooms"
              //     },
              //     "bed": {
              //         "de": "bed",
              //         "it": "bed",
              //         "en": "bed"
              //     },
              //     "beds": {
              //         "de": "beds",
              //         "it": "beds",
              //         "en": "beds"
              //     },
              //     "nights": {
              //         "de": "nights",
              //         "it": "nights",
              //         "en": "nights"
              //     },
              //     "night": {
              //         "de": "night",
              //         "it": "night",
              //         "en": "night"
              //     },
              //     "details": {
              //         "de": "Details",
              //         "it": "Details",
              //         "en": "Details"
              //     },
              //     "selected": {
              //         "de": "Selected",
              //         "it": "Selected",
              //         "en": "Selected"
              //     },
              //     "select": {
              //         "de": "Select",
              //         "it": "Select",
              //         "en": "Select"
              //     },
              //     "offersButton": {
              //         "de": "View available offers for this room",
              //         "it": "View available offers for this room",
              //         "en": "View available offers for this room"
              //     },
              //     "offersTabTitle": {
              //         "de": "Offers available for this room",
              //         "it": "Offers available for this room",
              //         "en": "Offers available for this room"
              //     },
              //     "priceDetails": {
              //         "de": "Price Details",
              //         "it": "Price Details",
              //         "en": "Price Details"
              //     },
              //     "checkPrice": {
              //         "de": "Check Price for other dates",
              //         "it": "Check Price for other dates",
              //         "en": "Check Price for other dates"
              //     },
              //     "bestPriceOffer": {
              //         "de": "Best price offer for your desired period",
              //         "it": "Best price offer for your desired period",
              //         "en": "Best price offer for your desired period"
              //     },
              //     "adults": {
              //       "de": "Erwachsene",
              //       "it": "adulti",
              //       "en": "Adults"
              //   },
              //   "adult": {
              //       "de": "Erwachsener",
              //       "it": "adulto",
              //       "en": "Adult"
              //   },
              //   "children": {
              //       "de": "Kinder",
              //       "it": "bambini",
              //       "en": "children"
              //   },
              //   "child": {
              //       "de": "Kind",
              //       "it": "bambino",
              //       "en": "child"
              //   },
              //   "totalPrice": {
              //       "de": "Total before taxes",
              //       "it": "Total before taxes",
              //       "en": "Total before taxes"
              //   },
              //   "roomSummary": {
              //       "de": "Room Summary",
              //       "it": "Room Summary",
              //       "en": "Room Summary"
              //   },
              //   "arrivalDeparture": {
              //       "de": "Arrival-Departure",
              //       "it": "Arrival-Departure",
              //       "en": "Arrival-Departure"
              //   },
              //   "servicesIncluded": {
              //       "de": "SERVICES INCLUDED",
              //       "it": "SERVICES INCLUDED",
              //       "en": "SERVICES INCLUDED"
              //   },
              //     }
              //   }
              // },
              // {
              //   id: 'pricecalculator',
              //   module: 'WidgetPriceCalculator',
              //   library: '@mts-online/library-light',
              //   slot: 'pricecalculator',
              //   blockProps: {
              //     "clientId": "u1011",
              //     "hotelId": "S001368",
              //     "apiKey": "42",
              //     "provider": "kognitiv",
              //     "roomCode": "",
              //     "bookings": {
              //         "enquiryURL": "https://www.kohlerhof.com",
              //         "enquiryTargets": {
              //             "de": "/de/kontakt-service/anfragen.html",
              //             "it": "",
              //             "en": "/en/request"
              //         },
              //         "bookingProvider": "KUBE",
              //         "bookingURL": "https://booking.kohlerhof.com",
              //         "bookingTargets": {
              //             "de": "",
              //             "it": "",
              //             "en": ""
              //         }
              //     },
              //     "standardOccRooms": [],
              //     "skipRooms": [
              //         "SZK",
              //         "SEZK",
              //         "KEZK",
              //         "APP",
              //         "CHK"
              //     ],
              //     "stdOccupancy": "2",
              //     "buttonType": "animateSlide",
              //     "buttonWidth": "",
              //     "layout": "",
              //     "priceTotalHeaderRounded": "medium",
              //     "priceTotalSummaryRounded": "medium",
              //     "roomSelectionListRounded": "medium",
              //     "occupancySelectionView": "split",
              //     "occupancySelectionRounded": "medium",
              //     "roomImgPreview": "",
              //     "hideDescription": false,
              //     "smallView": false,
              //     "priceDetailsTop": "100px",
              //     "moreDescriptionType": "button",
              //     "stopBackScroll": true,
              //     "priceFractionDigits": "0",
              //     "labels": {
              //         "for": {
              //             "de": "für",
              //             "it": "per",
              //             "en": "for"
              //         },
              //         "title": {
              //             "de": "Not found what you are looking for?",
              //             "it": "Not found what you are looking for?",
              //             "en": "Not found what you are looking for?"
              //         },
              //         "persons": {
              //             "de": "Personen",
              //             "it": "Persone",
              //             "en": "Persons"
              //         },
              //         "prices": {
              //             "de": "Preise",
              //             "it": "Prezzi",
              //             "en": "Prices"
              //         },
              //         "including": {
              //             "de": "incl.",
              //             "it": "Compreso",
              //             "en": "Including"
              //         },
              //         "days": {
              //             "de": "mo,di,mi,do,fr,sa,so",
              //             "it": "lun,mar,mer,gio,ven,sab,dom",
              //             "en": "mo,tu,we,th,fr,sa,su"
              //         },
              //         "months": {
              //             "de": "Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember",
              //             "it": "Gennaio,Febbraio,Marzo,Aprile,Maggio,Giugno,Luglio,Agosto,Settembre,Ottobre,Novembre,Dicembre",
              //             "en": "January,February,March,April,May,June,July,Augest,September,October,November,December"
              //         },
              //         "calPriceInfo": {
              //             "de": "Preise pro Person bei Standardbelegung",
              //             "it": "prezzi a persona con occupazione standard",
              //             "en": "Prices per person with standard occupancy"
              //         },
              //         "calYourSelection": {
              //             "de": "gewählter Zeitraum",
              //             "it": "periodo selezionato",
              //             "en": "Selected period"
              //         },
              //         "calArrivalAvailable": {
              //             "de": "Ankunft möglich",
              //             "it": "arrivo possibile",
              //             "en": "Arrival possible"
              //         },
              //         "calDepartureOnly": {
              //             "de": "nur Abreise",
              //             "it": "solo partenza",
              //             "en": "Departure only"
              //         },
              //         "calHotelClosed": {
              //             "de": "nicht verfügbar",
              //             "it": "non disponibile",
              //             "en": "Not available"
              //         },
              //         "selectDates": {
              //             "de": "Zeitraum",
              //             "it": "Periodo",
              //             "en": "Period"
              //         },
              //         "nights": {
              //             "de": "Nächte",
              //             "it": "notti",
              //             "en": "Nights"
              //         },
              //         "night": {
              //             "de": "Nacht",
              //             "it": "notte",
              //             "en": "Night"
              //         },
              //         "adults": {
              //             "de": "Erwachsene",
              //             "it": "adulti",
              //             "en": "Adults"
              //         },
              //         "adult": {
              //             "de": "Erwachsener",
              //             "it": "adulto",
              //             "en": "Adult"
              //         },
              //         "children": {
              //             "de": "Kinder",
              //             "it": "bambini",
              //             "en": "children"
              //         },
              //         "child": {
              //             "de": "Kind",
              //             "it": "bambino",
              //             "en": "child"
              //         },
              //         "age": {
              //             "de": "Alter",
              //             "it": "Età",
              //             "en": "Age"
              //         },
              //         "minAdultsRequired": {
              //             "de": "Min. 2 Erwachsene für dieses Zimmer erforderlich",
              //             "it": "Per questa camera è necessario un minimo di 2 adulti",
              //             "en": "Min. 2 adults required for this room"
              //         },
              //         "maxAdultsAllowed": {
              //             "de": "Max. 2 Erwachsene für dieses Zimmer erlaubt",
              //             "it": "Massimo 2 adulti ammessi in questa camera",
              //             "en": "Max. 2 adults allowed for this room"
              //         },
              //         "minChildrenRequired": {
              //             "de": "Min. 2 Kinder für dieses Zimmer erforderlich",
              //             "it": "Per questa camera sono necessari almeno 2 bambini",
              //             "en": "Min. 2 children required for this room"
              //         },
              //         "maxChildrenAllowed": {
              //             "de": "Max. 2 Kinder für dieses Zimmer erlaubt",
              //             "it": "In questa camera sono ammessi al massimo 2 bambini",
              //             "en": "Max. 2 children allowed for this room"
              //         },
              //         "selectRoomType": {
              //             "de": "Zimmerkategorie wählen",
              //             "it": "Selezionare la categoria",
              //             "en": "Select Room Type"
              //         },
              //         "allRooms": {
              //             "de": "Alle Zimmer",
              //             "it": "Tutte le camere",
              //             "en": "All Rooms"
              //         },
              //         "SelectTypeOfStay": {
              //             "de": "Verpflegung",
              //             "it": "Formula",
              //             "en": "Mealplan"
              //         },
              //         "RoomOccuAvlbl": {
              //             "de": "Belegung",
              //             "it": "Occupazione",
              //             "en": "Occupancy"
              //         },
              //         "guests": {
              //             "de": "Gäste",
              //             "it": "Ospiti",
              //             "en": "Guests"
              //         },
              //         "totalAmountFor": {
              //             "de": "Gesamtsumme für",
              //             "it": "Importo totale",
              //             "en": "Total amount for"
              //         },
              //         "noOfferInfo": {
              //             "de": "Für den ausgewählten Zeitraum und die gewählte Verpflegung sind keine Angebote verfügbar.",
              //             "it": "Purtroppo non ci sono offerte per il periodo selezionato e l’occupazione richiesta.",
              //             "en": "Unfortunately there is no offer for the requested occupancy and travel period"
              //         },
              //         "fluctuationsInfo": {
              //             "de": "Preisschwankungen bis Buchungsabschluss möglich.",
              //             "it": "Il prezzo può variare fino alla conclusione finale della prenotazione.",
              //             "en": "The total amount is subject to price swings up to the final conclusion of the booking."
              //         },
              //         "enquiry": {
              //             "de": "ANFRAGEN",
              //             "it": "RICHIESTA",
              //             "en": "ENQUIRY"
              //         },
              //         "book": {
              //             "de": "BUCHEN",
              //             "it": "PRENOTAZIONE",
              //             "en": "BOOK"
              //         },
              //         "minStay": {
              //             "de": "Min.",
              //             "it": "Min.",
              //             "en": "Min."
              //         },
              //         "noArrivalInfo": {
              //             "de": "keine Anreise möglich",
              //             "it": "Nessun arrivo",
              //             "en": "No arrival"
              //         },
              //         "and": {
              //             "de": "und",
              //             "it": "e",
              //             "en": "and"
              //         },
              //         "isIncluded": {
              //             "de": "",
              //             "it": "",
              //             "en": ""
              //         },
              //         "closeForDept": {
              //             "de": "Für Abreise gesperrt",
              //             "it": "Data non disponibile per la partenza",
              //             "en": "Closed for departure"
              //         },
              //         "closeForArrDept": {
              //             "de": "Für An- und Abreise gesperrt",
              //             "it": "Data non disponibile per l'arrivo e la partenza",
              //             "en": "Closed for arrival & departure"
              //         },
              //         "closeForGap": {
              //             "de": "nicht verfügbar",
              //             "it": "Non disponibile",
              //             "en": "Not available"
              //         },
              //         "moreDetails": {
              //             "de": "MEHR DETAILS",
              //             "it": "ULTERIORI DETTAGLI",
              //             "en": "MORE DETAILS"
              //         },
              //         "hideDetails": {
              //             "de": "WENIGER DETAILS",
              //             "it": "MENO DETTAGLI",
              //             "en": "LESS DETAILS"
              //         }
              //     },
              //     "styles": {
              //         "maxWidth": "1248px",
              //         "fontFamily-body": "Lato",
              //         "fontFamily-subHeading": "Lato",
              //         "fontFamily-heading": "'Cormorant Infant'",
              //         "fontFamily-button": "Lato",
              //         "fontSize-base-max": "18px",
              //         "fontSize-base-min": "8px",
              //         "fontSize-heading-max": "35px",
              //         "fontSize-heading-min": "23px",
              //         "fontSize-subHeading-max": "20px",
              //         "fontSize-subHeading-min": "13px",
              //         "fontSize-button-max": "14px",
              //         "fontSize-button-min": "12px",
              //         "fontWeight-heading": "600",
              //         "fontWeight-body": "400",
              //         "fontWeight-semibold": "500",
              //         "fontWeight-bold": "700",
              //         "fontWeight-button": "",
              //         "backgroundColor-widget": "#ffffff",
              //         "backgroundColor-primary": "#ffffff",
              //         "backgroundColor-primary-light": "#353535",
              //         "backgroundColor-primary-lighter": "#EEE6D8",
              //         "backgroundColor-primary-dark": "#BB9C66",
              //         "backgroundColor-primary-darker": "#353535",
              //         "backgroundColor-secondary": "#ffffff",
              //         "backgroundColor-secondary-light": "#BB9C66",
              //         "backgroundColor-secondary-lighter": "#a8aaa5",
              //         "backgroundColor-surface": "#ffffff",
              //         "backgroundColor-surface-dark": "#EEE6D880",
              //         "backgroundColor-danger": "#DEDCD8",
              //         "backgroundColor-success": "#BB9C66",
              //         "backgroundColor-success-light": "#E0CAA3",
              //         "backgroundColor-button": "#00000080",
              //         "backgroundColor-button-dark": "#BB9C66",
              //         "backgroundColor-button-hover-dark": "#9D804D",
              //         "backgroundColor-button-light": "#00000000",
              //         "backgroundColor-button-hover-light": "#00000000",
              //         "backgroundColor-layout": "#1111",
              //         "backgroundColor-animation": "#D9B16D",
              //         "backgroundColor-effect": "#F4F4F4",
              //         "color-primary-dark": "#353535",
              //         "color-primary-darker": "#4D5146",
              //         "color-secondary-light": "#BB9C66",
              //         "color-secondary-darker": "#353535",
              //         "color-secondary-dark": "#353535",
              //         "color-primary-light": "#ffffff",
              //         "color-primary-selected": "",
              //         "color-label-dark": "#ffffff",
              //         "color-label-light": "#ffffff",
              //         "color-surface": "#ffffff",
              //         "color-danger": "#ef444480",
              //         "color-success": "#38b981a1",
              //         "color-error": "#932224",
              //         "color-button": "#ffffff",
              //         "borderColor-outer": "#00000000",
              //         "height": "5em",
              //         "roomDropdownHeight": "20em",
              //         "borderColor": "#BB9C66",
              //         "buttonGap": "0px",
              //         "borderWidth": "1px",
              //         "color-button-light": "#353535",
              //         "color-button-hover-light": "#ffffff",
              //         "color-button-dark": "#ffffff",
              //         "color-button-hover-dark": "#ffffff",
              //         "color-button-hover-darker": "",
              //         "backgroundColor-label-light": "#BB9C66",
              //         "backgroundColor-label-dark": "#353535",
              //         "buttonWidth": "",
              //         "borderColor-label": "",
              //         "borderColor-splitter": "",
              //         "borderColor-button": "",
              //         "borderColor-button-light": "",
              //         "borderColor-button-dark": "",
              //         "marginTopSections": "",
              //         "widgetGap": "22px",
              //         "widgetGapX": "",
              //         "img-height": "",
              //         "img-width": "",
              //         "px-imageSlider": "",
              //         "py-imageSlider": "",
              //         "margin-top-sticky": "70px",
              //         "modalZindex": "9999",
              //         "backgroundColor-animation-light": "transparent",
              //         "backgroundColor-animation-dark": "#dedcd8",
              //         "backgroundColor-animation-darker": "#dedcd8",
              //         "transitionProperty": "all",
              //         "transitionDuration": "300ms",
              //         "transitionTimingFunction": "ease-out",
              //         "transitionPercentage": "30%",
              //         "rounded-button": "0.375rem",
              //         "breakpoints": []
              //     }
              //   }
              // },
              
            ],
          },
          // {
          //   path: '/it',
          //   language: 'it',
          //   hrefLang: {
          //     en: '/en',
          //     de: '/',
          //   },
          //   scripts: [
          //     {
          //       src: '//cdn.cookie-script.com/s/7b461d2cc1cc945e72911cb0e44943fd.js',
          //     },
          //   ],
          //   meta: {
          //     title: "Hotel Kohlerhof | Sesto",
          //     description: "Hotel Kohlerhof",
          //   },
          //   layout: {
          //     module: 'MenuHeaderContentFooter',
          //     library: '@mts-online/library-light',
          //     blockProps: {
          //       active: true,
          //       headerBar: { active: true, fixed: true },
          //       slots: {
          //         logo: {
          //           active: true,
          //         },
          //         menu: {
          //           active: true,
          //         },
          //         languagemenu: {
          //           active: true,
          //         },
          //         header: {
          //           active: true,
          //         },
          //         content: {
          //           active: true,
          //         },
          //         footer: {
          //           active: true,
          //         },
          //         contact: {
          //           active: true,
          //         },
          //         map: {
          //           active: true,
          //         },
          //         newsletter: {
          //           active: true,
          //         },
          //         followus: {
          //           active: true,
          //         },
          //         social: {
          //           active: true,
          //         },
          //         partners: {
          //           active: true,
          //         },
          //         copyright: {
          //           active: true,
          //         },
          //         copyright2: {
          //           active: true,
          //         },
          //         copyright3: {
          //           active: true,
          //         },
          //         roomslider: {
          //           active: true,
          //         },
          //         requestform: {
          //           active: true,
          //         },
          //         offerslider: {
          //           active: true,
          //         },
          //         imagegallery: {
          //           active: true,
          //         },
          //         videoplayer: {
          //           active: true,
          //         },
          //         imageTextBox: {
          //           active: true,
          //         },
          //         topics: {
          //           active: true,
          //         },
          //         mobilenavbar: {
          //           active: true,
          //         },
          //         mobileStickyFooter: {
          //           active: true,
          //         },
          //         stickyButtons: {
          //           active: true,
          //         },
          //       },
          //     },
          //   },
          //   modules: [
          //     {
          //       id: 'mod8',
          //       module: 'Logo',
          //       library: '@mts-online/library-light',
          //       slot: 'logo',
          //       blockProps: {
          //         active: true,
          //         src: 'https://cdn.mts-online.com/u1011/static/img/logo.svg',
          //         alt: "Hotel Kohlerhof",
          //         anchor: 'headerslider1',
          //         href: '/it',
          //         width: 300,
          //         height: 53,
          //       },
          //     },
          //     {
          //       id: 'mod9',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'menu',
          //       blockProps: {
          //         active: true,
          //         align: 'right',
          //         items: [
          //           { id: 'item1', title: "Hotel Kohlerhof", anchor: 'imageTextBox1', active: true },
          //           { id: 'item2', title: 'Vivere', anchor: 'roomSlider', active: true },
          //           { id: 'item3', title: 'Offerte', anchor: 'offerSlider', active: true },
          //           { id: 'item4', title: 'Sesto', anchor: 'topics', active: true },
          //           { id: 'item5', title: 'Estate', anchor: 'topics', active: true },
          //           { id: 'item6', title: 'Inverno', anchor: 'topics', active: true },
          //           // // { id: 'item4', title: 'Kontakt', anchor: 'address1', active: true },
          //           {
          //             id: 'item7',
          //             title: 'Kontakt',
          //             href: 'tel:+393663533442',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/phone.svg',
          //             active: true,
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             iconLazy: false,
          //           },
          //           {
          //             id: 'item8',
          //             title: 'Richiesta',
          //             action: 'openRequestForm',
          //             // anchor: 'request',
          //             href: '/it/richiesta',
          //             active: true,
          //             itemVariant: 'button-text',
          //             buttonVariant: 'primary',
          //           },
          //           {
          //             id: 'item9',
          //             title: 'Prenota',
          //             href: 'https://booking.kohlerhof.com/?skd-language-code=it',
          //             to: 'https://booking.kohlerhof.com/?skd-language-code=it',
          //             target: '_blank',
          //             active: true,
          //             itemVariant: 'button-text',
          //             buttonVariant: 'cta',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod10',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'languagemenu',
          //       blockProps: {
          //         active: true,
          //         id: 'languagemenu',
          //         variation: 'horizontal',
          //         spacing: 'medium',
          //         align: 'center',
          //         divider: 'line',
          //         items: [
          //           { id: 'item1', title: 'de', href: '/', hrefLang: 'de', active: true },
          //           { id: 'item2', title: 'it', href: '/it', hrefLang: 'it', active: true },
          //           { id: 'item3', title: 'en', href: '/en', hrefLang: 'en', active: true },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'headerslider1',
          //       module: 'ImageSlider',
          //       library: '@mts-online/library-light',
          //       slot: 'header',
          //       blockProps: {
          //         active: true,
          //         slides: [
          //           {
          //             id: 'item1',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/ariana-banner.jpg',
          //             alt: "Hotel Kohlerhof",
          //             fit: 'cover',
          //             lazy: false,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'imageTextBox1',
          //       module: 'ImageTextBox',
          //       library: '@mts-online/library-light',
          //       slot: 'content',
          //       blockProps: {
          //         active: true,
          //         general: {
          //           position: 'right',
          //           variation: 'box-in-box',
          //         },
          //         image: {
          //           active: true,
          //           zoom: true,
          //           src: 'https://cdn.mts-online.com/u1011/static/img/Cam_4.jpg',
          //           alt: "Hotel Kohlerhof",
          //         },
          //         content: {
          //           active: true,
          //           title: "Hotel Kohlerhof",
          //           text: "<p>Arrivare….. assaporare l'inebriante sensazione del lusso, trovarsi immersi in un paesaggio unico ed indescrivibile, magnifico, magnetico, accorgersi nello stesso istante che si riescono a sentire le proprie origini.</p><p>Questo è il motto di Ariane, Helmut, Marcel e Pirmin Villgrater!</p><p>Hotel Kohlerhof è un luogo dove il lasciarsi andare viene da sé, è il posto ideale per rilassarsi e godersi il momento... tra i monti di Sesto.</p><p>Tutti gli appartamenti nell'Hotel Kohlerhof sono moderni, particolari, spaziosi e arredati con grande attenzione per il dettaglio. Lasciatevi ispirare…</p>",
          //         },
          //       },
          //     },
          //     {
          //       id: 'imageTextBox2',
          //       module: 'ImageTextBox',
          //       library: '@mts-online/library-light',
          //       slot: 'content',
          //       blockProps: {
          //         active: true,
          //         general: {
          //           position: 'left',
          //           variation: 'box-in-box',
          //         },
          //         image: {
          //           active: true,
          //           zoom: true,
          //           src: 'https://cdn.mts-online.com/u1011/static/img/Cam_5.jpg',
          //           alt: "Hotel Kohlerhof",
          //         },
          //         content: {
          //           active: true,
          //           title: 'Tempo di consapevolezza e fantasia',
          //           text: "<p>In un mondo pieno di rumore, incertezza e frenesia - dove sono i momenti per la consapevolezza e per l'immaginazione? Che luogo cerchiamo quando silenzio, valori reali, originalità e naturalezza sono il nostro bisogno?</p><p>L'obiettivo è un approccio olistico e consapevole: natura, salute e divertimento per tutta la famiglia ne sono il fulcro. Per Ariane, la sua famiglia, i loro ospiti….</p><p>Ariane ama cucinare, preparare con amore Schlutzkrapfen (ravioli tirolesi) e canederli – potrebbe magari darvi qualche consiglio e farvi vedere qualche trucco? Forse potrete far cuocere il pane nero o i tipici Schlutzkrapfen assieme ad Ariane &amp; Helmut o far la pizza insieme a Marcel &amp; Pirmin - e ci sarà ancora tanto altro...</p>",
          //         },
          //       },
          //     },
          //     {
          //       id: 'roomSlider',
          //       module: 'WidgetRoomsSlider2',
          //       library: '@mts-online/library-light',
          //       slot: 'roomslider',
          //       blockProps: {
          //         clientId: 'u1011',
          //         cardsToShow: '3',
          //         cardGap: '24px',
          //         sliderType: 'normal',
          //         priceMinFraction: 0,
          //         priceMaxFraction: 0,
          //         bookings: {
          //           enquiryURL: 'https://s.mts-online.com/',
          //           enquiryTargets: {
          //             de: '/widget/popup.html?widget=request',
          //             it: '/widget/popup.html?widget=request',
          //             en: '/widget/popup.html?widget=request',
          //           },
          //           bookingProvider: 'kube',
          //           bookingURL: 'https://booking.kohlerhof.com/',
          //           bookingTargets: {
          //             de: '',
          //             it: '',
          //             en: '',
          //           },
          //         },
          //         labels: {
          //           showDetails: {
          //             de: 'Details anzeigen',
          //             it: 'Mostra dettagli',
          //             en: 'Show details',
          //           },
          //           request: {
          //             de: 'Anfragen',
          //             it: 'Richiesta',
          //             en: 'Request',
          //           },
          //           book: {
          //             de: 'Buchen',
          //             it: 'Prenota',
          //             en: 'Book',
          //           },
          //           from: {
          //             de: 'ab',
          //             it: 'da',
          //             en: 'from',
          //           },
          //           currencySymbol: {
          //             de: '€',
          //             it: '€',
          //             en: '€',
          //           },
          //           perPerson: {
          //             de: 'pro Person',
          //             it: 'a persona',
          //             en: 'per person',
          //           },
          //           perNight: {
          //             de: 'pro Nacht',
          //             it: 'a notte',
          //             en: 'per night',
          //           },
          //           upTo: {
          //             de: 'bis max.',
          //             it: 'fino ad un massimo di',
          //             en: 'up to a maximum of',
          //           },
          //           details: {
          //             de: 'Einzelheiten',
          //             it: 'Particolari',
          //             en: 'Details',
          //           },
          //           offerUnavailableInfo: {
          //             de: 'Dieses Angebot ist nicht verfügbar',
          //             it: 'Questa offerta non è disponibile',
          //             en: 'This Offer is not available',
          //           },
          //           availablePeriods: {
          //             de: 'Verfügbare Zeiträume',
          //             it: 'Periodi disponibili',
          //             en: 'Available Periods',
          //           },
          //           for: {
          //             de: 'für',
          //             it: 'per',
          //             en: 'for',
          //           },
          //           nights: {
          //             de: 'Nächte',
          //             it: 'Nights',
          //             en: 'Notti',
          //           },
          //           persons: {
          //             de: 'personen',
          //             it: 'persone',
          //             en: 'persons',
          //           },
          //           prices: {
          //             de: 'Preise',
          //             it: 'Prezzi',
          //             en: 'Prices',
          //           },
          //           offers: {
          //             de: 'Angebote',
          //             it: 'Offerte',
          //             en: 'Offers',
          //           },
          //           period: {
          //             de: 'Zeitraum',
          //             it: 'Periodo di tempo',
          //             en: 'Period',
          //           },
          //           price: {
          //             de: 'Preis',
          //             it: ' Prezzo',
          //             en: 'Price',
          //           },
          //         },
          //       },
          //     },
          //     {
          //       id: 'imageTextBox3',
          //       module: 'ImageTextBoxV2',
          //       library: '@mts-online/library-light',
          //       slot: 'imageTextBox',
          //       blockProps: {
          //         id: 'imageTextBox',
          //         active: true,
          //         image: { active: true, src: 'https://cdn.mts-online.com/u1011/static/img/ariane.png', alt: 'Alt' },
          //         content: {
          //           position: 'right',
          //           active: true,
          //           title: 'Alloggio',
          //           text: '<p>Lasciatevi incantare dalla natura e fate semplicemente penzolare la vostra anima...</p><p>Tutti i nostri monolocali sono dotati di TV LCD satellitare, asciugacapelli, lavastoviglie, frigorifero vano congelatore, macchina per il caffè e piano cottura in vetroceramica. Abbiamo prestato molta attenzione per realizzare il tutto con materiali naturali come pavimenti in legno, mobili in legno, muri in pietra e molto altro.</p><p>Troverete lenzuola, asciugamani, canovacci, una fornita cantinetta... questo in ogni appartamento. Una lavanderia con asse e ferro da stiro è disponibile a richiesta.</p>',
          //         },
          //       },
          //     },
          //     {
          //       id: 'offerSlider',
          //       module: 'WidgetOffersSlider',
          //       library: '@mts-online/library-light',
          //       slot: 'offerslider',
          //       blockProps: {
          //         clientId: 'u1011',
          //         hotelId: 'S005456',
          //         cardsToShow: '2',
          //         cardGap: '24px',
          //         sliderType: 'normal',
          //         priceMinFraction: 0,
          //         priceMaxFraction: 0,
          //         bookings: {
          //           enquiryURL: 'https://s.mts-online.com/',
          //           enquiryTargets: {
          //             de: '/widget/popup.html?widget=request',
          //             it: '/widget/popup.html?widget=request',
          //             en: '/widget/popup.html?widget=request',
          //           },
          //           bookingProvider: 'KUBE',
          //           bookingURL: 'https://booking.kohlerhof.com/',
          //           bookingTargets: {
          //             de: '',
          //             it: '',
          //             en: '',
          //           },
          //         },
          //         labels: {
          //           showDetails: {
          //             de: 'Details anzeigen',
          //             it: 'Mostra dettagli',
          //             en: 'Show details',
          //           },
          //           request: {
          //             de: 'Anfragen',
          //             it: 'Richiesta',
          //             en: 'Request',
          //           },
          //           book: {
          //             de: 'Buchen',
          //             it: 'Prenota',
          //             en: 'Book',
          //           },
          //           from: {
          //             de: 'ab',
          //             it: 'da',
          //             en: 'from',
          //           },
          //           perPerson: {
          //             de: 'pro Person',
          //             it: 'a persona',
          //             en: 'per person',
          //           },
          //           perNight: {
          //             de: 'pro Nacht',
          //             it: 'per notte',
          //             en: 'per night',
          //           },
          //           upTo: {
          //             de: 'bis max.',
          //             it: 'fino ad un massimo di',
          //             en: 'up to a maximum of',
          //           },
          //           breakfast: {
          //             de: 'Frühstück',
          //             it: 'Colazione',
          //             en: 'Breakfast',
          //           },
          //           for: {
          //             de: 'für',
          //             it: 'per',
          //             en: 'for',
          //           },
          //           nights: {
          //             de: 'Nächte',
          //             it: 'Notti',
          //             en: 'Nights',
          //           },
          //           persons: {
          //             de: 'personen',
          //             it: 'persone',
          //             en: 'persons',
          //           },
          //           details: {
          //             de: 'Details',
          //             it: 'Dettagli',
          //             en: 'Details',
          //           },
          //           prices: {
          //             de: 'Preise',
          //             it: 'Prezzi',
          //             en: 'Prices',
          //           },
          //           detailsTitle: {
          //             de: 'Das Angebot beinhaltet',
          //             it: "L'offerta comprende",
          //             en: 'The offer includes',
          //           },
          //         },
          //       },
          //     },
          //     {
          //       id: 'address1',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'contact',
          //       blockProps: {
          //         active: true,
          //         variation: 'vertical',
          //         spacing: 'large',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: `Hotel Kohlerhof<br>Via Waldheim 16A<br>39030 Sexten BZ<br>Italien`,
          //             active: true,
          //             href: 'https://goo.gl/maps/y6moWcNtBRpZ7TiW7',
          //             itemVariant: 'icon-text',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/location.svg',
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             isHtmlText: true,
          //             hoverVariant: 'underline',
          //             itemsPosition: 'ends',
          //           },
          //           {
          //             id: 'item2',
          //             title: '+393663533442',
          //             href: 'tel:+393663533442',
          //             active: true,
          //             itemVariant: 'icon-text',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/phone.svg',
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             hoverVariant: 'underline',
          //             itemsPosition: 'ends',
          //           },
          //           {
          //             id: 'item3',
          //             title: 'INFO@KOHLERHOF.COM',
          //             href: '/anfragen',
          //             active: true,
          //             itemVariant: 'icon-text',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/email.svg',
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             hoverVariant: 'underline',
          //             itemsPosition: 'ends',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod21',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'map',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'Google maps',
          //             href: 'https://goo.gl/maps/y6moWcNtBRpZ7TiW7',
          //             itemVariant: 'image',
          //             imageWidth: 605,
          //             image: 'https://cdn.mts-online.com/u1011/static/img/map.png',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod23',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'followus',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'small',
          //         align: 'left',
          //         items: [
          //           { id: 'item1', title: 'Follow us', active: true },
          //           {
          //             id: 'item2',
          //             title: 'Instagram',
          //             active: true,
          //             itemVariant: 'icon',
          //             target: '_blank',
          //             href: 'https://www.instagram.com/',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/instagram.svg',
          //             iconWidth: 18,
          //             iconHeight: 18,
          //             itemsPosition: 'ends',
          //           },
          //           {
          //             id: 'item3',
          //             title: 'Facebook',
          //             active: true,
          //             itemVariant: 'icon',
          //             target: '_blank',
          //             href: 'https://www.facebook.com/',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/facebook.svg',
          //             iconWidth: 18,
          //             iconHeight: 18,
          //             itemsPosition: 'ends',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod24',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'partners',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: '',
          //             href: '3zinnen',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/img/zinnen.png',
          //             active: true,
          //             iconWidth: 75,
          //             iconHeight: 60,
          //           },
          //           {
          //             id: 'item1',
          //             title: '',
          //             href: 'suedtirol',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/img/suedtirol.png',
          //             active: true,
          //             iconWidth: 75,
          //             iconHeight: 60,
          //           },
          //           {
          //             id: 'item1',
          //             title: '',
          //             href: 'sexten',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/img/sexten.png',
          //             active: true,
          //             iconWidth: 114,
          //             iconHeight: 35,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod25',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'copyright',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         items: [{ id: 'item1', title: '2022 © Ariane’s Guesthouse', active: true }],
          //       },
          //     },
          //     {
          //       id: 'mod26',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'copyright2',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'mtsonline',
          //             href: 'https://www.mts-online.com',
          //             target: '_blank',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/mtsonline-logo.svg',
          //             active: true,
          //             iconWidth: 18,
          //             iconHeight: 18,
          //             iconLazy: false,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod27',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'copyright3',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         divider: 'line',
          //         items: [
          //           { id: 'item1', title: 'Colophon', href: '/it/impressum', active: true },
          //           {
          //             id: 'item2',
          //             title: 'Privacy',
          //             href: '/it/privacy',
          //             active: true,
          //           },
          //           {
          //             id: 'item3',
          //             title: 'T&C',
          //             href: '/it/agb',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod28',
          //       module: 'ImageSlider',
          //       library: '@mts-online/library-light',
          //       slot: 'imagegallery',
          //       blockProps: {
          //         id: 'gallery',
          //         active: true,
          //         slidesPerView: 3,
          //         height: 630,
          //         infinite: true,
          //         gap: 'large',
          //         navigation: {
          //           position: 'between-outside',
          //           leftIcon: 'https://cdn.mts-online.com/u1011/static/icons/arrow-left.svg',
          //           rightIcon: 'https://cdn.mts-online.com/u1011/static/icons/arrow-right.svg',
          //           width: 40,
          //         },
          //         // popup: true,
          //         slides: [
          //           {
          //             id: 'img1',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_4.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //           {
          //             id: 'img2',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_5.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //           {
          //             id: 'img3',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_6.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //           {
          //             id: 'img4',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_8.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod30',
          //       module: 'VideoPlayer',
          //       library: '@mts-online/library-light',
          //       slot: 'videoplayer',
          //       blockProps: {
          //         id: 'videoplayer',
          //         active: true,
          //         position: 'center',
          //         fit: 'cover',
          //         url: 'https://cdn.mts-online.com/u1011/static/img/3Z_Ski_20.mp4',
          //         image: {
          //           src: 'https://cdn.mts-online.com/u1011/static/img/videoverlay.png',
          //           alt: 'Alt',
          //           originalWidth: 1075,
          //           originalHeight: 605,
          //         },
          //       },
          //     },
          //     {
          //       id: 'topics',
          //       module: 'Topics',
          //       library: '@mts-online/library-light',
          //       slot: 'topics',
          //       blockProps: {
          //         id: 'topics',
          //         active: true,
          //         labels: {
          //           details: {
          //             de: 'Details anzeigen',
          //             it: 'Mostra dettagli',
          //             en: 'Show details',
          //           },
          //           back: {
          //             de: 'Zurück',
          //             it: 'Indietro',
          //             en: 'Back',
          //           },
          //         },
          //         items: [
          //           {
          //             id: 'item1',
          //             url: 'https://cdn.mts-online.com/u1011/static/img/topic1.png',
          //             title: 'Inverno',
          //             subTitle: 'Inverno',
          //             description: `<p><strong>Aria invernale &amp; profumo di biscotti,</strong><br><strong>Rintocchi delle campane &amp; il canto di angeli,</strong><br><strong>Cime innevate &amp; la battaglia con le palle di neve</strong></p><p>Un accogliente periodo prenatalizio ricco di tradizioni, la magia della cottura dei biscotti, luci scintillanti e paesaggi addobbati a festa, capodanno, settimane bianche e il classico martedì grasso, questo è il nostro tipico inverno in montagna.</p><p>Potete sciare e fare snowboard sulle nostre 4 montagne dove la presenza di un manto innevato ideale è garantito, le piste le troverete perfettamente preparate e adatte a tutti i livelli di preparazione, impianti di risalita per bambini e una montagna attrezzata per le avventure di tutta la famiglia: questi sono gli ingredienti per la vostra fantastica vacanza sugli sci nelle Dolomiti. Con oltre 200 km di piste battute, Sesto appartiene alla regione prima, attrezzata per lo sci di fondo in Italia. Iniziate il vostro percorso partendo da Hotel Kohlerhof e vi troverete già sulla vasta rete di piste da fondo che portano non solo in Val Fiscalina, ma volendo fino a al Lago di Braies e allo stadio dello sci di fondo di Dobbiaco attrezzato con piste FIS.</p><p>Apprezzate il lato tranquillo dell'inverno durante le escursioni invernali a piedi o con le ciaspole nelle Dolomiti di Sesto, attraverso l'idilliaco paesaggio dolomitico imbiancato.</p><p>Lo sci alpinismo si può praticare in mezzo al silenzio dell'affascinante paesaggio naturale delle Dolomiti: neve incontaminata, panorami meravigliosi, tanto sole – pace infinita a perdita d’occhio….</p><p><strong>Altre attività:</strong></p><ul><li><strong>Slittino</strong>: a piedi o con l'impianto di risalita fino alla cima per poi sfrecciare a valle come il vento! Ci sono diverse piste da slittino. I caschi sono obbligatori per i bambini sotto i 14 anni!</li><li><strong>Pattinaggio sul ghiaccio:</strong> le piste di pattinaggio più belle si trovano a Sesto, Dobbiaco e Villabassa.</li><li>Il curling si pratica al Lago di Dobbiaco, a Villabassa e a Sesto.</li><li><strong>Giro in mongolfiera:</strong> ammirate la regione delle Tre Cime Dolomiti dall'alto!</li><li><strong>Giro in slitta trainata da cavalli:</strong> il passaggio romantico attraverso paesaggi invernali da sogno a Sesto e a Dobbiaco.</li><li>Tennis e squash nel palazzetto del tennis di Sesto, ideale per tenersi in forma e ridurre lo stress.</li><li>L'arrampicata è possibile nelle palestre di Sesto e Dobbiaco.</li></ul>`,
          //           },
          //           {
          //             id: 'item2',
          //             url: 'https://cdn.mts-online.com/u1011/static/img/topic2.png',
          //             title: 'Estate',
          //             subTitle: 'Estate',
          //             description: `<p><strong>Estate</strong></p><p>Staccare la spina, vivere la pace &amp; la natura.</p><p>L'estate nelle Dolomiti è piena di sorprese e meraviglie da scoprire: Ogni avventura è accompagnata da uno spettacolare panorama Dolomitico e piena di tesori culturali tutti da ammirare. Questo scenario da sogno e il mondo naturale delle Dolomiti lascia impressioni indelebili nell'animo.</p><p>Sentieri escursionistici, vie ferrate – spettacolari e a volte impegnativi, le affascinanti vette delle Dolomiti, patrimonio mondiale dell'UNESCO, si librano nell'aria con una maestosità che non ha uguali. Esperti possono scoprire sentieri unici in alta quota e le vie ferrate più belle, peró la natura incontaminata per praticare facili escursioni a media quota è agibile per tutti i livelli. Immergetevi in esperienze indimenticabili e panorami affascinanti.</p><p>Se volete scoprire questo affascinante mondo stando sulle due ruote, vi consigliamo la pista ciclabile a valle che attraversa molte delle località della regione Tre Cime Dolomites fino ad arrivare in Austria a Lienz nel Tirolo Orientale, per poi tornare con il treno fino San Candido. Gli appassionati di bici da corsa conquistano i passi dolomitici, mentre in mountain bike si utilizzano i percorsi forestali.</p><p><strong>Altre attività:</strong></p><ul><li>Parco Kurpark Raiffeisen Kneipp for me® a Villabassa</li><li>Nordic walking attraverso prati e alpeggi</li><li>Fare il bagno nel lago balneabile naturale di Dobbiaco, nella piscina all'aperto di Sesto o nella Piscina avventura Acquafun a San Candido.</li><li>Divertimento in volo con il parapendio tandem</li><li><strong>Tennis:</strong> troverete campi gratuiti a Sesto, San Candido, Dobbiaco e Villabassa. Tennis al coperto si trova a Sesto e Dobbiaco.</li><li>Il minigolf è disponibile a Sesto e a San Candido</li><li><strong>Giro in mongolfiera:</strong> vivere la regione 3 Cime Dolomites dall'alto</li><li><strong>Equitazione:</strong> Al maso Kramerhof e al maneggio Unterlaner a Sesto oppure presso il Maso Steinwandterhof a Braies.</li><li>Gite in barca sul Lago di Dobbiaco o sul Lago di Braies</li></ul>`,
          //           },
          //           {
          //             id: 'item3',
          //             url: 'https://cdn.mts-online.com/u1011/static/img/topic3.png',
          //             title: 'Sesto',
          //             subTitle: 'Sesto',
          //             description: `<p><strong>Sesto</strong></p><p>L'affascinante paese montano di Sesto è incastonato tra montagne da sogno dove la natura è protagonista assoluta. Soprattutto per gli alpinisti, qui troveranno la vacanza ideale, Sesto è famosa per avere le cime più importanti ed imponenti delle Dolomiti.</p><p>Le cinque vette dolomitiche uno, nove, dieci (Sesto Croda Rossa), undici, dodici formano uno spettacolo naturale unico al mondo: la meridiana in pietra più grande del mondo.</p><p>La meridiana di Sesto si trova vicino alle famose Tre Cime di Lavaredo. La potete vedere guardando da Moso / Val Fiscalina, il movimento del sole si abbina ai nomi delle montagne. Al solstizio d'inverno, il sole è esattamente alle 12 sopra la cima 12 e alle 13 proprio sopra la cima 1. I romani calcolarono il tutto con parametri diversi dai nostri, l'alba alle 12 cioè la "sexta hora". Gli storici lo vedono come il motivo del nome Sesto della località.</p>`,
          //           },
          //         ],
          //         topicCardVersion: '1',
          //       },
          //     },
          //     {
          //       id: 'mobilenavbar',
          //       module: 'Navbar',
          //       library: '@mts-online/library-light',
          //       slot: 'mobilenavbar',
          //       blockProps: {
          //         active: true,
          //         logoSrc: 'https://cdn.mts-online.com/u1011/static/img/logo.svg',
          //         logoToggleSrc: 'https://cdn.mts-online.com/u1011/static/img/logomobile.png',
          //         logo: {
          //           href: '/',
          //           anchor: 'header',
          //         },
          //         align: 'center',
          //         spacing: 'large',
          //         variation: 'vertical',
          //         toggleVariant: 'right-left',
          //         position: 'left',
          //         toggleIcon: 'https://cdn.mts-online.com/u1011/static/icons/toggle.svg',
          //         toggleCloseIcon: 'https://cdn.mts-online.com/u1011/static/icons/toggleclose.svg',
          //         backgroundImage: 'https://cdn.mts-online.com/u1011/static/img/backgroundtoggle.jpg',
          //         items: [
          //           { id: 'item1', title: "Hotel Kohlerhof", anchor: 'imageTextBox1', active: true },
          //           { id: 'item2', title: 'Vivere', anchor: 'roomSlider', active: true },
          //           { id: 'item3', title: 'Offerte', anchor: 'offerSlider', active: true },
          //           { id: 'item4', title: 'Sesto', anchor: 'topics', active: true },
          //           { id: 'item5', title: 'Estate', anchor: 'topics', active: true },
          //           { id: 'item6', title: 'Inverno', anchor: 'topics', active: true },
          //           {
          //             id: 'item7',
          //             title: 'Richiesta',
          //             anchor: 'richiesta',
          //             href: '/it/richiesta',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod31',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'mobileStickyFooter',
          //       blockProps: {
          //         id: 'mobileStickyFooter',
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'right',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'Prenota',
          //             href: 'https://booking.kohlerhof.com/?skd-language-code=it',
          //             target: '_blank',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'stickybutton',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'stickyButtons',
          //       blockProps: {
          //         id: 'stickybuttons',
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'small',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'Call',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/call.svg',
          //             iconWidth: 20,
          //             iconHeight: 20,
          //             href: 'tel:+393663533442',
          //             active: true,
          //           },
          //           {
          //             id: 'item2',
          //             title: 'Navigate',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/navigate.svg',
          //             iconWidth: 20,
          //             iconHeight: 20,
          //             href: 'https://goo.gl/maps/y6moWcNtBRpZ7TiW7',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //   ],
          // },
          // {
          //   path: '/en',
          //   language: 'en',
          //   hrefLang: {
          //     it: '/it',
          //     de: '/',
          //   },
          //   scripts: [
          //     {
          //       src: '//cdn.cookie-script.com/s/7b461d2cc1cc945e72911cb0e44943fd.js',
          //     },
          //   ],
          //   meta: {
          //     title: "Hotel Kohlerhof | Sesto",
          //     description: "Hotel Kohlerhof",
          //   },
          //   layout: {
          //     module: 'MenuHeaderContentFooter',
          //     library: '@mts-online/library-light',
          //     blockProps: {
          //       active: true,
          //       headerBar: { active: true, fixed: true },
          //       slots: {
          //         logo: {
          //           active: true,
          //         },
          //         menu: {
          //           active: true,
          //         },
          //         languagemenu: {
          //           active: true,
          //         },
          //         header: {
          //           active: true,
          //         },
          //         content: {
          //           active: true,
          //         },
          //         footer: {
          //           active: true,
          //         },
          //         contact: {
          //           active: true,
          //         },
          //         map: {
          //           active: true,
          //         },
          //         newsletter: {
          //           active: true,
          //         },
          //         followus: {
          //           active: true,
          //         },
          //         social: {
          //           active: true,
          //         },
          //         partners: {
          //           active: true,
          //         },
          //         copyright: {
          //           active: true,
          //         },
          //         copyright2: {
          //           active: true,
          //         },
          //         copyright3: {
          //           active: true,
          //         },
          //         roomslider: {
          //           active: true,
          //         },
          //         requestform: {
          //           active: true,
          //         },
          //         offerslider: {
          //           active: true,
          //         },
          //         imagegallery: {
          //           active: true,
          //         },
          //         videoplayer: {
          //           active: true,
          //         },
          //         imageTextBox: {
          //           active: true,
          //         },
          //         topics: {
          //           active: true,
          //         },
          //         mobilenavbar: {
          //           active: true,
          //         },
          //         mobileStickyFooter: {
          //           active: true,
          //         },
          //         stickyButtons: {
          //           active: true,
          //         },
          //       },
          //     },
          //   },
          //   modules: [
          //     {
          //       id: 'mod14',
          //       module: 'Logo',
          //       library: '@mts-online/library-light',
          //       slot: 'logo',
          //       blockProps: {
          //         active: true,
          //         src: 'https://cdn.mts-online.com/u1011/static/img/logo.svg',
          //         alt: "Hotel Kohlerhof",
          //         anchor: 'headerslider1',
          //         href: '/en',
          //         width: 300,
          //         height: 53,
          //       },
          //     },
          //     {
          //       id: 'mod15',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'menu',
          //       blockProps: {
          //         active: true,
          //         align: 'right',
          //         items: [
          //           { id: 'item1', title: "Hotel Kohlerhof", anchor: 'imageTextBox1', active: true },
          //           { id: 'item2', title: 'Living', anchor: 'roomSlider', active: true },
          //           { id: 'item3', title: 'Offers', anchor: 'offerSlider', active: true },
          //           { id: 'item4', title: 'Sesto', anchor: 'topics', active: true },
          //           { id: 'item5', title: 'Summer', anchor: 'topics', active: true },
          //           { id: 'item6', title: 'Winter', anchor: 'topics', active: true },
          //           // { id: 'item4', title: 'Kontakt', anchor: 'address1', active: true },
          //           {
          //             id: 'item7',
          //             title: 'Kontakt',
          //             href: 'tel:+393663533442',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/phone.svg',
          //             active: true,
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             iconLazy: false,
          //           },
          //           {
          //             id: 'item8',
          //             title: 'Request',
          //             action: 'openRequestForm',
          //             // anchor: 'request',
          //             href: '/en/request',
          //             active: true,
          //             itemVariant: 'button-text',
          //             buttonVariant: 'primary',
          //           },
          //           {
          //             id: 'item9',
          //             title: 'Book',
          //             href: 'https://booking.kohlerhof.com/?skd-language-code=en',
          //             to: 'https://booking.kohlerhof.com/?skd-language-code=en',
          //             target: '_blank',
          //             active: true,
          //             itemVariant: 'button-text',
          //             buttonVariant: 'cta',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod16',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'languagemenu',
          //       blockProps: {
          //         active: true,
          //         id: 'languagemenu',
          //         variation: 'horizontal',
          //         spacing: 'medium',
          //         align: 'center',
          //         divider: 'line',
          //         items: [
          //           { id: 'item1', title: 'de', href: '/', hrefLang: 'de', active: true },
          //           { id: 'item2', title: 'it', href: '/it', hrefLang: 'it', active: true },
          //           { id: 'item3', title: 'en', href: '/en', hrefLang: 'en', active: true },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'headerslider1',
          //       module: 'ImageSlider',
          //       library: '@mts-online/library-light',
          //       slot: 'header',
          //       blockProps: {
          //         active: true,
          //         slides: [
          //           {
          //             id: 'item1',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/ariana-banner.jpg',
          //             alt: "Hotel Kohlerhof",
          //             fit: 'cover',
          //             lazy: false,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'imageTextBox1',
          //       module: 'ImageTextBox',
          //       library: '@mts-online/library-light',
          //       slot: 'content',
          //       blockProps: {
          //         active: true,
          //         general: {
          //           position: 'right',
          //           variation: 'box-in-box',
          //         },
          //         image: {
          //           active: true,
          //           zoom: true,
          //           src: 'https://cdn.mts-online.com/u1011/static/img/Cam_4.jpg',
          //           alt: "Hotel Kohlerhof",
          //         },
          //         content: {
          //           active: true,
          //           title: "Hotel Kohlerhof",
          //           text: '<p>Upon arrival, you’ll experience a certain luxury against the backdrop of a breathtaking landscape whilst also returning to nature. That’s Ariane, Helmut, Marcel and Pirmin Villgrater’s vision!</p><p>Ariane’s Guesthouse is a place to disconnect, relax and enjoy life in the middle of the Sesto mountains. All of the apartments at Ariane’s Guesthouse are modern, extra special, airy and designed with an excellent eye for detail. Let us inspire you…</p>',
          //         },
          //       },
          //     },
          //     {
          //       id: 'imageTextBox2',
          //       module: 'ImageTextBox',
          //       library: '@mts-online/library-light',
          //       slot: 'content',
          //       blockProps: {
          //         active: true,
          //         general: {
          //           position: 'left',
          //           variation: 'box-in-box',
          //         },
          //         image: {
          //           active: true,
          //           zoom: true,
          //           src: 'https://cdn.mts-online.com/u1011/static/img/Cam_5.jpg',
          //           alt: "Hotel Kohlerhof",
          //         },
          //         content: {
          //           active: true,
          //           title: 'Time for consciousness and imagination',
          //           text: '<p>Where is the room for consciousness and imagination in a world that’s constantly becoming louder and more hectic? Where can we go when we long for silence, honest values, nature and unspoilt scenery?</p><p>We aim to create an atmosphere of integrality and understanding, focusing on nature, health and enjoyment for the whole family. For Ariane, her family and her guests.</p><p>Ariane is a passionate chef and prepares <i>Schlutzkrapfen</i> (spinach ravioli) and bread dumplings with lots of love, which guests can purchase at any time – she can give you some tips and maybe even let you join in on the cooking! Bake brown bread with Ariane &amp; Helmut, “pitschn” Schlutzkrapfen, make pizza with Marcel &amp; Pirmin – and more!</p>',
          //         },
          //       },
          //     },
          //     {
          //       id: 'roomSlider',
          //       module: 'WidgetRoomsSlider2',
          //       library: '@mts-online/library-light',
          //       slot: 'roomslider',
          //       blockProps: {
          //         clientId: 'u1011',
          //         cardsToShow: '3',
          //         cardGap: '24px',
          //         sliderType: 'normal',
          //         priceMinFraction: 0,
          //         priceMaxFraction: 0,
          //         bookings: {
          //           enquiryURL: 'https://s.mts-online.com/',
          //           enquiryTargets: {
          //             de: '/widget/popup.html?widget=request',
          //             it: '/widget/popup.html?widget=request',
          //             en: '/widget/popup.html?widget=request',
          //           },
          //           bookingProvider: 'kube',
          //           bookingURL: 'https://booking.kohlerhof.com/',
          //           bookingTargets: {
          //             de: '',
          //             it: '',
          //             en: '',
          //           },
          //         },
          //         labels: {
          //           showDetails: {
          //             de: 'Details anzeigen',
          //             it: 'Mostra dettagli',
          //             en: 'Show details',
          //           },
          //           request: {
          //             de: 'Anfragen',
          //             it: 'Richiesta',
          //             en: 'Request',
          //           },
          //           book: {
          //             de: 'Buchen',
          //             it: 'Prenota',
          //             en: 'Book',
          //           },
          //           from: {
          //             de: 'ab',
          //             it: 'da',
          //             en: 'from',
          //           },
          //           currencySymbol: {
          //             de: '€',
          //             it: '€',
          //             en: '€',
          //           },
          //           perPerson: {
          //             de: 'pro Person',
          //             it: 'a persona',
          //             en: 'per person',
          //           },
          //           perNight: {
          //             de: 'pro Nacht',
          //             it: 'a notte',
          //             en: 'per night',
          //           },
          //           upTo: {
          //             de: 'bis max.',
          //             it: 'fino ad un massimo di',
          //             en: 'up to a maximum of',
          //           },
          //           details: {
          //             de: 'Einzelheiten',
          //             it: 'Particolari',
          //             en: 'Details',
          //           },
          //           offerUnavailableInfo: {
          //             de: 'Dieses Angebot ist nicht verfügbar',
          //             it: 'Questa offerta non è disponibile',
          //             en: 'This Offer is not available',
          //           },
          //           availablePeriods: {
          //             de: 'Verfügbare Zeiträume',
          //             it: 'Periodi disponibili',
          //             en: 'Available Periods',
          //           },
          //           for: {
          //             de: 'für',
          //             it: 'per',
          //             en: 'for',
          //           },
          //           nights: {
          //             de: 'Nächte',
          //             it: 'Nights',
          //             en: 'Notti',
          //           },
          //           persons: {
          //             de: 'personen',
          //             it: 'persone',
          //             en: 'persons',
          //           },
          //           prices: {
          //             de: 'Preise',
          //             it: 'Prezzi',
          //             en: 'Prices',
          //           },
          //           offers: {
          //             de: 'Angebote',
          //             it: 'Offerte',
          //             en: 'Offers',
          //           },
          //           period: {
          //             de: 'Zeitraum',
          //             it: 'Periodo di tempo',
          //             en: 'Period',
          //           },
          //           price: {
          //             de: 'Preis',
          //             it: ' Prezzo',
          //             en: 'Price',
          //           },
          //         },
          //       },
          //     },
          //     {
          //       id: 'imageTextBox3',
          //       module: 'ImageTextBoxV2',
          //       library: '@mts-online/library-light',
          //       slot: 'imageTextBox',
          //       blockProps: {
          //         id: 'imageTextBox',
          //         active: true,
          //         image: { active: true, src: 'https://cdn.mts-online.com/u1011/static/img/ariane.png', alt: 'Alt' },
          //         content: {
          //           position: 'right',
          //           active: true,
          //           title: 'Your stay',
          //           text: '<p>Let nature enchant you and your body and soul relax…</p><p>All our studios are equipped with satellite LCD TV, hairdryer, dishwasher, fridge with freezer, coffee maker and ceramic hob. We have used natural materials such as wooden floors, wooden furniture and stone walls in the design of the rooms.</p><p>You will find bed linen, towels, tea towels and a stocked wine cabinet in every apartment. A laundry room with an ironing board and iron are available on request.</p>',
          //         },
          //       },
          //     },
          //     {
          //       id: 'offerSlider',
          //       module: 'WidgetOffersSlider',
          //       library: '@mts-online/library-light',
          //       slot: 'offerslider',
          //       blockProps: {
          //         clientId: 'u1011',
          //         hotelId: 'S005456',
          //         cardsToShow: '2',
          //         cardGap: '24px',
          //         sliderType: 'normal',
          //         priceMinFraction: 0,
          //         priceMaxFraction: 0,
          //         bookings: {
          //           enquiryURL: 'https://s.mts-online.com/',
          //           enquiryTargets: {
          //             de: '/widget/popup.html?widget=request',
          //             it: '/widget/popup.html?widget=request',
          //             en: '/widget/popup.html?widget=request',
          //           },
          //           bookingProvider: 'KUBE',
          //           bookingURL: 'https://booking.kohlerhof.com/',
          //           bookingTargets: {
          //             de: '',
          //             it: '',
          //             en: '',
          //           },
          //         },
          //         labels: {
          //           showDetails: {
          //             de: 'Details anzeigen',
          //             it: 'Mostra dettagli',
          //             en: 'Show details',
          //           },
          //           request: {
          //             de: 'Anfragen',
          //             it: 'Richiesta',
          //             en: 'Request',
          //           },
          //           book: {
          //             de: 'Buchen',
          //             it: 'Prenota',
          //             en: 'Book',
          //           },
          //           from: {
          //             de: 'ab',
          //             it: 'da',
          //             en: 'from',
          //           },
          //           perPerson: {
          //             de: 'pro Person',
          //             it: 'a persona',
          //             en: 'per person',
          //           },
          //           perNight: {
          //             de: 'pro Nacht',
          //             it: 'per notte',
          //             en: 'per night',
          //           },
          //           upTo: {
          //             de: 'bis max.',
          //             it: 'fino ad un massimo di',
          //             en: 'up to a maximum of',
          //           },
          //           breakfast: {
          //             de: 'Frühstück',
          //             it: 'Colazione',
          //             en: 'Breakfast',
          //           },
          //           for: {
          //             de: 'für',
          //             it: 'per',
          //             en: 'for',
          //           },
          //           nights: {
          //             de: 'Nächte',
          //             it: 'Notti',
          //             en: 'Nights',
          //           },
          //           persons: {
          //             de: 'personen',
          //             it: 'persone',
          //             en: 'persons',
          //           },
          //           details: {
          //             de: 'Details',
          //             it: 'Dettagli',
          //             en: 'Details',
          //           },
          //           prices: {
          //             de: 'Preise',
          //             it: 'Prezzi',
          //             en: 'Prices',
          //           },
          //           detailsTitle: {
          //             de: 'Das Angebot beinhaltet',
          //             it: "L'offerta comprende",
          //             en: 'The offer includes',
          //           },
          //         },
          //       },
          //     },
          //     {
          //       id: 'address1',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'contact',
          //       blockProps: {
          //         active: true,
          //         variation: 'vertical',
          //         spacing: 'large',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: `Hotel Kohlerhof<br>Via Waldheim 16A<br>39030 Sexten BZ<br>Italien`,
          //             active: true,
          //             href: 'https://goo.gl/maps/y6moWcNtBRpZ7TiW7',
          //             itemVariant: 'icon-text',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/location.svg',
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             isHtmlText: true,
          //             hoverVariant: 'underline',
          //             itemsPosition: 'ends',
          //           },
          //           {
          //             id: 'item2',
          //             title: '+393663533442',
          //             href: 'tel:+393663533442',
          //             active: true,
          //             itemVariant: 'icon-text',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/phone.svg',
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             hoverVariant: 'underline',
          //             itemsPosition: 'ends',
          //           },
          //           {
          //             id: 'item3',
          //             title: 'INFO@KOHLERHOF.COM',
          //             href: '/anfragen',
          //             active: true,
          //             itemVariant: 'icon-text',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/email.svg',
          //             iconWidth: 24,
          //             iconHeight: 24,
          //             hoverVariant: 'underline',
          //             itemsPosition: 'ends',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod21',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'map',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'Google maps',
          //             href: 'https://goo.gl/maps/y6moWcNtBRpZ7TiW7',
          //             itemVariant: 'image',
          //             imageWidth: 605,
          //             image: 'https://cdn.mts-online.com/u1011/static/img/map.png',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod23',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'followus',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'small',
          //         align: 'left',
          //         items: [
          //           { id: 'item1', title: 'Follow us', active: true },
          //           {
          //             id: 'item2',
          //             title: 'Instagram',
          //             active: true,
          //             itemVariant: 'icon',
          //             target: '_blank',
          //             href: 'https://www.instagram.com/',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/instagram.svg',
          //             iconWidth: 18,
          //             iconHeight: 18,
          //             itemsPosition: 'ends',
          //           },
          //           {
          //             id: 'item3',
          //             title: 'Facebook',
          //             active: true,
          //             itemVariant: 'icon',
          //             target: '_blank',
          //             href: 'https://www.facebook.com/',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/facebook.svg',
          //             iconWidth: 18,
          //             iconHeight: 18,
          //             itemsPosition: 'ends',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod24',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'partners',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: '',
          //             href: '3zinnen',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/img/zinnen.png',
          //             active: true,
          //             iconWidth: 75,
          //             iconHeight: 60,
          //           },
          //           {
          //             id: 'item1',
          //             title: '',
          //             href: 'suedtirol',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/img/suedtirol.png',
          //             active: true,
          //             iconWidth: 75,
          //             iconHeight: 60,
          //           },
          //           {
          //             id: 'item1',
          //             title: '',
          //             href: 'sexten',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/img/sexten.png',
          //             active: true,
          //             iconWidth: 114,
          //             iconHeight: 35,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod25',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'copyright',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         items: [{ id: 'item1', title: '2022 © Ariane’s Guesthouse', active: true }],
          //       },
          //     },
          //     {
          //       id: 'mod26',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'copyright2',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'mtsonline',
          //             href: 'https://www.mts-online.com',
          //             target: '_blank',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/mtsonline-logo.svg',
          //             active: true,
          //             iconWidth: 18,
          //             iconHeight: 18,
          //             iconLazy: false,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod27',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'copyright3',
          //       blockProps: {
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'center',
          //         divider: 'line',
          //         items: [
          //           { id: 'item1', title: 'Legal Notice', href: '/en/impressum', active: true },
          //           {
          //             id: 'item2',
          //             title: 'Privacy',
          //             href: '/en/privacy',
          //             active: true,
          //           },
          //           {
          //             id: 'item3',
          //             title: 'T&C',
          //             href: '/en/agb',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod28',
          //       module: 'ImageSlider',
          //       library: '@mts-online/library-light',
          //       slot: 'imagegallery',
          //       blockProps: {
          //         id: 'gallery',
          //         active: true,
          //         slidesPerView: 3,
          //         height: 630,
          //         infinite: true,
          //         gap: 'large',
          //         navigation: {
          //           position: 'between-outside',
          //           leftIcon: 'https://cdn.mts-online.com/u1011/static/icons/arrow-left.svg',
          //           rightIcon: 'https://cdn.mts-online.com/u1011/static/icons/arrow-right.svg',
          //           width: 40,
          //         },
          //         // popup: true,
          //         slides: [
          //           {
          //             id: 'img1',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_4.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //           {
          //             id: 'img2',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_5.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //           {
          //             id: 'img3',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_6.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //           {
          //             id: 'img4',
          //             src: 'https://cdn.mts-online.com/u1011/static/img/Cam_8.jpg',
          //             alt: `Hotel Kohlerhof`,
          //             lazy: true,
          //             fit: 'cover',
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod30',
          //       module: 'VideoPlayer',
          //       library: '@mts-online/library-light',
          //       slot: 'videoplayer',
          //       blockProps: {
          //         id: 'videoplayer',
          //         active: true,
          //         position: 'center',
          //         fit: 'cover',
          //         url: 'https://cdn.mts-online.com/u1011/static/img/3Z_Ski_20.mp4',
          //         image: {
          //           src: 'https://cdn.mts-online.com/u1011/static/img/videoverlay.png',
          //           alt: 'Alt',
          //           originalWidth: 1075,
          //           originalHeight: 605,
          //         },
          //       },
          //     },
          //     {
          //       id: 'topics',
          //       module: 'Topics',
          //       library: '@mts-online/library-light',
          //       slot: 'topics',
          //       blockProps: {
          //         id: 'topics',
          //         active: true,
          //         labels: {
          //           details: {
          //             de: 'Details anzeigen',
          //             it: 'Mostra dettagli',
          //             en: 'Show details',
          //           },
          //           back: {
          //             de: 'Zurück',
          //             it: 'Indietro',
          //             en: 'Back',
          //           },
          //         },
          //         items: [
          //           {
          //             id: 'item1',
          //             url: 'https://cdn.mts-online.com/u1011/static/img/topic1.png',
          //             title: 'Winter',
          //             subTitle: 'Winter',
          //             description: `<p><strong>Fresh winter air &amp; the scent of biscuits,</strong><br><strong>Jingling bells &amp; Christmas carols,</strong><br><strong>Sugar-dusted peaks &amp; snowball fights</strong></p><p>&nbsp;</p><p>The cosy Christmas season with its traditions &amp; biscuit baking, festive lights and Christmas decorations, New Year’s, White Weeks &amp; Carnival – that’s winter here in the mountains.</p><p>You can <strong>ski &amp; snowboard </strong>on our four mountains with guaranteed snow and perfectly groomed slopes for all levels, kid-friendly lifts and a family adventure mountain: these are the ingredients for your ultimate ski holiday in the Dolomites. With over 200km of groomed cross-country trails, Sesto is Italy’s No. 1 cross-country skiing region. You can start from Ariane’s Guesthouse on the vast network of cross-country ski trails and head not only into the Val Fiscalina valley but also as far as the Lake Braies and the Dobbiaco cross-country stadium with FIS trails. <strong>Winter hiking or snowshoeing </strong>in the Sesto Dolomites – experience the quiet side of winter on walks through the idyllic snow-covered landscape.</p><p>While <strong>ski touring</strong>, you can enjoy the silence and experience the fascinating natural landscape of the Dolomites: untouched snow, magnificent views and sunshine as far as the eye can see.</p><p><strong>Additional activities:</strong></p><ul><li><strong>Tobogganing: </strong>Reach the top on foot or with the lift and enjoy an exhilarating ride down the mountain and into the valley.</li><li>There are several toboggan runs here. Helmets are required for children under 14!</li><li><strong>Ice skating: </strong>in Sesto, Dobbiaco and Villabassa, you will find the most beautiful ice skating rinks.</li><li><strong>Curling </strong>is<strong> </strong>possible at Lake Dobbiaco, in Villabassa and Sesto.</li><li><strong>Hot air balloon ride: </strong>experience the 3 Peaks Dolomite region from above!</li><li><strong>Horse-drawn sleigh ride: </strong>enjoy a romantic ride through dreamy winter landscapes in Sesto and Dobbiaco.</li><li><strong>Tennis and squash </strong>in the indoor tennis court in Sesto; work out and relieve stress!</li><li><strong>Climbing </strong>is possible in the<strong> </strong>climbing halls in Sesto and Dobbiaco.</li></ul>`,
          //           },
          //           {
          //             id: 'item2',
          //             url: 'https://cdn.mts-online.com/u1011/static/img/topic2.png',
          //             title: 'Sommer',
          //             subTitle: 'Sommer',
          //             description: `<p><strong>Summer</strong></p><p>Unwind and experience tranquillity and nature.</p><p>Summer in the Dolomites is full of variation, excitement and views, as every adventure includes a spectacular panoramic view of the Dolomites. Loads of cultural treasures and events also await you. The Dolomites’ wonderful views and nature make a long-lasting impression.</p><p><strong>Hiking trails, hiking tips and via ferrata tours </strong>– bizarre and rugged but equally fascinating, the peaks of the UNESCO World Heritage Dolomites soar high into the sky. Experienced and skilled hikers master unique high-altitude trails and the most beautiful via ferrata routes, but also on easy hikes at medium altitudes, you can experience pure nature, unforgettable mountain adventures and fascinating views.</p><p>For those who want to <strong>discover the world on two wheels</strong>, we recommend the valley cycle path to the individual towns in the 3 Peaks Dolomite Region and as far as Lienz in East Tyrol – you can return with the train to San Candido. Road cycling enthusiasts can conquer the mountain passes, and mountain bikers can head steeply uphill on forest paths.</p><p><strong>Additional activities:</strong></p><ul><li>Raiffeisen Kneipp für mich® Aktivpark cold water therapy in the spa gardens of Villabassa</li><li>Nordic walking across meadows, fields and alpine pastures</li><li>Swimming in the natural swimming lake in Dobbiaco, in the outdoor swimming pool in Sesto or in the Acquafun adventure pool in San Candido</li><li>Fly high with a tandem paragliding flight</li><li>Tennis: you will find outdoor courts in Sesto, San Candido, Dobbiaco and Villabassa. Indoor tennis can be played in Sesto and Dobbiaco.</li><li>Mini golf in Sesto and San Candido</li><li>Hot air balloon flight: experience the 3 Peaks Dolomite region from above.</li><li>Play beach volleyball with stunning views in the 3 Peaks Dolomite region.</li><li>Horse riding: at the Kramerhof farm, the Unterlaner riding stable in Sesto, and the Steinwandterhof farm in Braies.</li><li>Boat rides on Lake Dobbiaco or Lake Braies</li></ul>`,
          //           },
          //           {
          //             id: 'item3',
          //             url: 'https://cdn.mts-online.com/u1011/static/img/topic3.png',
          //             title: 'Sexten',
          //             subTitle: 'Sexten',
          //             description: `<p><strong>Sesto</strong></p><p>The charming village of Sesto is surrounded by the naturally breathtaking Sesto Dolomites. It’s an especially popular holiday destination for alpinists, as the major Dolomite peaks are located here.</p><p>The five Dolomite peaks Neuner (“Nine”), Zehner (“Ten”), Elfer (“Eleven”), Zwölfer (“Twelve”) and Einser (“One”) form a unique natural phenomenon, the largest stone sundial in the world. The Sesto Sundial is located close to the world-famous Three Peak mountains.</p><p>The sun moves in harmony with the mountains when you look at them from Bad Moos in the Val Fiscalina valley. During the winter solstice, the sun stands directly above the Zweilfer (“Twelve”) mountain at noon and right at the peak of the Einser (“One”) at 1 p.m. The Romans divided time differently, as they started counting at sunrise. Noon was, therefore, the “sexta hora”. Historians see this as an indication that the name Sexten (or Sesto in Italian) comes from the Zwölfer mountain, which once displayed the “sexta hora”.</p>`,
          //           },
          //         ],
          //         topicCardVersion: '1',
          //       },
          //     },
          //     {
          //       id: 'mobilenavbar',
          //       module: 'Navbar',
          //       library: '@mts-online/library-light',
          //       slot: 'mobilenavbar',
          //       blockProps: {
          //         active: true,
          //         logoSrc: 'https://cdn.mts-online.com/u1011/static/img/logo.svg',
          //         logoToggleSrc: 'https://cdn.mts-online.com/u1011/static/img/logomobile.png',
          //         logo: {
          //           href: '/',
          //           anchor: 'header',
          //         },
          //         align: 'center',
          //         spacing: 'large',
          //         variation: 'vertical',
          //         toggleVariant: 'right-left',
          //         position: 'left',
          //         toggleIcon: 'https://cdn.mts-online.com/u1011/static/icons/toggle.svg',
          //         toggleCloseIcon: 'https://cdn.mts-online.com/u1011/static/icons/toggleclose.svg',
          //         backgroundImage: 'https://cdn.mts-online.com/u1011/static/img/backgroundtoggle.jpg',
          //         items: [
          //           { id: 'item1', title: "Hotel Kohlerhof", anchor: 'imageTextBox1', active: true },
          //           { id: 'item2', title: 'Living', anchor: 'roomSlider', active: true },
          //           { id: 'item3', title: 'Offers', anchor: 'offerSlider', active: true },
          //           { id: 'item4', title: 'Sesto', anchor: 'topics', active: true },
          //           { id: 'item5', title: 'Sommer', anchor: 'topics', active: true },
          //           { id: 'item6', title: 'Winter', anchor: 'topics', active: true },
          //           {
          //             id: 'item7',
          //             title: 'Anfragen',
          //             anchor: 'request',
          //             href: '/en/request',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'mod31',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'mobileStickyFooter',
          //       blockProps: {
          //         id: 'mobileStickyFooter',
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'xlarge',
          //         align: 'right',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'Book',
          //             href: 'https://booking.kohlerhof.com/?skd-language-code=en',
          //             target: '_blank',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       id: 'stickybutton',
          //       module: 'Menu',
          //       library: '@mts-online/library-light',
          //       slot: 'stickyButtons',
          //       blockProps: {
          //         id: 'stickybuttons',
          //         active: true,
          //         variation: 'horizontal',
          //         spacing: 'small',
          //         align: 'center',
          //         items: [
          //           {
          //             id: 'item1',
          //             title: 'Call',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/call.svg',
          //             iconWidth: 20,
          //             iconHeight: 20,
          //             href: 'tel:+393663533442',
          //             active: true,
          //           },
          //           {
          //             id: 'item2',
          //             title: 'Navigate',
          //             itemVariant: 'icon',
          //             icon: 'https://cdn.mts-online.com/u1011/static/icons/navigate.svg',
          //             iconWidth: 20,
          //             iconHeight: 20,
          //             href: 'https://goo.gl/maps/y6moWcNtBRpZ7TiW7',
          //             active: true,
          //           },
          //         ],
          //       },
          //     },
          //   ],
          // },
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