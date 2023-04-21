// GET THE CLIENT FROM DATABASE

import nextConnect from 'next-connect'
import middleware from '../../../../../../middlewares/middleware'
import { isEmpty } from '../../../../../../lib/utils'
import { getClient, getProduct, getContent, getDomainByUrl } from '../../../../../../lib/db'
import cors from '../../../../../../middlewares/cors'

const iiqcheckMtsConfigNaturhotelWieserhof = {
  _id: 'hv82l82f22',
  language: 'en',
  name: 'en',
  slug: 'en',
  path: '/',
  default: true,
  title: 'iiqcheck',
  pages: [],
  styles: {
    'fontFamily-body': 'inherit',
    'fontFamily-rating': 'Century Gothic',
    'fontFamily-text': 'Century Gothic',
    'fontWeight-rating': 600,
    'fontSize-max': 2.5,
    'fontSize-base': 1,
    'fontColor-rating': '#444444',
    'fontColor-text': '#b19261',
    'loader-size': 180,
    'line-width': 3.5,
    'line-color': '#444444',
    'color-primary-dark': '#ffffff',
    'color-primary-light': '#2f4632',
  },
  components: [
    {
      name: 'iiqcheck-mts',
      component: 'WidgetIIQCheck1',
      category: 'widget',
      version: '1',
      props: {
        widgetType: 'iiq',
        strokeWidth: 20,
        minScore: 4.5,
        delay: 15,
        labels: {
          reviewOf: { de: 'von', en: 'of', it: 'di' },
          reviewBy: { de: 'Rezensiert von', en: 'Reviewed by', it: 'Recensito da' },
          reviewGuest: { de: 'Gäste', en: 'guests', it: 'ospiti' },
          reviewLink: {
            de: 'https://www.naturhotelwieserhof.com/de/reviews/',
            en: 'https://www.naturhotelwieserhof.com/en/reviews/',
            it: 'https://www.naturhotelwieserhof.com/reviews/',
          },
        },
      },
    },
  ],
}

const iiqMtsConfigLudwigshof = {
  _id: 'iiiml83f8D',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'iiq',
  pages: [],
  styles: {
    // For u0705
    'fontFamily-body': 'Open Sans',
    'fontFamily-heading': 'Playfair Display',
    'fontWeight-heading': 400,
    'fontSize-min': 18,
    'fontSize-max': 18,
    'fontSize-base': 18,
    'color-primary': '#3d3c3a',
    'color-primary-dark': '#222',
    'color-primary-light': '#3c3831',
    'color-secondary': '#a3674c',
    'color-secondary-dark': '#222',
    'color-secondary-light': '#a46f57',
  },
  components: [
    {
      name: 'iiq-mts',
      component: 'WidgetIIQ1',
      category: 'widget',
      version: '1',
      blockProps: {
        clientId: 'u0500',
        hotelId: 'MTS_MBH_0043', //needed to load the images with kognitiv-loader
        widgetType: 'iiq',
        portals: [],
        //   portals: ["google", "hotelde", "tripadvisor"],
        portalsMinPercentage: 80,
        strokeWidth: 2,
        minScore: 4.5,
        perPage: 20,
        title: {
          de: 'Kundenrezensionen',
          en: 'Customer reviews',
          it: 'Recensioni dei clienti ',
        },
      },
    },
  ],
}

const iiqMtsConfigLeitlhof = {
  _id: 'hv8ml83f8D',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'iiq',
  pages: [],
  styles: {
    'fontFamily-body': 'inherit',
    'fontFamily-heading': 'verdana',
    'fontWeight-heading': 500,
    'fontSize-min': '16px',
    'fontSize-max': '16px',
    'fontSize-base': '16px',
    'color-primary': '#5f5348',
    // 'color-primary-dark': '#000000',
    // 'color-primary-light': '#2c828d',
    'color-secondary': '#2c828d',
    // 'color-secondary-dark': '#000000',
    // 'color-secondary-light': '#5f5348',
    'viewPort-min': '640px',
    'viewPort-max': '1200px',
    'color-button': '#fff',
    'color-button-hover': '#fff',
    'backgroundColor-button': 'blue',
    'backgroundColor-button-hover': '#a39d91',
    'borderColor-button': '#bcbbac',
    'borderColor-button-hover': '#a39d91',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '1',
  },
  components: [
    {
      name: 'iiq-mts',
      component: 'WidgetIIQ1',
      category: 'widget',
      version: '1',
      blockProps: {
        clientId: 'u0724',
        hotelId: 'S003910', //needed to load the images with kognitiv-loader
        widgetType: 'iiq',
        portals: [],
        //   portals: ["google", "hotelde", "tripadvisor"],
        portalsMinPercentage: 80,
        strokeWidth: 4,
        minScore: 4.5,
        perPage: 10,
        title: {
          de: 'Kundenrezensionen',
          en: 'Customer reviews',
          it: 'Recensioni dei clienti ',
        },
      },
    },
  ],
}

const mmtsConfigVillaVerde = {
  _id: '11111933AD',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'Mmts',
  pages: [],
  fonts: [],
  styles: {
    'fontFamily-body': '"BodoniSvtyTwoITCTT-Book", sans-serif',
    'fontFamily-subHeading': '"SaveurSans-Regular", sans-serif',
    'fontFamily-heading': '"BodoniLTPro", serif',
    'fontFamily-button': '"SaveurSans-Regular", sans-serif',
    'fontSize-max': '24px',
    'fontSize-min': '17px',
    'fontSize-heading-max': '76.8px',
    'fontSize-heading-min': '25.5px',
    'fontSize-subHeading-max': '28.8px',
    'fontSize-subHeading-min': '17.51px',
    'fontSize-button-max': '24px',
    'fontSize-button-min': '14.96px',
    'lineHeight-body': '1.2',
    'fontWeight-heading': 400,
    'fontWeight-body': 400,
    // 'backgroundColor-primary': 'transparent',
    'backgroundColor-primary': '#d2e4d8',
    'backgroundColor-light': '#d2e4d8',
    'color-primary': '#2f1e19',
    'color-secondary': '#307e80',
    'color-light': '#d2e3d8',
    'color-button-hover': '#2f1e19',
    'backgroundColor-button': 'orange',
    'backgroundColor-button-hover': 'blue',
    'padding-button': '.2em .3em',
    'viewPort-min': '1px',
    'viewPort-max': '1600px',
    'borderColor-button-hover': '#2f1e19',
    'textTransform-title': 'uppercase',
    'textTransform-heading': 'uppercase',
    'textTransform-subTitle': 'uppercase',
    'textTransform-subHeading': 'uppercase',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '.7',
    breakpoints: [
      {
        min: '400px',
        max: '900px',
        styles: {
          'color-button': 'yellow',
        },
      },
    ],
  },
  components: [
    {
      _id: '83Y6k9n8KF',
      name: 'Moucher-mts',
      component: 'Mmts',
      category: 'widget',
      status: true,
      version: '1',
      blockProps: {
        paymentMethod: 'DataTrans',
      },
    },
  ],
}

const vmtsConfigVillaVerde = {
  _id: '2v1mk93fAD',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'Gutscheine schenken',
  pages: [],
  fonts: [
    // {
    //   name: 'BodoniSvtyTwoITCTT-Book',
    //   url: 'https://www.villaverde-meran.com/site/templates/fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff',
    //   fontFace:
    //     '@font-face { font-family: "BodoniSvtyTwoITCTT-Book"; src: url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.eot") format("eot"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.ttf") format("ttf"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff") format("woff"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    // },
    // {
    //   name: 'SaveurSans-Regular',
    //   url: 'https://www.villaverde-meran.com/site/templates/fonts/SaveurSans-Regular/SaveurSans-Regular.woff',
    //   fontFace:
    //     '@font-face { font-family: "SaveurSans-Regular"; src: url("../fonts/SaveurSans-Regular/SaveurSans-Regular.eot") format("eot"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.ttf") format("ttf"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.woff") format("woff"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    // },
    // {
    //   name: 'BodoniLTPro',
    //   url: 'https://www.villaverde-meran.com/site/templates/fonts/BodoniLTPro/BodoniLTPro.woff',
    //   fontFace:
    //     '@font-face { font-family: "BodoniLTPro"; src: url("../fonts/BodoniLTPro/BodoniLTPro.eot") format("eot"), url("../fonts/BodoniLTPro/BodoniLTPro.ttf") format("ttf"), url("../fonts/BodoniLTPro/BodoniLTPro.woff") format("woff"), url("../fonts/BodoniLTPro/BodoniLTPro.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    // },
  ],
  styles: {
    'fontFamily-body': '"BodoniSvtyTwoITCTT-Book", sans-serif',
    'fontFamily-subHeading': '"SaveurSans-Regular", sans-serif',
    'fontFamily-heading': '"BodoniLTPro", serif',
    'fontFamily-button': '"SaveurSans-Regular", sans-serif',
    'fontSize-max': '24px',
    'fontSize-min': '17px',
    'fontSize-heading-max': '76.8px',
    'fontSize-heading-min': '25.5px',
    'fontSize-subHeading-max': '28.8px',
    'fontSize-subHeading-min': '17.51px',
    'fontSize-button-max': '24px',
    'fontSize-button-min': '14.96px',
    'lineHeight-body': '1.2',
    'fontWeight-heading': 400,
    'fontWeight-body': 400,
    // 'backgroundColor-primary': 'transparent',
    'backgroundColor-primary': '#d2e4d8',
    'backgroundColor-light': '#d2e4d8',
    'color-primary': '#2f1e19',
    'color-secondary': '#307e80',
    'color-light': '#d2e3d8',
    'color-button-hover': '#2f1e19',
    'backgroundColor-button': '#d2e4d8',
    'backgroundColor-button-hover': '#d2e4d8',
    // 'padding-button': '.5em 1em',
    'viewPort-min': '640px',
    'viewPort-max': '1800px',
    'borderColor-button-hover': '#2f1e19',
    'textTransform-title': 'uppercase',
    'textTransform-heading': 'uppercase',
    'textTransform-subTitle': 'uppercase',
    'textTransform-subHeading': 'uppercase',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '.7',
    // breakpoints: [
    //   {
    //     min: '400px',
    //     max: '900px',
    //     styles: {
    //       'color-button': 'red',
    //     },
    //   },
    // ],
  },
  components: [
    {
      _id: '8lY6k9n8KF',
      name: 'Voucher-mts',
      component: 'Vmts',
      // component: 'WidgetVmts1',
      category: 'widget',
      status: true,
      version: '1',
      blockProps: {
        clientId: 'u0699',
        hotelId: 'S003787', //needed to load the images with kognitiv-loader
        paymentMethod: 'hobex',
        contactTemplate: `<h2>New message from V-MTS contact form</h2>
        <h3>{{ subject }}</h3>
        <p>{{ message }}</p>
        <h3>Contact Details</h3>
        <ul>
        <li>Name: {{ name }}</li>
        <li>Email: {{ email }}</li>
        </ul>`,
        categories: [
          {
            title: {
              de: 'Wertgutschein',
              it: 'Buono valore',
              en: 'Value voucher',
            },
            slug: 'value-voucher',
            // priceText: "ab 10 €",
            code: 'V_VOUCHER',
            linkText: {
              de: 'Gutschein erstellen',
              it: 'Create il Vostro voucher individuale',
              en: 'Create a voucher',
            },
            // description: "Erstellen Sie hier Ihren Gutschein",
            validDays: 365,
            image: [
              {
                width: 640,
                height: 540,
                fileName: '_V_VOUCHER.png',
              },
            ],
            type: 'voucher',
            options: [
              {
                minAmount: 10,
                maxAmount: 10000,
                maxQuantity: 100,
              },
            ],
            templates: [
              // multiple templates possible
              {
                // labels: - if there are fixed texts
                component: '',
                format: 'portrait',
                labels: [
                  {
                    title: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                    },
                    voucher: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                    },
                    orderNo: {
                      de: 'Bestellnummer',
                      en: 'Order number',
                      it: "Numero d'ordine",
                    },
                    validFrom: {
                      de: 'Ausgestellt',
                      en: 'date of issue',
                      it: 'data di emissione',
                    },
                    validTo: {
                      de: 'Einzulösen',
                      en: 'Valid until',
                      it: 'Da riscattare entro',
                    },
                    footer: [
                      {
                        name: {
                          en: 'Aparthotel VillaVerde',
                          de: 'Aparthotel VillaVerde',
                          it: 'Aparthotel VillaVerde',
                        },
                        address: {
                          de: 'Alte Landstraße 12, 39022 Meran, Südtirol (I)',
                          en: 'trada Vecchia 12, 39022 Merano, South Tyrol (I)',
                          it: 'Strada Vecchia 12, 39022 Merano, Alto Adige (I)',
                        },
                        phone: {
                          de: '+39 0473 861600',
                          it: '+39 0473 861600',
                          en: '+39 0473 861600',
                        },
                        web: {
                          de: 'www.villaverde-meran.com/',
                          it: 'www.villaverde-meran.com/',
                          en: 'www.villaverde-meran.com/',
                        },
                        email: {
                          de: 'info@villaverde-meran.com',
                          en: 'info@villaverde-meran.com',
                          it: 'info@villaverde-meran.com',
                        },
                      },
                    ],
                  },
                ],
                images: [
                  {
                    logo: 'https://www.villaverde-aparthotel.it/fileadmin/images/logo-villaverde.png',
                    header: [
                      //multiple image selection per template
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_1.jpg' },
                      { fileName: 'Wertgutschein_(2).jpg' },
                      { fileName: 'Wertgutschein_(3).jpg' },
                      { fileName: 'Wertgutschein_(4).jpg' },
                      { fileName: 'Wertgutschein_(5).jpg' },
                      { fileName: 'Wertgutschein_(6).jpg' },
                      { fileName: 'Wertgutschein_(7).jpg' },
                      { fileName: 'Services_Spa_Gutschein' },
                      { fileName: 'Services_Spa_Gutschein_1' },
                      { fileName: 'Services_Spa_Gutschein_2' },
                      { fileName: 'Wertgutschein1.jpg' },
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_2.jpg' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: {
              de: 'Services',
              it: 'Services',
              en: 'Services',
            },
            slug: 'services',
            code: 'V_SERVICES',
            linkText: {
              de: 'Services',
              it: 'Services',
              en: 'Services',
            },
            validDays: 365,
            image: [
              {
                width: 640,
                height: 540,
                fileName: '_V_SERVICES.png',
              },
            ],
            type: 'voucher',
            options: [
              {
                createTitle: {
                  de: 'Service-Gutschein erstellen',
                  it: 'Creare un voucher di servizio',
                  en: 'Create a sevice voucher',
                },
                editTitle: {
                  de: 'Service-Gutschein bearbeiten',
                  it: 'Modifica un voucher di servizio',
                  en: 'Change a service voucher',
                },
                minAmount: 0,
              },
            ],
            serviceGroups: [
              {
                title: {
                  de: 'Service',
                  it: 'Service',
                  en: 'Service',
                  fr: 'Service',
                },
                categories: [{ categoryName: 'V_SERVICES' }],
              },
            ],
            templates: [
              // multiple templates possible
              {
                // labels: - if there are fixed texts
                component: '',
                format: 'portrait',
                labels: [
                  {
                    title: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                    },
                    voucher: {
                      de: 'Gutschein',
                      it: 'Voucher',
                      en: 'Voucher',
                    },
                    orderNo: {
                      de: 'Bestellnummer',
                      it: "Numero d'ordine",
                      en: 'Order number',
                    },
                    validFrom: {
                      de: 'Ausgestellt',
                      it: 'Data di emissione',
                      en: 'Date of issue',
                    },
                    validTo: {
                      de: 'Einzulösen',
                      it: 'Da riscattare entro',
                      en: 'Valid until',
                    },
                    footer: [
                      {
                        name: {
                          en: 'Aparthotel VillaVerde',
                          de: 'Aparthotel VillaVerde',
                          it: 'Aparthotel VillaVerde',
                        },
                        address: {
                          de: 'Alte Landstraße 12, 39022 Meran, Südtirol (I)',
                          en: 'trada Vecchia 12, 39022 Merano, South Tyrol (I)',
                          it: 'Strada Vecchia 12, 39022 Merano, Alto Adige (I)',
                        },
                        phone: {
                          de: '+39 0473 861600',
                          it: '+39 0473 861600',
                          en: '+39 0473 861600',
                        },
                        web: {
                          de: 'www.villaverde-meran.com/',
                          it: 'www.villaverde-meran.com/',
                          en: 'www.villaverde-meran.com/',
                        },
                        email: {
                          de: 'info@villaverde-meran.com',
                          en: 'info@villaverde-meran.com',
                          it: 'info@villaverde-meran.com',
                        },
                      },
                    ],
                  },
                ],
                images: [
                  {
                    logo: 'https://www.villaverde-aparthotel.it/fileadmin/images/logo-villaverde.png',
                    header: [
                      //multiple image selection per template
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_1.jpg' },
                      { fileName: 'Wertgutschein_(2).jpg' },
                      { fileName: 'Wertgutschein_(3).jpg' },
                      { fileName: 'Wertgutschein_(4).jpg' },
                      { fileName: 'Wertgutschein_(5).jpg' },
                      { fileName: 'Wertgutschein_(6).jpg' },
                      { fileName: 'Wertgutschein_(7).jpg' },
                      { fileName: 'Services_Spa_Gutschein' },
                      { fileName: 'Services_Spa_Gutschein_1' },
                      { fileName: 'Services_Spa_Gutschein_2' },
                      { fileName: 'Wertgutschein1.jpg' },
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_2.jpg' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        labels: [
          {
            App: [
              {
                reallyDeleteVoucher: {
                  de: 'Wollen Sie den Gutschein wirklich löschen?',
                  it: 'Sei sicuro di voler cancellare il voucher?',
                  en: 'Are you sure you want to delete your voucher?',
                },
                reallyDeleteAppointment: {
                  de: 'Wollen Sie den Termin wirklich löschen?',
                  it: "Sei sicuro di voler disdire l'appuntamento?",
                  en: 'Are you sure you want to cancel your appointment?',
                },
              },
            ],
            IntroText: [
              {
                title: {
                  de: 'Freude schenken',
                  it: 'Regalare un sorriso',
                  en: 'Giving Joy',
                },
                description: {
                  de: 'Sie möchten einem lieben Menschen etwas Besonderes schenken? Eine kleine Auszeit vom Alltag? Dann sind unsere Geschenk-Gutscheine das Richtige für Sie! Einfach online bezahlen und der Gutschein wird per E-Mail zugeschickt. Bei Fragen und Sonderwünschen sind wir gerne behilflich!',
                  it: 'Sta cercando un regalo speciale per una persona cara? Una piccola pausa dalla vita di tutti i giorni? Allora i nostri buoni regalo sono la cosa giusta per Voi! Basta pagare online e il buono sarà inviato via e-mail. Siamo felici di aiutare con domande e richieste speciali!',
                  en: 'Would you like to give something special to someone you love? A little break from everyday life? Then our gift vouchers are the right thing for you! Simply pay online and the voucher will be sent to you by email. We are happy to help with questions and special requests!',
                },
              },
            ],
            //Modals - should be extended with external link function
            Shipment: [
              {
                title: {
                  de: 'Versandkosten',
                  it: 'Costi di spedizione',
                  en: 'Shipping costs',
                },
                description: {
                  de: `<b>E-Mail Versand</b><br><br> Wenn sie sich für die Versandart Gutschein per E-Mail (Print at home) entschieden haben entstehen keine Kosten. Sie oder ihr Beschenkter erhalten den Gutschein per E-Mail im .pdf Format zum speichern oder ausdrucken. Es entstehen keine Kosten.
        <br><br>

        <b>Post Versand</b><br><br> Wenn sie sich für die Versandart per Post entscheiden, übernimmt das Aparthotel VillaVerde die Kosten. Der Gutschein Empfänger erhält einen exklusiv verpackten Gutschein. Bitte beachten Sie, dass wir keine Haftung für den rechtzeitigen Empfang des Gutscheins übernehmen. Wir versenden die Gutscheine innerhalb 2 Werktage. Rechnen Sie bei der Bestellung per Post genügend Versandzeit der Post ein.`,
                  it: '',
                  en: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Colophon',
                  en: 'Imprint text',
                },
                link: {
                  de: '/de/servicenavigation/impressum',
                  it: '/it/servicenavigation/colophon',
                  en: '/en/servicenavigation/colophon',
                },
              },
            ],
            Privacy: [
              {
                title: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Privacy',
                },
                description: {
                  de: 'Datenschutz- und Privacy',
                  it: 'Protezione dei dati e privacy',
                  en: 'Data protection and privacy',
                },
              },
            ],
            Tos: [
              {
                title: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                },
                description: {
                  de: `<b>Allgemeine Geschäftsbedingungen</b>
        <br>
        <br>
        <b>Kauf- und Lieferbedingungen</b>
        <br>
        <br>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.
        <br>
        <br>

        <b>Bestellung</b>
        <br>
        <br>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.villaverde-meran.com und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die VillaVerde GmbH haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der VillaVerde GmbH rückerstattet werden.
        <br>
        <br>

        Jeder Gutschein kann nur einmal eingelöst werden.
        <br>
        <br>

        <b>Mindestalter</b>
        <br>
        <br>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.
        <br>
        <br>

        <b>Preise und Produkte</b>
        <br>
        <br>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.
        <br>
        <br>

        <b>Rücktrittsrecht</b>
        <br>
        <br>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <br>
        <br>
        <b>Sicherheitsgarantie & Datenschutz</b>
        <br>
        <br>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        <br>
        <br>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die VillaVerde GmbH, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                  it: '',
                  en: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Informazione legale',
                  en: 'Legal information',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Informazione legale',
                  en: 'Legal information',
                },
              },
            ],
            Contact: [
              {
                title: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                },
                submit: {
                  de: 'Senden',
                  it: 'Invia',
                  en: 'Send',
                },
                sentMail: {
                  de: 'Danke',
                  it: 'Grazie',
                  en: 'Thank you',
                },
                subject: {
                  de: 'V-MTS | Kontakt',
                  it: 'V-MTS | Contatto',
                  en: 'V-MTS | Contact',
                },
              },
            ],
            ContactForm: [
              {
                subject: {
                  de: 'Betreff',
                  it: 'Soggetto',
                  en: 'Subject',
                },
                name: {
                  de: 'Ihr Name',
                  it: 'Il tuo nome',
                  en: 'Your name',
                },
              },
            ],
            BasketItemVoucher: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                },
                quantity: {
                  de: 'Anzahl',
                  it: 'Quantità',
                  en: 'Quantity',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                },
              },
            ],
            BasketItemAppointment: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                },
                myself: {
                  de: 'Ich selbst',
                  it: 'Me stesso',
                  en: 'Myself',
                },
                service: {
                  de: 'Service',
                  it: 'Service',
                  en: 'Service',
                },
                appointments: {
                  de: 'Termine',
                  it: 'Appuntamenti',
                  en: 'Appointments',
                },
                persons: {
                  de: 'Pers.',
                  it: 'pers.',
                  en: 'pers.',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                },
              },
            ],
            Basket: [
              {
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti per servizi',
                  en: 'Service appointments',
                },
                title: {
                  de: 'Ihr Warenkorb',
                  it: 'Il Suo carrello',
                  en: 'Your basket',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Importo totale',
                  en: 'Total',
                },
                continue: {
                  de: 'Weiterstöbern',
                  it: 'Continua navigare',
                  en: 'Continue shopping',
                },
                checkout: {
                  de: 'Zur Kassa',
                  it: 'Procedi al pagamento',
                  en: 'Proceed with payment',
                },
              },
            ],
            FooterMenu: [
              {
                shipment: {
                  de: 'Versandkosten',
                  it: "Costi d'invio",
                  en: 'Delivery charges',
                },
                privacy: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Data protection',
                },
                //when any of the keys with suffix "Link" is provided the footer menu links to external urls opening in new tab
                privacyLink: {
                  de: '/de/privacy/',
                  it: '/it/privacy/',
                  en: '/en/privacy/',
                },
                tos: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                },
                tosTemplate: {
                  de: `<h2>Allgemeine Geschäftsbedingungen</h2>
        <b>Kauf- und Lieferbedingungen</b>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.

        <b>Bestellung</b>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.villaverde-meran.com und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die VillaVerde GmbH haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der VillaVerde GmbH rückerstattet werden.

        Jeder Gutschein kann nur einmal eingelöst werden.

        <b>Mindestalter</b>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.

        <b>Preise und Produkte</b>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.

        <b>Rücktrittsrecht</b>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <b>Sicherheitsgarantie & Datenschutz</b>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die VillaVerde GmbH, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                },
                colophon: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                },
                colophonLink: {
                  de: '/de/impressum',
                  it: '/it/colophon',
                  en: '/en/imprint',
                },
                contact: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                },
              },
            ],
            Thankyou: [
              {
                title: {
                  de: 'Danke für Ihren Einkauf',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                },
                description: {
                  de: 'Danke für Ihren Einkauf.',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                },
              },
            ],
            Categories: [
              {
                title: {
                  de: 'Wählen Sie bitte aus:',
                  it: 'Scegliere',
                  en: 'Please select',
                },
              },
            ],
            Voucher: [
              {
                createVoucher: {
                  de: 'Wertgutschein erstellen',
                  it: 'Creare un vuocher di valore',
                  en: 'Value voucher',
                },
                editVoucher: {
                  de: 'Wertgutschein bearbeiten',
                  it: 'Modifica voucher di valore',
                  en: 'Change value voucher',
                },
                quantity: {
                  de: 'Anzahl Gutscheine',
                  it: 'Quantita voucher',
                  en: 'Voucher quantity',
                },
                persons: {
                  de: 'Personen',
                  it: 'Persone',
                  en: 'Persons',
                },
                value: {
                  de: 'Wert:',
                  it: 'Valore',
                  en: 'Value',
                },
                voucherValue: {
                  de: 'Gutscheinwert',
                  it: 'Valore del voucher',
                  en: 'Amount of voucher',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                },
                dear: {
                  de: 'Lieber',
                  it: 'Egregio/Gentile',
                  en: 'Dear',
                },
                recipientName: {
                  de: 'Empfängername',
                  it: 'Nome del destinatario',
                  en: 'Name of the recipient',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                },
                sendVia: {
                  de: 'Senden Via',
                  it: 'Invia tramite',
                  en: 'Send by',
                },
                optionEmail: {
                  de: 'E-Mail',
                  it: 'posta elettronica',
                  en: 'email',
                },
                optionMail: {
                  de: 'Post',
                  it: 'Posta ordinaria',
                  en: 'mailing route',
                },
                sendToMe: {
                  de: 'an mich senden',
                  it: 'invia a me',
                  en: 'sent to myself',
                },
                sendToOther: {
                  de: 'an jemand anderen senden',
                  it: "invia a un'altra persona",
                  en: 'send to someone else',
                },
                recipientEmail: {
                  de: 'E-Mail-Adresse des Empfängers',
                  it: 'Indirizzo email del destinatario',
                  en: 'Email address of the recipient',
                },
                addressPlaceHolder: {
                  de: 'Straße, Platz + Nr',
                  it: 'Via, Piazza + Nr',
                  en: 'Street, place + no',
                },
                address: {
                  de: 'Adresse',
                  it: 'Indirizzo',
                  en: 'Address',
                },
                zipPlaceHolder: {
                  de: 'PlZ',
                  it: 'CAP',
                  en: 'ZIP',
                },
                zip: {
                  de: 'Postleitzahl',
                  it: 'Codice avviamento postale',
                  en: 'postcode',
                },
                placePlaceHolder: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                },
                saveChanges: {
                  de: 'Änderungen speichern',
                  it: 'Salva modifiche',
                  en: 'Save changes',
                },
                addToBasket: {
                  de: 'Hinzufügen zum Warenkorb',
                  it: 'Aggiungi al carrello',
                  en: 'Add to the basket',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                },
                serviceSelection: {
                  de: 'Leistungsauswahl',
                  it: 'Selezione dei servizi',
                  en: 'Selection of services',
                },
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                },
              },
            ],
            Appointment: [
              {
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                },
                createServiceAppointment: {
                  de: 'SPA-Termin vormerken',
                  it: 'Prenotare appuntamento SPA',
                  en: 'Make a SPA appointment',
                },
              },
            ],
            Template: [
              {
                serviceTitle: {
                  de: 'Leistungen',
                  it: 'Servizi',
                  en: 'Services',
                },
              },
            ],
            Checkout: [
              {
                title: {
                  de: 'Kassa',
                  it: 'Cassa',
                  en: 'Checkout',
                },
                paynow: {
                  de: 'Gutscheine bezahlen',
                  it: 'Pagamento del voucher',
                  en: 'Voucher payment',
                },
                requestnow: {
                  de: 'Termine anfragen',
                  it: 'Richiedere un appuntamento',
                  en: 'Request an appointment',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                },
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti servizio',
                  en: 'Service appointments',
                },
                personalData: {
                  de: 'Ihre Daten',
                  it: 'I suoi dati',
                  en: 'Your data',
                },
                appointmentNotice: {
                  de: 'Terminvereinbarungen müssen vom Hotel bestätigt werden und werden vor Ort bezahlt, sobald ein Termin wahrgenommen wird.',
                  it: 'Appuntamenti devono essere confermati dal nostro hotel e sono pagati direttamente sul posto',
                  en: 'Appointments need to be confirmed by our hotel and are paid on site at the time of your appointment',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Totale',
                  en: 'Total',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                },
                salutationOptions: {
                  de: ['Herr', 'Frau', 'Familie'],
                  it: ['Signor', 'Signora', 'Famiglia'],
                  en: ['Mr.', 'Mrs.', 'Family'],
                },
                title: {
                  de: 'Titel',
                  it: 'Titolo',
                  en: 'Title',
                },
                firstName: {
                  de: 'Vorname',
                  it: 'Nome',
                  en: 'first name',
                },
                lastName: {
                  de: 'Nachname',
                  it: 'Cognome',
                  en: 'last name',
                },
                phone: {
                  de: 'Telefon',
                  it: 'Telefono',
                  en: 'Phone',
                },
                email: {
                  de: 'E-Mail-Adresse',
                  it: 'Indirizzo email',
                  en: 'Email address',
                },
                emailConfirm: {
                  de: 'E-Mail-Adresse bestätigen',
                  it: 'Conferma indirizzo email',
                  en: 'Confirm email address',
                },
                sendInvoice: {
                  de: 'Schicken Sie mir eine Rechnung',
                  it: 'Richiesta fattura',
                  en: 'Please send me an invoice',
                },
                streetNo: {
                  de: 'Straße / Nr.',
                  it: 'Via / n°',
                  en: 'Street / n°',
                },
                zip: {
                  de: 'PLZ',
                  it: 'CAP',
                  en: 'ZIP',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                },
                company: {
                  de: 'Firma',
                  it: 'Ditta',
                  en: 'Company',
                },
                vatId: {
                  de: 'MwSt.Nr.',
                  it: 'Partita IVA',
                  en: 'VAT number',
                },
                invoice: {
                  de: 'Bitte schicken Sie mir eine Rechnung',
                  it: 'Richiesta invio fattura',
                  en: 'Please send me an invoice',
                },
                acceptPrivacy: {
                  de: 'Ich akzeptiere die Datenschutzvereinbarung und erkläre mich mit der Speicherung meiner Daten zur Bestellabwicklung einverstanden.',
                  it: "Accetto le norme in materia di protezione dei dati e l'uso dei miei dati personali per lo svolgimento dell'ordine.",
                  en: 'I agree on privacy policy and the use of my personal data for this purchase.',
                },
                sameForBilling: {
                  de: 'Rechnungsadresse entspricht der obigen',
                  it: 'Indirizzio di fatturazione sorrisponde a quello sopra indicato',
                  en: 'Billing address corresponds to the one indicated above',
                },
                pecEmail: {
                  de: 'PEC E-Mail-Adresse',
                  it: 'Indirizzo email PEC',
                  en: 'PEC email address',
                },
                sdiCode: {
                  de: 'SDI-Code',
                  it: 'Codice SDI',
                  en: 'SDI code',
                },
                emailSubjectSentToMe: {
                  de: 'Gutschein vom Aparthotel VillaVerde',
                  it: 'Voucher dall’Hotel VillaVerde',
                  en: 'Voucher of the Aparthotel VillaVerde',
                },
                emailTemplateSentToMe: {
                  de: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>vielen Dank, dass Sie sich für einen Gutschein bei uns im Haus entschieden haben.</p>\
            <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
            Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
            <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
            <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
                  it: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per il nostro hotel.</p>\
            <p>In allegato trova il voucher in formato pdf. Il voucher è stato registrato presso la nostra reception.<br>\
              Può stamparlo oppure riscattare il voucher via smartphone direttamente presso la nostra reception.<p> \
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
                  en: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing our hotel for purchasing a voucher.</p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at our reception.<br>\
              You can either print the voucher, or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Aparthotel VillaVerde</em><p>',
                },
                emailSubjectConfirmToMe: {
                  de: 'Gutschein von {{ firstname }} {{ lastname }} für {{ name }} vom Aparthotel VillaVerde',
                  it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per {{ name }} per l’ Aparthotel VillaVerde',
                  en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Aparthotel VillaVerde',
                },
                emailTemplateConfirmToMe: {
                  de: '<p>{{ firstname }} {{ lastname }},</p>\
             <p>vielen Dank, dass Sie sich für einen Gutschein für {{ name }} bei uns im Haus entschieden haben.</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an {{ name }} gesandt und an unserer Rezeption registriert.<br>\
             Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
                  it: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per {{ name }} per il nostro hotel.</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato inviato a {{ name }} e registrato presso la nostra reception.<br>\
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
                  en: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing a voucher for {{ name }} for our hotel.</p> \
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been sent to {{ name }} and registered at the reception.<br>\
            You can either print the voucher or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Aparthotel VillaVerde </em></p>',
                },
                emailSubjectSentToOther: {
                  de: 'Gutschein von {{ firstname }} {{ lastname }} vom Aparthotel VillaVerde',
                  it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per l’ Aparthotel VillaVerde',
                  en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Aparthotel VillaVerde',
                },
                emailTemplateSentToOther: {
                  de: '<p>{{ name }},</p>\
             <p>für Sie wurde von {{ firstname }} {{ lastname }} ein Gutschein bei uns im Haus hinterlegt:</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
             Sie können den Gutschein Ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
                  it: '<p>{{ name }},</p>\
            <p>{{ firstname }} {{ lastname }} ha acquistato un voucher per il nostro hotel per Lei:</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato registrato presso la nostra reception.<br> \
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura. </p>\
            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
                  en: '<p>{{ name }},</p>\
            <p>a voucher purchased by {{ firstname }} {{ lastname }} has been registered at our hotel:</p>\
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at the reception.<br>\
            You can either print this voucher or redeem it by smartphone directly at the reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours, sincerely</p>\
            <p><em>The team of Aparthotel VillaVerde</em></p>',
                },
              },
            ],
            PaymentFailed: [
              {
                title: {
                  de: 'Zahlung fehlgeschlagen',
                  it: 'Pagamento fallito',
                  en: 'Payment failed',
                },
                description: {
                  de: 'Lieber {name}, d.',
                  it: 'Caro/a {name}',
                  en: 'Dear {name}',
                },
              },
            ],
            PageNotFound: [
              {
                title: {
                  de: 'Seite nicht gefunden',
                  it: 'Pagina non trovata',
                  en: 'Page not found',
                },
                description: {
                  de: 'Die angegebene Adresse entspricht keiner bekannten Seite.',
                  it: `L'indirizzo indicato non corrisponde a nessun sito raggiungibile`,
                  en: 'The indicated address does not match any common site',
                },
                backToStart: {
                  de: 'Zurück zur Startseite',
                  it: 'Torna alla pagina inizale',
                  en: 'Back to the homepage',
                },
              },
            ],
          },
        ],
      },
    },
  ],
}

const vmtsConfigVillaVerde2 = {
  _id: '2v1mk93fAD',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'Gutscheine schenken',
  pages: [],
  fonts: [
    // {
    //   name: 'BodoniSvtyTwoITCTT-Book',
    //   url: 'https://www.villaverde-meran.com/site/templates/fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff',
    //   fontFace:
    //     '@font-face { font-family: "BodoniSvtyTwoITCTT-Book"; src: url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.eot") format("eot"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.ttf") format("ttf"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff") format("woff"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    // },
    // {
    //   name: 'SaveurSans-Regular',
    //   url: 'https://www.villaverde-meran.com/site/templates/fonts/SaveurSans-Regular/SaveurSans-Regular.woff',
    //   fontFace:
    //     '@font-face { font-family: "SaveurSans-Regular"; src: url("../fonts/SaveurSans-Regular/SaveurSans-Regular.eot") format("eot"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.ttf") format("ttf"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.woff") format("woff"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    // },
    // {
    //   name: 'BodoniLTPro',
    //   url: 'https://www.villaverde-meran.com/site/templates/fonts/BodoniLTPro/BodoniLTPro.woff',
    //   fontFace:
    //     '@font-face { font-family: "BodoniLTPro"; src: url("../fonts/BodoniLTPro/BodoniLTPro.eot") format("eot"), url("../fonts/BodoniLTPro/BodoniLTPro.ttf") format("ttf"), url("../fonts/BodoniLTPro/BodoniLTPro.woff") format("woff"), url("../fonts/BodoniLTPro/BodoniLTPro.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    // },
  ],
  styles: {
    'fontFamily-body': '"BodoniSvtyTwoITCTT-Book", sans-serif',
    'fontFamily-subHeading': '"SaveurSans-Regular", sans-serif',
    'fontFamily-heading': '"BodoniLTPro", serif',
    'fontFamily-button': '"SaveurSans-Regular", sans-serif',
    'fontSize-max': '24px',
    'fontSize-min': '17px',
    'fontSize-heading-max': '76.8px',
    'fontSize-heading-min': '25.5px',
    'fontSize-subHeading-max': '28.8px',
    'fontSize-subHeading-min': '17.51px',
    'fontSize-button-max': '24px',
    'fontSize-button-min': '14.96px',
    'lineHeight-body': '1.2',
    'fontWeight-heading': 400,
    'fontWeight-body': 400,
    // 'backgroundColor-primary': 'transparent',
    'backgroundColor-primary': '#d2e4d8',
    'backgroundColor-light': '#d2e4d8',
    'color-primary': '#2f1e19',
    'color-secondary': '#307e80',
    'color-light': '#d2e3d8',
    'color-button-hover': '#2f1e19',
    'backgroundColor-button': '#d2e4d8',
    'backgroundColor-button-hover': '#d2e4d8',
    // 'padding-button': '.5em 1em',
    'viewPort-min': '640px',
    'viewPort-max': '1800px',
    'borderColor-button-hover': '#2f1e19',
    'textTransform-title': 'uppercase',
    'textTransform-heading': 'uppercase',
    'textTransform-subTitle': 'uppercase',
    'textTransform-subHeading': 'uppercase',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '.7',
    // breakpoints: [
    //   {
    //     min: '400px',
    //     max: '900px',
    //     styles: {
    //       'color-button': 'red',
    //     },
    //   },
    // ],
  },
  components: [
    {
      _id: '8lY6k9n8KF',
      name: 'Voucher-mts',
      component: 'Vmts',
      // component: 'WidgetVmts1',
      category: 'widget',
      status: true,
      version: '1',
      blockProps: {
        clientId: 'u1065',
        hotelId: 'S003787', //needed to load the images with kognitiv-loader
        paymentMethod: 'hobex',
        contactTemplate: `<h2>New message from V-MTS contact form</h2>
        <h3>{{ subject }}</h3>
        <p>{{ message }}</p>
        <h3>Contact Details</h3>
        <ul>
        <li>Name: {{ name }}</li>
        <li>Email: {{ email }}</li>
        </ul>`,
        categories: [
          {
            title: {
              de: 'Wertgutschein',
              it: 'Buono valore',
              en: 'Value voucher',
            },
            slug: 'value-voucher',
            // priceText: "ab 10 €",
            code: 'V_VOUCHER',
            linkText: {
              de: 'Gutschein erstellen',
              it: 'Create il Vostro voucher individuale',
              en: 'Create a voucher',
            },
            // description: "Erstellen Sie hier Ihren Gutschein",
            validDays: 365,
            image: [
              {
                width: 640,
                height: 540,
                fileName: '_V_VOUCHER.png',
              },
            ],
            type: 'voucher',
            options: [
              {
                minAmount: 10,
                maxAmount: 10000,
                maxQuantity: 100,
              },
            ],
            templates: [
              // multiple templates possible
              {
                // labels: - if there are fixed texts
                component: '',
                format: 'portrait',
                labels: [
                  {
                    title: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                    },
                    voucher: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                    },
                    orderNo: {
                      de: 'Bestellnummer',
                      en: 'Order number',
                      it: "Numero d'ordine",
                    },
                    validFrom: {
                      de: 'Ausgestellt',
                      en: 'date of issue',
                      it: 'data di emissione',
                    },
                    validTo: {
                      de: 'Einzulösen',
                      en: 'Valid until',
                      it: 'Da riscattare entro',
                    },
                    footer: [
                      {
                        name: {
                          en: 'Aparthotel VillaVerde',
                          de: 'Aparthotel VillaVerde',
                          it: 'Aparthotel VillaVerde',
                        },
                        address: {
                          de: 'Alte Landstraße 12, 39022 Meran, Südtirol (I)',
                          en: 'trada Vecchia 12, 39022 Merano, South Tyrol (I)',
                          it: 'Strada Vecchia 12, 39022 Merano, Alto Adige (I)',
                        },
                        phone: {
                          de: '+39 0473 861600',
                          it: '+39 0473 861600',
                          en: '+39 0473 861600',
                        },
                        web: {
                          de: 'www.villaverde-meran.com/',
                          it: 'www.villaverde-meran.com/',
                          en: 'www.villaverde-meran.com/',
                        },
                        email: {
                          de: 'info@villaverde-meran.com',
                          en: 'info@villaverde-meran.com',
                          it: 'info@villaverde-meran.com',
                        },
                      },
                    ],
                  },
                ],
                images: [
                  {
                    logo: 'https://www.villaverde-aparthotel.it/fileadmin/images/logo-villaverde.png',
                    header: [
                      //multiple image selection per template
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_1.jpg' },
                      { fileName: 'Wertgutschein_(2).jpg' },
                      { fileName: 'Wertgutschein_(3).jpg' },
                      { fileName: 'Wertgutschein_(4).jpg' },
                      { fileName: 'Wertgutschein_(5).jpg' },
                      { fileName: 'Wertgutschein_(6).jpg' },
                      { fileName: 'Wertgutschein_(7).jpg' },
                      { fileName: 'Services_Spa_Gutschein' },
                      { fileName: 'Services_Spa_Gutschein_1' },
                      { fileName: 'Services_Spa_Gutschein_2' },
                      { fileName: 'Wertgutschein1.jpg' },
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_2.jpg' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: {
              de: 'Services',
              it: 'Services',
              en: 'Services',
            },
            slug: 'services',
            code: 'V_SERVICES',
            linkText: {
              de: 'Services',
              it: 'Services',
              en: 'Services',
            },
            validDays: 365,
            image: [
              {
                width: 640,
                height: 540,
                fileName: '_V_SERVICES.png',
              },
            ],
            type: 'voucher',
            options: [
              {
                createTitle: {
                  de: 'Service-Gutschein erstellen',
                  it: 'Creare un voucher di servizio',
                  en: 'Create a sevice voucher',
                },
                editTitle: {
                  de: 'Service-Gutschein bearbeiten',
                  it: 'Modifica un voucher di servizio',
                  en: 'Change a service voucher',
                },
                minAmount: 0,
              },
            ],
            serviceGroups: [
              {
                title: {
                  de: 'Service',
                  it: 'Service',
                  en: 'Service',
                  fr: 'Service',
                },
                categories: [{ categoryName: 'V_SERVICES' }],
              },
            ],
            templates: [
              // multiple templates possible
              {
                // labels: - if there are fixed texts
                component: '',
                format: 'portrait',
                labels: [
                  {
                    title: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                    },
                    voucher: {
                      de: 'Gutschein',
                      it: 'Voucher',
                      en: 'Voucher',
                    },
                    orderNo: {
                      de: 'Bestellnummer',
                      it: "Numero d'ordine",
                      en: 'Order number',
                    },
                    validFrom: {
                      de: 'Ausgestellt',
                      it: 'Data di emissione',
                      en: 'Date of issue',
                    },
                    validTo: {
                      de: 'Einzulösen',
                      it: 'Da riscattare entro',
                      en: 'Valid until',
                    },
                    footer: [
                      {
                        name: {
                          en: 'Aparthotel VillaVerde',
                          de: 'Aparthotel VillaVerde',
                          it: 'Aparthotel VillaVerde',
                        },
                        address: {
                          de: 'Alte Landstraße 12, 39022 Meran, Südtirol (I)',
                          en: 'trada Vecchia 12, 39022 Merano, South Tyrol (I)',
                          it: 'Strada Vecchia 12, 39022 Merano, Alto Adige (I)',
                        },
                        phone: {
                          de: '+39 0473 861600',
                          it: '+39 0473 861600',
                          en: '+39 0473 861600',
                        },
                        web: {
                          de: 'www.villaverde-meran.com/',
                          it: 'www.villaverde-meran.com/',
                          en: 'www.villaverde-meran.com/',
                        },
                        email: {
                          de: 'info@villaverde-meran.com',
                          en: 'info@villaverde-meran.com',
                          it: 'info@villaverde-meran.com',
                        },
                      },
                    ],
                  },
                ],
                images: [
                  {
                    logo: 'https://www.villaverde-aparthotel.it/fileadmin/images/logo-villaverde.png',
                    header: [
                      //multiple image selection per template
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_1.jpg' },
                      { fileName: 'Wertgutschein_(2).jpg' },
                      { fileName: 'Wertgutschein_(3).jpg' },
                      { fileName: 'Wertgutschein_(4).jpg' },
                      { fileName: 'Wertgutschein_(5).jpg' },
                      { fileName: 'Wertgutschein_(6).jpg' },
                      { fileName: 'Wertgutschein_(7).jpg' },
                      { fileName: 'Services_Spa_Gutschein' },
                      { fileName: 'Services_Spa_Gutschein_1' },
                      { fileName: 'Services_Spa_Gutschein_2' },
                      { fileName: 'Wertgutschein1.jpg' },
                      { fileName: 'Services_Fr%C3%BChst%C3%BCck_Gutschein_2.jpg' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        labels: [
          {
            App: [
              {
                reallyDeleteVoucher: {
                  de: 'Wollen Sie den Gutschein wirklich löschen?',
                  it: 'Sei sicuro di voler cancellare il voucher?',
                  en: 'Are you sure you want to delete your voucher?',
                },
                reallyDeleteAppointment: {
                  de: 'Wollen Sie den Termin wirklich löschen?',
                  it: "Sei sicuro di voler disdire l'appuntamento?",
                  en: 'Are you sure you want to cancel your appointment?',
                },
              },
            ],
            IntroText: [
              {
                title: {
                  de: 'Freude schenken',
                  it: 'Regalare un sorriso',
                  en: 'Giving Joy',
                },
                description: {
                  de: 'Sie möchten einem lieben Menschen etwas Besonderes schenken? Eine kleine Auszeit vom Alltag? Dann sind unsere Geschenk-Gutscheine das Richtige für Sie! Einfach online bezahlen und der Gutschein wird per E-Mail zugeschickt. Bei Fragen und Sonderwünschen sind wir gerne behilflich!',
                  it: 'Sta cercando un regalo speciale per una persona cara? Una piccola pausa dalla vita di tutti i giorni? Allora i nostri buoni regalo sono la cosa giusta per Voi! Basta pagare online e il buono sarà inviato via e-mail. Siamo felici di aiutare con domande e richieste speciali!',
                  en: 'Would you like to give something special to someone you love? A little break from everyday life? Then our gift vouchers are the right thing for you! Simply pay online and the voucher will be sent to you by email. We are happy to help with questions and special requests!',
                },
              },
            ],
            //Modals - should be extended with external link function
            Shipment: [
              {
                title: {
                  de: 'Versandkosten',
                  it: 'Costi di spedizione',
                  en: 'Shipping costs',
                },
                description: {
                  de: `<b>E-Mail Versand</b><br><br> Wenn sie sich für die Versandart Gutschein per E-Mail (Print at home) entschieden haben entstehen keine Kosten. Sie oder ihr Beschenkter erhalten den Gutschein per E-Mail im .pdf Format zum speichern oder ausdrucken. Es entstehen keine Kosten.
        <br><br>

        <b>Post Versand</b><br><br> Wenn sie sich für die Versandart per Post entscheiden, übernimmt das Aparthotel VillaVerde die Kosten. Der Gutschein Empfänger erhält einen exklusiv verpackten Gutschein. Bitte beachten Sie, dass wir keine Haftung für den rechtzeitigen Empfang des Gutscheins übernehmen. Wir versenden die Gutscheine innerhalb 2 Werktage. Rechnen Sie bei der Bestellung per Post genügend Versandzeit der Post ein.`,
                  it: '',
                  en: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Colophon',
                  en: 'Imprint text',
                },
                link: {
                  de: '/de/servicenavigation/impressum',
                  it: '/it/servicenavigation/colophon',
                  en: '/en/servicenavigation/colophon',
                },
              },
            ],
            Privacy: [
              {
                title: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Privacy',
                },
                description: {
                  de: 'Datenschutz- und Privacy',
                  it: 'Protezione dei dati e privacy',
                  en: 'Data protection and privacy',
                },
              },
            ],
            Tos: [
              {
                title: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                },
                description: {
                  de: `<b>Allgemeine Geschäftsbedingungen</b>
        <br>
        <br>
        <b>Kauf- und Lieferbedingungen</b>
        <br>
        <br>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.
        <br>
        <br>

        <b>Bestellung</b>
        <br>
        <br>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.villaverde-meran.com und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die VillaVerde GmbH haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der VillaVerde GmbH rückerstattet werden.
        <br>
        <br>

        Jeder Gutschein kann nur einmal eingelöst werden.
        <br>
        <br>

        <b>Mindestalter</b>
        <br>
        <br>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.
        <br>
        <br>

        <b>Preise und Produkte</b>
        <br>
        <br>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.
        <br>
        <br>

        <b>Rücktrittsrecht</b>
        <br>
        <br>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <br>
        <br>
        <b>Sicherheitsgarantie & Datenschutz</b>
        <br>
        <br>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        <br>
        <br>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die VillaVerde GmbH, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                  it: '',
                  en: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Informazione legale',
                  en: 'Legal information',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Informazione legale',
                  en: 'Legal information',
                },
              },
            ],
            Contact: [
              {
                title: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                },
                submit: {
                  de: 'Senden',
                  it: 'Invia',
                  en: 'Send',
                },
                sentMail: {
                  de: 'Danke',
                  it: 'Grazie',
                  en: 'Thank you',
                },
                subject: {
                  de: 'V-MTS | Kontakt',
                  it: 'V-MTS | Contatto',
                  en: 'V-MTS | Contact',
                },
              },
            ],
            ContactForm: [
              {
                subject: {
                  de: 'Betreff',
                  it: 'Soggetto',
                  en: 'Subject',
                },
                name: {
                  de: 'Ihr Name',
                  it: 'Il tuo nome',
                  en: 'Your name',
                },
              },
            ],
            BasketItemVoucher: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                },
                quantity: {
                  de: 'Anzahl',
                  it: 'Quantità',
                  en: 'Quantity',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                },
              },
            ],
            BasketItemAppointment: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                },
                myself: {
                  de: 'Ich selbst',
                  it: 'Me stesso',
                  en: 'Myself',
                },
                service: {
                  de: 'Service',
                  it: 'Service',
                  en: 'Service',
                },
                appointments: {
                  de: 'Termine',
                  it: 'Appuntamenti',
                  en: 'Appointments',
                },
                persons: {
                  de: 'Pers.',
                  it: 'pers.',
                  en: 'pers.',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                },
              },
            ],
            Basket: [
              {
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti per servizi',
                  en: 'Service appointments',
                },
                title: {
                  de: 'Ihr Warenkorb',
                  it: 'Il Suo carrello',
                  en: 'Your basket',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Importo totale',
                  en: 'Total',
                },
                continue: {
                  de: 'Weiterstöbern',
                  it: 'Continua navigare',
                  en: 'Continue shopping',
                },
                checkout: {
                  de: 'Zur Kassa',
                  it: 'Procedi al pagamento',
                  en: 'Proceed with payment',
                },
              },
            ],
            FooterMenu: [
              {
                shipment: {
                  de: 'Versandkosten',
                  it: "Costi d'invio",
                  en: 'Delivery charges',
                },
                privacy: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Data protection',
                },
                //when any of the keys with suffix "Link" is provided the footer menu links to external urls opening in new tab
                privacyLink: {
                  de: '/de/privacy/',
                  it: '/it/privacy/',
                  en: '/en/privacy/',
                },
                tos: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                },
                tosTemplate: {
                  de: `<h2>Allgemeine Geschäftsbedingungen</h2>
        <b>Kauf- und Lieferbedingungen</b>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.

        <b>Bestellung</b>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.villaverde-meran.com und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die VillaVerde GmbH haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der VillaVerde GmbH rückerstattet werden.

        Jeder Gutschein kann nur einmal eingelöst werden.

        <b>Mindestalter</b>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.

        <b>Preise und Produkte</b>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.

        <b>Rücktrittsrecht</b>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <b>Sicherheitsgarantie & Datenschutz</b>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die VillaVerde GmbH, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                },
                colophon: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                },
                colophonLink: {
                  de: '/de/impressum',
                  it: '/it/colophon',
                  en: '/en/imprint',
                },
                contact: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                },
              },
            ],
            Thankyou: [
              {
                title: {
                  de: 'Danke für Ihren Einkauf',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                },
                description: {
                  de: 'Danke für Ihren Einkauf.',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                },
              },
            ],
            Categories: [
              {
                title: {
                  de: 'Wählen Sie bitte aus:',
                  it: 'Scegliere',
                  en: 'Please select',
                },
              },
            ],
            Voucher: [
              {
                createVoucher: {
                  de: 'Wertgutschein erstellen',
                  it: 'Creare un vuocher di valore',
                  en: 'Value voucher',
                },
                editVoucher: {
                  de: 'Wertgutschein bearbeiten',
                  it: 'Modifica voucher di valore',
                  en: 'Change value voucher',
                },
                quantity: {
                  de: 'Anzahl Gutscheine',
                  it: 'Quantita voucher',
                  en: 'Voucher quantity',
                },
                persons: {
                  de: 'Personen',
                  it: 'Persone',
                  en: 'Persons',
                },
                value: {
                  de: 'Wert:',
                  it: 'Valore',
                  en: 'Value',
                },
                voucherValue: {
                  de: 'Gutscheinwert',
                  it: 'Valore del voucher',
                  en: 'Amount of voucher',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                },
                dear: {
                  de: 'Lieber',
                  it: 'Egregio/Gentile',
                  en: 'Dear',
                },
                recipientName: {
                  de: 'Empfängername',
                  it: 'Nome del destinatario',
                  en: 'Name of the recipient',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                },
                sendVia: {
                  de: 'Senden Via',
                  it: 'Invia tramite',
                  en: 'Send by',
                },
                optionEmail: {
                  de: 'E-Mail',
                  it: 'posta elettronica',
                  en: 'email',
                },
                optionMail: {
                  de: 'Post',
                  it: 'Posta ordinaria',
                  en: 'mailing route',
                },
                sendToMe: {
                  de: 'an mich senden',
                  it: 'invia a me',
                  en: 'sent to myself',
                },
                sendToOther: {
                  de: 'an jemand anderen senden',
                  it: "invia a un'altra persona",
                  en: 'send to someone else',
                },
                recipientEmail: {
                  de: 'E-Mail-Adresse des Empfängers',
                  it: 'Indirizzo email del destinatario',
                  en: 'Email address of the recipient',
                },
                addressPlaceHolder: {
                  de: 'Straße, Platz + Nr',
                  it: 'Via, Piazza + Nr',
                  en: 'Street, place + no',
                },
                address: {
                  de: 'Adresse',
                  it: 'Indirizzo',
                  en: 'Address',
                },
                zipPlaceHolder: {
                  de: 'PlZ',
                  it: 'CAP',
                  en: 'ZIP',
                },
                zip: {
                  de: 'Postleitzahl',
                  it: 'Codice avviamento postale',
                  en: 'postcode',
                },
                placePlaceHolder: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                },
                saveChanges: {
                  de: 'Änderungen speichern',
                  it: 'Salva modifiche',
                  en: 'Save changes',
                },
                addToBasket: {
                  de: 'Hinzufügen zum Warenkorb',
                  it: 'Aggiungi al carrello',
                  en: 'Add to the basket',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                },
                serviceSelection: {
                  de: 'Leistungsauswahl',
                  it: 'Selezione dei servizi',
                  en: 'Selection of services',
                },
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                },
              },
            ],
            Appointment: [
              {
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                },
                createServiceAppointment: {
                  de: 'SPA-Termin vormerken',
                  it: 'Prenotare appuntamento SPA',
                  en: 'Make a SPA appointment',
                },
              },
            ],
            Template: [
              {
                serviceTitle: {
                  de: 'Leistungen',
                  it: 'Servizi',
                  en: 'Services',
                },
              },
            ],
            Checkout: [
              {
                title: {
                  de: 'Kassa',
                  it: 'Cassa',
                  en: 'Checkout',
                },
                paynow: {
                  de: 'Gutscheine bezahlen',
                  it: 'Pagamento del voucher',
                  en: 'Voucher payment',
                },
                requestnow: {
                  de: 'Termine anfragen',
                  it: 'Richiedere un appuntamento',
                  en: 'Request an appointment',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                },
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti servizio',
                  en: 'Service appointments',
                },
                personalData: {
                  de: 'Ihre Daten',
                  it: 'I suoi dati',
                  en: 'Your data',
                },
                appointmentNotice: {
                  de: 'Terminvereinbarungen müssen vom Hotel bestätigt werden und werden vor Ort bezahlt, sobald ein Termin wahrgenommen wird.',
                  it: 'Appuntamenti devono essere confermati dal nostro hotel e sono pagati direttamente sul posto',
                  en: 'Appointments need to be confirmed by our hotel and are paid on site at the time of your appointment',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Totale',
                  en: 'Total',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                },
                salutationOptions: {
                  de: ['Herr', 'Frau', 'Familie'],
                  it: ['Signor', 'Signora', 'Famiglia'],
                  en: ['Mr.', 'Mrs.', 'Family'],
                },
                title: {
                  de: 'Titel',
                  it: 'Titolo',
                  en: 'Title',
                },
                firstName: {
                  de: 'Vorname',
                  it: 'Nome',
                  en: 'first name',
                },
                lastName: {
                  de: 'Nachname',
                  it: 'Cognome',
                  en: 'last name',
                },
                phone: {
                  de: 'Telefon',
                  it: 'Telefono',
                  en: 'Phone',
                },
                email: {
                  de: 'E-Mail-Adresse',
                  it: 'Indirizzo email',
                  en: 'Email address',
                },
                emailConfirm: {
                  de: 'E-Mail-Adresse bestätigen',
                  it: 'Conferma indirizzo email',
                  en: 'Confirm email address',
                },
                sendInvoice: {
                  de: 'Schicken Sie mir eine Rechnung',
                  it: 'Richiesta fattura',
                  en: 'Please send me an invoice',
                },
                streetNo: {
                  de: 'Straße / Nr.',
                  it: 'Via / n°',
                  en: 'Street / n°',
                },
                zip: {
                  de: 'PLZ',
                  it: 'CAP',
                  en: 'ZIP',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                },
                company: {
                  de: 'Firma',
                  it: 'Ditta',
                  en: 'Company',
                },
                vatId: {
                  de: 'MwSt.Nr.',
                  it: 'Partita IVA',
                  en: 'VAT number',
                },
                invoice: {
                  de: 'Bitte schicken Sie mir eine Rechnung',
                  it: 'Richiesta invio fattura',
                  en: 'Please send me an invoice',
                },
                acceptPrivacy: {
                  de: 'Ich akzeptiere die Datenschutzvereinbarung und erkläre mich mit der Speicherung meiner Daten zur Bestellabwicklung einverstanden.',
                  it: "Accetto le norme in materia di protezione dei dati e l'uso dei miei dati personali per lo svolgimento dell'ordine.",
                  en: 'I agree on privacy policy and the use of my personal data for this purchase.',
                },
                sameForBilling: {
                  de: 'Rechnungsadresse entspricht der obigen',
                  it: 'Indirizzio di fatturazione sorrisponde a quello sopra indicato',
                  en: 'Billing address corresponds to the one indicated above',
                },
                pecEmail: {
                  de: 'PEC E-Mail-Adresse',
                  it: 'Indirizzo email PEC',
                  en: 'PEC email address',
                },
                sdiCode: {
                  de: 'SDI-Code',
                  it: 'Codice SDI',
                  en: 'SDI code',
                },
                emailSubjectSentToMe: {
                  de: 'Gutschein vom Aparthotel VillaVerde',
                  it: 'Voucher dall’Hotel VillaVerde',
                  en: 'Voucher of the Aparthotel VillaVerde',
                },
                emailTemplateSentToMe: {
                  de: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>vielen Dank, dass Sie sich für einen Gutschein bei uns im Haus entschieden haben.</p>\
            <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
            Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
            <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
            <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
                  it: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per il nostro hotel.</p>\
            <p>In allegato trova il voucher in formato pdf. Il voucher è stato registrato presso la nostra reception.<br>\
              Può stamparlo oppure riscattare il voucher via smartphone direttamente presso la nostra reception.<p> \
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
                  en: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing our hotel for purchasing a voucher.</p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at our reception.<br>\
              You can either print the voucher, or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Aparthotel VillaVerde</em><p>',
                },
                emailSubjectConfirmToMe: {
                  de: 'Gutschein von {{ firstname }} {{ lastname }} für {{ name }} vom Aparthotel VillaVerde',
                  it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per {{ name }} per l’ Aparthotel VillaVerde',
                  en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Aparthotel VillaVerde',
                },
                emailTemplateConfirmToMe: {
                  de: '<p>{{ firstname }} {{ lastname }},</p>\
             <p>vielen Dank, dass Sie sich für einen Gutschein für {{ name }} bei uns im Haus entschieden haben.</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an {{ name }} gesandt und an unserer Rezeption registriert.<br>\
             Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
                  it: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per {{ name }} per il nostro hotel.</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato inviato a {{ name }} e registrato presso la nostra reception.<br>\
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
                  en: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing a voucher for {{ name }} for our hotel.</p> \
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been sent to {{ name }} and registered at the reception.<br>\
            You can either print the voucher or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Aparthotel VillaVerde </em></p>',
                },
                emailSubjectSentToOther: {
                  de: 'Gutschein von {{ firstname }} {{ lastname }} vom Aparthotel VillaVerde',
                  it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per l’ Aparthotel VillaVerde',
                  en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Aparthotel VillaVerde',
                },
                emailTemplateSentToOther: {
                  de: '<p>{{ name }},</p>\
             <p>für Sie wurde von {{ firstname }} {{ lastname }} ein Gutschein bei uns im Haus hinterlegt:</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
             Sie können den Gutschein Ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
                  it: '<p>{{ name }},</p>\
            <p>{{ firstname }} {{ lastname }} ha acquistato un voucher per il nostro hotel per Lei:</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato registrato presso la nostra reception.<br> \
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura. </p>\
            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
                  en: '<p>{{ name }},</p>\
            <p>a voucher purchased by {{ firstname }} {{ lastname }} has been registered at our hotel:</p>\
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at the reception.<br>\
            You can either print this voucher or redeem it by smartphone directly at the reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours, sincerely</p>\
            <p><em>The team of Aparthotel VillaVerde</em></p>',
                },
              },
            ],
            PaymentFailed: [
              {
                title: {
                  de: 'Zahlung fehlgeschlagen',
                  it: 'Pagamento fallito',
                  en: 'Payment failed',
                },
                description: {
                  de: 'Lieber {name}, d.',
                  it: 'Caro/a {name}',
                  en: 'Dear {name}',
                },
              },
            ],
            PageNotFound: [
              {
                title: {
                  de: 'Seite nicht gefunden',
                  it: 'Pagina non trovata',
                  en: 'Page not found',
                },
                description: {
                  de: 'Die angegebene Adresse entspricht keiner bekannten Seite.',
                  it: `L'indirizzo indicato non corrisponde a nessun sito raggiungibile`,
                  en: 'The indicated address does not match any common site',
                },
                backToStart: {
                  de: 'Zurück zur Startseite',
                  it: 'Torna alla pagina inizale',
                  en: 'Back to the homepage',
                },
              },
            ],
          },
        ],
      },
    },
  ],
}

const servicesConfigTratterhof = {
  _id: '2313k33fAD',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'Services',
  pages: [],
  fonts: [],
  styles: {
    maxWidth: '1920px',
    'fontFamily-body': '"Source Sans Pro", sans-serif',
    'fontFamily-subHeading': '"Source Sans Pro", sans-serif',
    'fontFamily-heading': '"Josefin Sans", sans-serif',
    'fontFamily-button': '"Josefin Sans", sans-serif',
    'fontSize-heading': '30px',
    'fontSize-base': '15px',
    'fontSize-subHeading-max': '28.8',
    'fontSize-subHeading-min': '17.51',
    'fontSize-button': '16px',
    'lineHeight-body': '1.2',
    'fontWeight-heading': '400',
    'fontWeight-body': '400',
    'backgroundColor-primary': '#F5F5F5',
    'backgroundColor-secondary': '#E6B222',
    'color-primary': '#6f5f51',
    'color-secondary': '#E6B222',
    'color-light': '#d2e3d8',
    'color-button': '#fff',
    'color-surface': '#fff',
    'color-button-hover': '#fff',
    'backgroundColor-button': '#E6B222',
    'backgroundColor-surface': '#fff',
    'backgroundColor-button-hover': '#e6b22a',
    'viewPort-min': '640px',
    'viewPort-max': '1920px',
    'borderColor-button': '#307e80',
    borderWidth: '1px',
    'borderWidth-button': '0',
    'borderRadius-button': '2em',
    'padding-button': '.5em',
    'borderColor-button-hover': '#2f1e19',
    'textTransform-title': 'uppercase',
    'textTransform-subTitle': 'uppercase',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '.9',
    breakpoints: [
      {
        min: '1px',
        max: '350px',
        styles: {
          'fontSize-heading': '16px',
          'fontSize-button': '9.6px',
        },
      },
      {
        min: '351px',
        max: '480px',
        styles: {
          'fontSize-heading': '18.016px',
          'fontSize-button': '10.8096px',
        },
      },
      {
        min: '481px',
        max: '767px',
        styles: {
          'fontSize-heading': '20px',
          'fontSize-button': '12px',
        },
      },
      {
        min: '768px',
        max: '1024px',
        styles: {
          'fontSize-heading': '25px',
          'fontSize-button': '14px',
        },
      },
      {
        min: '1025x',
        max: '1368px',
        styles: {
          'fontSize-heading': '24px',
          'fontSize-button': '12.8px',
        },
      },
      {
        min: '1369px',
        max: '1600px',
        styles: {
          'fontSize-heading': '27.024px',
          'fontSize-button': '14.4128px',
        },
      },
    ],
  },
  components: [
    {
      _id: '8lY6k9n8KF',
      name: 'services-mts',
      component: 'Services',
      category: 'widget',
      status: true,
      version: '1',
      blockProps: {
        services: [
          // {
          //   title: { de: '', it: '', en: '' },
          //   description: { de: '', it: '', en: '' },
          //   images: [{ fileName: '', url: '', title: { de: '', it: '', en: '' } }],
          //   service: '',
          //   allowedTimes: [],
          //   skipWeekDays: [],
          //   skipDays: [],
          //   // price: { amount: 0.0, currency: 'EUR', type: 'person', forType: 'exact', forAmount: 1, forUnit: 'day' },
          //   price: { amount: 0.0, currency: 'EUR' },
          //   packageConditionsCode: '',
          //   teaser: '',
          //   unit_price: '',
          //   priceBase: '',
          //   limitType: '',
          //   priceBaseDescription: '',
          //   limitTypeDescription: '',
          //   active: false,
          //   categories: [],
          // },
        ],
        serviceCategories: [
          // {
          //   code: 'TEST',
          //   cmCategory: ['MASSAGE'],
          //   title: { de: 'Custom', it: 'Custom', en: 'Custom' },
          //   description: { de: '', it: '', en: '' },
          //   languages: ['de', 'it', 'en'],
          //   allowedTimes: [],
          //   skipWeekDays: [],
          //   skipDays: [],
          //   services: [
          //     {
          //       title: { de: '', it: '', en: '' },
          //       description: { de: '', it: '', en: '' },
          //       image: { src: '', title: { de: '', it: '', en: '' } },
          //       service: '',
          //       allowedTimes: [],
          //       skipWeekDays: [],
          //       skipDays: [],
          //       price: { amount: 0.0, currency: 'EUR', type: 'person', forType: 'exact', forAmount: 1, forUnit: 'day' },
          //       active: false,
          //     },
          //   ],
          //   icon: '',
          // },
          // {
          //   code: 'TEST2',
          //   cmCategory: ['MASSAGE', 'MSCGESICHT'],
          //   title: { de: 'Custom2', it: 'Custom2', en: 'Custom2' },
          //   description: { de: '', it: '', en: '' },
          //   languages: ['de', 'it', 'en'],
          //   allowedTimes: [],
          //   skipWeekDays: [],
          //   skipDays: [],
          //   services: [
          //     {
          //       title: { de: '', it: '', en: '' },
          //       description: { de: '', it: '', en: '' },
          //       image: { src: '', title: { de: '', it: '', en: '' } },
          //       service: '',
          //       allowedTimes: [],
          //       skipWeekDays: [],
          //       skipDays: [],
          //       price: { amount: 0.0, currency: 'EUR', type: 'person', forType: 'exact', forAmount: 1, forUnit: 'day' },
          //       active: false,
          //     },
          //   ],
          //   icon: '',
          // },
          {
            code: 'MASSAGE',
            icon: '',
          },
          {
            code: 'MSCGESICHT',
            icon: '',
          },
          {
            code: 'GESICHTSGERTRAUD',
            icon: '',
          },
          {
            code: 'SOFTPACK',
            icon: '',
          },
          {
            code: 'FUR_DEN_RUCKEN',
            icon: '',
          },
          {
            code: 'PFLEGE_FUR_DEN_K',
            icon: '',
          },
          {
            code: 'DETOX_ANWENDUNGE',
            icon: '',
          },
          {
            code: 'REAKTIVES_ZELLTR',
            icon: '',
          },
          {
            code: 'VITALPINA__ANWE',
            icon: '',
          },
          {
            code: 'BELVITA__ANWEND',
            icon: '',
          },
          {
            code: 'FITNESS_PERSONAL',
            icon: '',
          },
          {
            code: 'YOGA_PERSONAL_TR',
            icon: '',
          },
        ],
        // skipServices: [],
        // skipWeekDays: [],
        // skipDates: [],
        // allowedTimes: [],
        layout: '1',
        labels: {
          addToBasket: {
            de: 'Add to basket',
            it: 'Add to basket',
            en: 'Add to basket',
          },
          forTypeExact: {
            de: '',
            it: '',
            en: '',
          },
          forTypeApprox: {
            de: 'Approx.',
            it: 'Approx.',
            en: 'Approx.',
          },
          viewDetail: {
            de: 'View Details',
            it: 'View Details',
            en: 'View Details',
          },
          addService: {
            de: 'Add service',
            it: 'Add service',
            en: 'Add service',
          },
          from: {
            de: 'from',
            it: 'from',
            en: 'from',
          },
          perPerson: {
            de: 'Per Person',
            it: 'Per Person',
            en: 'Per Person',
          },
          perFamily: {
            de: 'Per Family',
            it: 'Per Family',
            en: 'Per Family',
          },
          perRoom: {
            de: 'Per Room',
            it: 'Per Room',
            en: 'Per Room',
          },
          perGroup: {
            de: 'Per Group',
            it: 'Per Group',
            en: 'Per Group',
          },
          request: {
            de: 'Request',
            it: 'Request',
            en: 'Request',
          },
          selectDate: {
            de: 'Select preferred date',
            it: 'Select preferred date',
            en: 'Select preferred date',
          },
          selectTime: {
            de: 'Select preferred time',
            it: 'Select preferred time',
            en: 'Select preferred time',
          },
          bookingFor: {
            de: 'Booking for',
            it: 'Booking for',
            en: 'Booking for',
          },
          person: {
            de: 'Person',
            it: 'Person',
            en: 'Person',
          },
          persons: {
            de: 'Persons',
            it: 'Persons',
            en: 'Persons',
          },
          group: {
            de: 'Group',
            it: 'Group',
            en: 'Group',
          },
          groups: {
            de: 'Groups',
            it: 'Groups',
            en: 'Groups',
          },
          family: {
            de: 'Family',
            it: 'Family',
            en: 'Family',
          },
          families: {
            de: 'Families',
            it: 'Families',
            en: 'Families',
          },
          room: {
            de: 'Room',
            it: 'Room',
            en: 'Room',
          },
          rooms: {
            de: 'Rooms',
            it: 'Rooms',
            en: 'Rooms',
          },
          name: {
            de: 'Name',
            it: 'Name',
            en: 'Name',
          },
          email: {
            de: 'Email',
            it: 'Email',
            en: 'Email',
          },
          submitRequest: {
            de: 'Submit request',
            it: 'Submit request',
            en: 'Submit request',
          },
          addedToBasket: {
            de: 'Service added to your basket',
            it: 'Service added to your basket',
            en: 'Service added to your basket',
          },
          addMoreServices: {
            de: 'Add more services',
            it: 'Add more services',
            en: 'Add more services',
          },
          items: {
            de: 'Items',
            it: 'Items',
            en: 'Items',
          },
          checkout: {
            de: 'Checkout',
            it: 'Checkout',
            en: 'Checkout',
          },
          total: {
            de: 'Total',
            it: 'Total',
            en: 'Total',
          },
          services: {
            de: 'Services',
            it: 'Services',
            en: 'Services',
          },
          date: {
            de: 'Date',
            it: 'Date',
            en: 'Date',
          },
          time: {
            de: 'Time',
            it: 'Time',
            en: 'Time',
          },
          price: {
            de: 'Price',
            it: 'Price',
            en: 'Price',
          },
          amount: {
            de: 'Amount',
            it: 'Amount',
            en: 'Amount',
          },
          subTotal: {
            de: 'Sub total',
            it: 'Sub total',
            en: 'Sub total',
          },
          vatIncluded: {
            de: 'VAT included',
            it: 'VAT included',
            en: 'VAT included',
          },
          discount: {
            de: 'Discount',
            it: 'Discount',
            en: 'Discount',
          },
          sendReqeust: {
            de: 'Send request',
            it: 'Send request',
            en: 'Send request',
          },
          Contact: {
            title: { de: 'Kontakt', it: 'Contatto', en: 'Contact' },
            submit: { de: 'Senden', it: 'Invia', en: 'Send' },
            sentMail: { de: 'Danke', it: 'Grazie', en: 'Thank you' },
            subject: { de: 'V-MTS | Kontakt', it: 'V-MTS | Contatto', en: 'V-MTS | Contact' },
          },
          ContactForm: {
            subject: { de: 'Betreff', it: 'Soggetto', en: 'Subject' },
            name: { de: 'Ihr Name', it: 'Il tuo nome', en: 'Your name' },
          },
          emailSubjectSentToMe: {
            de: 'Gutschein vom Aparthotel VillaVerde',
            it: 'Voucher dall’Hotel VillaVerde',
            en: 'Voucher of the Aparthotel VillaVerde',
          },
          emailTemplateSentToMe: {
            de: '<p>{{ firstname }} {{ lastname }},</p>            <p>vielen Dank, dass Sie sich für einen Gutschein bei uns im Haus entschieden haben.</p>            <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>            Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>            <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>            <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
            it: '<p>{{ firstname }} {{ lastname }},</p>            <p>grazie per aver scelto un voucher per il nostro hotel.</p>            <p>In allegato trova il voucher in formato pdf. Il voucher è stato registrato presso la nostra reception.<br>              Può stamparlo oppure riscattare il voucher via smartphone direttamente presso la nostra reception.<p>             <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p>             <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
            en: '<p>{{ firstname }} {{ lastname }},</p>            <p>Thank you for choosing our hotel for purchasing a voucher.</p>            <p>Attached you find the voucher in .pdf format. The voucher has been registered at our reception.<br>              You can either print the voucher, or redeem the voucher by smartphone directly at our reception.</p>            <p>We are looking forward to welcoming you.</p>            <p>Yours sincerely,</p>            <p><em>The team of Aparthotel VillaVerde</em><p>',
          },
          emailSubjectConfirmToMe: {
            de: 'Gutschein von {{ firstname }} {{ lastname }} für {{ name }} vom Aparthotel VillaVerde',
            it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per {{ name }} per l’ Aparthotel VillaVerde',
            en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Aparthotel VillaVerde',
          },
          emailTemplateConfirmToMe: {
            de: '<p>{{ firstname }} {{ lastname }},</p>             <p>vielen Dank, dass Sie sich für einen Gutschein für {{ name }} bei uns im Haus entschieden haben.</p>             <p></p>             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an {{ name }} gesandt und an unserer Rezeption registriert.<br>             Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>             <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
            it: '<p>{{ firstname }} {{ lastname }},</p>            <p>grazie per aver scelto un voucher per {{ name }} per il nostro hotel.</p>            <p></p>            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato inviato a {{ name }} e registrato presso la nostra reception.<br>            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p>             <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
            en: '<p>{{ firstname }} {{ lastname }},</p>            <p>Thank you for choosing a voucher for {{ name }} for our hotel.</p>             <p></p>            <p>Attached you find the voucher in .pdf format. The voucher has been sent to {{ name }} and registered at the reception.<br>            You can either print the voucher or redeem the voucher by smartphone directly at our reception.</p>            <p>We are looking forward to welcoming you.</p>            <p>Yours sincerely,</p>            <p><em>The team of Aparthotel VillaVerde </em></p>',
          },
          emailSubjectSentToOther: {
            de: 'Gutschein von {{ firstname }} {{ lastname }} vom Aparthotel VillaVerde',
            it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per l’ Aparthotel VillaVerde',
            en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Aparthotel VillaVerde',
          },
          emailTemplateSentToOther: {
            de: '<p>{{ name }},</p>             <p>für Sie wurde von {{ firstname }} {{ lastname }} ein Gutschein bei uns im Haus hinterlegt:</p>             <p></p>             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>             Sie können den Gutschein Ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>             <p><em>Ihr Aparthotel VillaVerde Team</em></p>',
            it: '<p>{{ name }},</p>            <p>{{ firstname }} {{ lastname }} ha acquistato un voucher per il nostro hotel per Lei:</p>            <p></p>            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato registrato presso la nostra reception.<br>             Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>            <p>Siamo lieti di darle il benvenuto presso la nostra struttura. </p>            <p><em>Il team dell’ Aparthotel VillaVerde</em></p>',
            en: '<p>{{ name }},</p>            <p>a voucher purchased by {{ firstname }} {{ lastname }} has been registered at our hotel:</p>            <p></p>            <p>Attached you find the voucher in .pdf format. The voucher has been registered at the reception.<br>            You can either print this voucher or redeem it by smartphone directly at the reception.</p>            <p>We are looking forward to welcoming you.</p>            <p>Yours, sincerely</p>            <p><em>The team of Aparthotel VillaVerde</em></p>',
          },
        },
        contactTemplate: {
          de: '<h2>New german message from V-MTS contact form</h2>\n        <h3>{{ subject }}</h3>\n        <p>{{ message }}</p>\n        <h3>Contact Details</h3>\n        <ul>\n        <li>Name: {{ name }}</li>\n        <li>Email: {{ email }}</li>\n        </ul>',
          en: '<h2>New english message from V-MTS contact form</h2>\n        <h3>{{ subject }}</h3>\n        <p>{{ message }}</p>\n        <h3>Contact Details</h3>\n        <ul>\n        <li>Name: {{ name }}</li>\n        <li>Email: {{ email }}</li>\n        </ul>',
          it: '<h2>New italian message from V-MTS contact form</h2>\n        <h3>{{ subject }}</h3>\n        <p>{{ message }}</p>\n        <h3>Contact Details</h3>\n        <ul>\n        <li>Name: {{ name }}</li>\n        <li>Email: {{ email }}</li>\n        </ul>',
        },
      },
    },
  ],
}

const vmtsConfigCaVirginia = {
  _id: '2v1mk93fAD',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'Gutscheine schenken',
  pages: [],
  fonts: [
    {
      name: 'BodoniSvtyTwoITCTT-Book',
      url: 'https://www.villaverde-meran.com/site/templates/fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff',
      fontFace:
        '@font-face { font-family: "BodoniSvtyTwoITCTT-Book"; src: url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.eot") format("eot"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.ttf") format("ttf"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff") format("woff"), url("../fonts/BodoniSvtyTwoITCTT-Book/BodoniSvtyTwoITCTT-Book.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    },
    {
      name: 'SaveurSans-Regular',
      url: 'https://www.villaverde-meran.com/site/templates/fonts/SaveurSans-Regular/SaveurSans-Regular.woff',
      fontFace:
        '@font-face { font-family: "SaveurSans-Regular"; src: url("../fonts/SaveurSans-Regular/SaveurSans-Regular.eot") format("eot"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.ttf") format("ttf"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.woff") format("woff"), url("../fonts/SaveurSans-Regular/SaveurSans-Regular.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    },
    {
      name: 'BodoniLTPro',
      url: 'https://www.villaverde-meran.com/site/templates/fonts/BodoniLTPro/BodoniLTPro.woff',
      fontFace:
        '@font-face { font-family: "BodoniLTPro"; src: url("../fonts/BodoniLTPro/BodoniLTPro.eot") format("eot"), url("../fonts/BodoniLTPro/BodoniLTPro.ttf") format("ttf"), url("../fonts/BodoniLTPro/BodoniLTPro.woff") format("woff"), url("../fonts/BodoniLTPro/BodoniLTPro.woff2") format("woff2"); font-style: normal; font-weight: normal; }',
    },
  ],
  styles: {
    'fontFamily-body': '"Favorit-Regular", sans-serif',
    'fontFamily-subHeading': '"Reckless-Light", sans-serif',
    'fontFamily-heading': '"Reckless-Light", sans-serif',
    'fontFamily-button': '"Favorit-Regular", sans-serif',
    'fontSize-max': 16,
    'fontSize-min': 16,
    'fontSize-heading-max': 60,
    'fontSize-heading-min': 36,
    'fontSize-subHeading-max': 40,
    'fontSize-subHeading-min': 28,
    'fontSize-button-max': 16,
    'fontSize-button-min': 16,
    'lineHeight-body': '1.2',
    'fontWeight-heading': 500,
    'fontWeight-subHeading': 500,
    'fontWeight-body': 400,
    'backgroundColor-primary': 'transparent',
    'backgroundColor-light': '#f4f4f2',
    'color-primary': '#5d5a43',
    'color-secondary': '#a39d91',
    'color-light': '#b7b6ab',
    'color-button': '#fff',
    'color-button-hover': '#fff',
    'backgroundColor-button': '#bcbbac',
    'backgroundColor-button-hover': '#a39d91',
    'viewPort-max': '1200px',
    'borderColor-button': '#bcbbac',
    'borderColor-button-hover': '#a39d91',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '1',
  },
  components: [
    {
      _id: '8lY6k998KF',
      name: 'Voucher-mts',
      component: 'WidgetVmts1',
      category: 'widget',
      status: true,
      version: '1',
      blockProps: {
        clientId: 'u1013',
        hotelId: 'IT_GIO_VIRGINIA', //needed to load the images with kognitiv-loader
        paymentMethod: 'hobex',
        contactTemplate: `<h2>New message from V-MTS contact form</h2>
        <h3>{{ subject }}</h3>
        <p>{{ message }}</p>
        <h3>Contact Details</h3>
        <ul>
        <li>Name: {{ name }}</li>
        <li>Email: {{ email }}</li>
        </ul>`,
        categories: [
          {
            //n.b. title, description and image fileName will be taken from kognitiv when not set
            title: {
              de: 'Massage',
              it: 'Massage',
              en: 'Massage',
            },
            slug: 'serviceappointment',
            code: 'MASSAGES',
            // code: 'V_SPAAPPOINTMENT',
            //priceText: "ab 28 €",
            linkText: {
              de: 'Termin vormerken',
              it: 'Appuntamento massaggio',
              en: 'Massage appointment',
            },
            //description: "Erstellen Sie Ihren invididuellen Gutschein aus unseren SPA-Angeboten",
            validDays: 365,
            image: {
              width: 640,
              height: 540,
              //fileName: "Screenshot_20190626_103255.png",
            },
            categories: [
              {
                code: 'MASSAGES',
                type: 'appointment',
                serviceGroups: [
                  {
                    categories: ['MASSAGES'],
                  },
                ],
                image: {
                  width: 640,
                  height: 540,
                },
                options: {
                  createTitle: {
                    de: 'Massage-Termin vereinbaren',
                    it: 'Prenotare un appuntamento massaggio',
                    en: 'Make a massage appointment',
                  },
                  editTitle: {
                    de: 'Massage-Termin ändern',
                    it: 'Modificare appuntamento massaggio',
                    en: 'Change a massage appointment',
                  },
                  timerange: {
                    include: [[9, 21]],
                    interval: 15,
                  },
                },
              },
            ],
          },
        ],
        labels: [
          {
            App: [
              {
                reallyDeleteVoucher: {
                  de: 'Wollen Sie den Gutschein wirklich löschen?',
                  it: 'Sei sicuro di voler cancellare il voucher?',
                  en: 'Are you sure you want to delete your voucher?',
                },
                reallyDeleteAppointment: {
                  de: 'Wollen Sie den Termin wirklich löschen?',
                  it: "Sei sicuro di voler disdire l'appuntamento?",
                  en: 'Are you sure you want to cancel your appointment?',
                },
              },
            ],
            IntroText: [
              {
                title: {
                  de: 'Freude schenken',
                  it: 'Regalare un sorriso',
                  en: 'Giving Joy',
                },
                description: {
                  de: 'Sie möchten einem lieben Menschen etwas Besonderes schenken? Eine kleine Auszeit vom Alltag? Dann sind unsere Geschenk-Gutscheine das Richtige für Sie! Einfach online bezahlen und der Gutschein wird schön verpackt per Post oder, wenn’s mal schneller gehen muss, per E-Mail zugeschickt. Bei Fragen und Sonderwünschen sind wir gerne behilflich!',
                  it: 'Sta cercando un regalo speciale per una persona cara? Una piccola pausa dalla vita di tutti i giorni? Allora i nostri buoni regalo sono la cosa giusta per Voi! Basta pagare online e il buono sarà inviato in confezione regalo per posta o, se deve essere più veloce, via e-mail. Siamo felici di aiutare con domande e richieste speciali!',
                  en: 'Would you like to give something special to someone you love? A little break from everyday life? Then our gift vouchers are the right thing for you! Simply pay online and the voucher will be sent to you nicely packaged by post or, if it has to be faster, by email. We are happy to help with questions and special requests!',
                },
              },
            ],
            //Modals - should be extended with external link function
            Shipment: [
              {
                title: {
                  de: 'Versandkosten',
                  it: 'Costi di spedizione',
                  en: 'Shipping costs',
                },
                description: {
                  de: `<b>E-Mail Versand</b><br><br> Wenn sie sich für die Versandart Gutschein per E-Mail (Print at home) entschieden haben entstehen keine Kosten. Sie oder ihr Beschenkter erhalten den Gutschein per E-Mail im .pdf Format zum speichern oder ausdrucken. Es entstehen keine Kosten.
        <br><br>

        <b>Post Versand</b><br><br> Wenn sie sich für die Versandart per Post entscheiden, übernimmt das Ca\'Virginia Country House die Kosten. Der Gutschein Empfänger erhält einen exklusiv verpackten Gutschein. Bitte beachten Sie, dass wir keine Haftung für den rechtzeitigen Empfang des Gutscheins übernehmen. Wir versenden die Gutscheine innerhalb 2 Werktage. Rechnen Sie bei der Bestellung per Post genügend Versandzeit der Post ein.`,
                  it: '',
                  en: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Colophon',
                  en: 'Imprint text',
                },
                link: {
                  de: '/de/servicenavigation/impressum',
                  it: '/it/servicenavigation/colophon',
                  en: '/en/servicenavigation/colophon',
                },
              },
            ],
            Privacy: [
              {
                title: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Privacy',
                },
                description: {
                  de: 'Datenschutz- und Privacy',
                  it: 'Protezione dei dati e privacy',
                  en: 'Data protection and privacy',
                },
              },
            ],
            Tos: [
              {
                title: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                },
                description: {
                  de: `<b>Allgemeine Geschäftsbedingungen</b>
        <br>
        <br>
        <b>Kauf- und Lieferbedingungen</b>
        <br>
        <br>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.
        <br>
        <br>

        <b>Bestellung</b>
        <br>
        <br>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.cavirginia.it und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die Ca\'Virginia & C. SNC haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der Ca\'Virginia & C. SNC rückerstattet werden.
        <br>
        <br>

        Jeder Gutschein kann nur einmal eingelöst werden.
        <br>
        <br>

        <b>Mindestalter</b>
        <br>
        <br>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.
        <br>
        <br>

        <b>Preise und Produkte</b>
        <br>
        <br>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.
        <br>
        <br>

        <b>Rücktrittsrecht</b>
        <br>
        <br>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <br>
        <br>
        <b>Sicherheitsgarantie & Datenschutz</b>
        <br>
        <br>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        <br>
        <br>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die Ca\'Virginia & C. SNC, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                  it: '',
                  en: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Informazione legale',
                  en: 'Legal information',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Informazione legale',
                  en: 'Legal information',
                },
              },
            ],
            Contact: [
              {
                title: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                },
                submit: {
                  de: 'Senden',
                  it: 'Invia',
                  en: 'Send',
                },
                sentMail: {
                  de: 'Danke',
                  it: 'Grazie',
                  en: 'Thank you',
                },
                subject: {
                  de: 'V-MTS | Kontakt',
                  it: 'V-MTS | Contatto',
                  en: 'V-MTS | Contact',
                },
              },
            ],
            ContactForm: [
              {
                subject: {
                  de: 'Betreff',
                  it: 'Soggetto',
                  en: 'Subject',
                },
                name: {
                  de: 'Ihr Name',
                  it: 'Il tuo nome',
                  en: 'Your name',
                },
              },
            ],
            BasketItemVoucher: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                },
                quantity: {
                  de: 'Anzahl',
                  it: 'Quantità',
                  en: 'Quantity',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                },
              },
            ],
            BasketItemAppointment: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                },
                myself: {
                  de: 'Ich selbst',
                  it: 'Me stesso',
                  en: 'Myself',
                },
                service: {
                  de: 'Service',
                  it: 'Service',
                  en: 'Service',
                },
                appointments: {
                  de: 'Termine',
                  it: 'Appuntamenti',
                  en: 'Appointments',
                },
                persons: {
                  de: 'Pers.',
                  it: 'pers.',
                  en: 'pers.',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                },
              },
            ],
            Basket: [
              {
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti per servizi',
                  en: 'Service appointments',
                },
                title: {
                  de: 'Ihr Warenkorb',
                  it: 'Il Suo carrello',
                  en: 'Your basket',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Importo totale',
                  en: 'Total',
                },
                continue: {
                  de: 'Weiterstöbern',
                  it: 'Continua navigare',
                  en: 'Continue shopping',
                },
                checkout: {
                  de: 'Zur Kassa',
                  it: 'Procedi al pagamento',
                  en: 'Proceed with payment',
                },
              },
            ],
            FooterMenu: [
              {
                shipment: {
                  de: 'Versandkosten',
                  it: "Costi d'invio",
                  en: 'Delivery charges',
                },
                privacy: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Data protection',
                },
                //when any of the keys with suffix "Link" is provided the footer menu links to external urls opening in new tab
                privacyLink: {
                  de: '/de/servicenavigation/privacy/',
                  it: '/it/servicenavigation/privacy/',
                  en: '/en/servicenavigation/privacy/',
                },
                tos: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                },
                tosTemplate: {
                  de: `<h2>Allgemeine Geschäftsbedingungen</h2>
        <b>Kauf- und Lieferbedingungen</b>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.

        <b>Bestellung</b>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.cavirginia.it und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die Ca\'Virginia & C. SNC haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der Ca\'Virginia & C. SNC rückerstattet werden.

        Jeder Gutschein kann nur einmal eingelöst werden.

        <b>Mindestalter</b>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.

        <b>Preise und Produkte</b>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.

        <b>Rücktrittsrecht</b>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <b>Sicherheitsgarantie & Datenschutz</b>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die Ca\'Virginia & C. SNC, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                },
                colophon: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                },
                colophonLink: {
                  de: '/de/servicenavigation/impressum',
                  it: '/it/servicenavigation/colophon',
                  en: '/en/servicenavigation/colophon',
                },
                contact: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                },
              },
            ],
            Thankyou: [
              {
                title: {
                  de: 'Danke für Ihren Einkauf',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                },
                description: {
                  de: 'Danke für Ihren Einkauf.',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                },
              },
            ],
            Categories: [
              {
                title: {
                  de: 'Wählen Sie bitte aus:',
                  it: 'Scegliere',
                  en: 'Please select',
                },
              },
            ],
            Voucher: [
              {
                createVoucher: {
                  de: 'Wertgutschein erstellen',
                  it: 'Creare un vuocher di valore',
                  en: 'Value voucher',
                },
                editVoucher: {
                  de: 'Wertgutschein bearbeiten',
                  it: 'Modifica voucher di valore',
                  en: 'Change value voucher',
                },
                quantity: {
                  de: 'Anzahl Gutscheine',
                  it: 'Quantita voucher',
                  en: 'Voucher quantity',
                },
                persons: {
                  de: 'Personen',
                  it: 'Persone',
                  en: 'Persons',
                },
                value: {
                  de: 'Wert:',
                  it: 'Valore',
                  en: 'Value',
                },
                voucherValue: {
                  de: 'Gutscheinwert',
                  it: 'Valore del voucher',
                  en: 'Amount of voucher',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                },
                dear: {
                  de: 'Lieber',
                  it: 'Egregio/Gentile',
                  en: 'Dear',
                },
                recipientName: {
                  de: 'Empfängername',
                  it: 'Nome del destinatario',
                  en: 'Name of the recipient',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                },
                sendVia: {
                  de: 'Senden Via',
                  it: 'Invia tramite',
                  en: 'Send by',
                },
                optionEmail: {
                  de: 'E-Mail',
                  it: 'posta elettronica',
                  en: 'email',
                },
                optionMail: {
                  de: 'Post',
                  it: 'Posta ordinaria',
                  en: 'mailing route',
                },
                sendToMe: {
                  de: 'an mich senden',
                  it: 'invia a me',
                  en: 'sent to myself',
                },
                sendToOther: {
                  de: 'an jemand anderen senden',
                  it: "invia a un'altra persona",
                  en: 'send to someone else',
                },
                recipientEmail: {
                  de: 'E-Mail-Adresse des Empfängers',
                  it: 'Indirizzo email del destinatario',
                  en: 'Email address of the recipient',
                },
                addressPlaceHolder: {
                  de: 'Straße, Platz + Nr',
                  it: 'Via, Piazza + Nr',
                  en: 'Street, place + no',
                },
                address: {
                  de: 'Adresse',
                  it: 'Indirizzo',
                  en: 'Address',
                },
                zipPlaceHolder: {
                  de: 'PlZ',
                  it: 'CAP',
                  en: 'ZIP',
                },
                zip: {
                  de: 'Postleitzahl',
                  it: 'Codice avviamento postale',
                  en: 'postcode',
                },
                placePlaceHolder: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                },
                saveChanges: {
                  de: 'Änderungen speichern',
                  it: 'Salva modifiche',
                  en: 'Save changes',
                },
                addToBasket: {
                  de: 'Hinzufügen zum Warenkorb',
                  it: 'Aggiungi al carrello',
                  en: 'Add to the basket',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                },
                serviceSelection: {
                  de: 'Leistungsauswahl',
                  it: 'Selezione dei servizi',
                  en: 'Selection of services',
                },
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                },
              },
            ],
            Appointment: [
              {
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                },
                createServiceAppointment: {
                  de: 'SPA-Termin vormerken',
                  it: 'Prenotare appuntamento SPA',
                  en: 'Make a SPA appointment',
                },
              },
            ],
            Template: [
              {
                serviceTitle: {
                  de: 'Leistungen',
                  it: 'Servizi',
                  en: 'Services',
                },
              },
            ],
            Checkout: [
              {
                title: {
                  de: 'Kassa',
                  it: 'Cassa',
                  en: 'Checkout',
                },
                paynow: {
                  de: 'Gutscheine bezahlen',
                  it: 'Pagamento del voucher',
                  en: 'Voucher payment',
                },
                requestnow: {
                  de: 'Termine anfragen',
                  it: 'Richiedere un appuntamento',
                  en: 'Request an appointment',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                },
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti servizio',
                  en: 'Service appointments',
                },
                personalData: {
                  de: 'Ihre Daten',
                  it: 'I suoi dati',
                  en: 'Your data',
                },
                appointmentNotice: {
                  de: 'Terminvereinbarungen müssen vom Hotel bestätigt werden und werden vor Ort bezahlt, sobald ein Termin wahrgenommen wird.',
                  it: 'Appuntamenti devono essere confermati dal nostro hotel e sono pagati direttamente sul posto',
                  en: 'Appointments need to be confirmed by our hotel and are paid on site at the time of your appointment',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Totale',
                  en: 'Total',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                },
                salutationOptions: {
                  de: ['Herr', 'Frau', 'Familie'],
                  it: ['Signor', 'Signora', 'Famiglia'],
                  en: ['Mr.', 'Mrs.', 'Family'],
                },
                title: {
                  de: 'Titel',
                  it: 'Titolo',
                  en: 'Title',
                },
                firstName: {
                  de: 'Vorname',
                  it: 'Nome',
                  en: 'first name',
                },
                lastName: {
                  de: 'Nachname',
                  it: 'Cognome',
                  en: 'last name',
                },
                phone: {
                  de: 'Telefon',
                  it: 'Telefono',
                  en: 'Phone',
                },
                email: {
                  de: 'E-Mail-Adresse',
                  it: 'Indirizzo email',
                  en: 'Email address',
                },
                emailConfirm: {
                  de: 'E-Mail-Adresse bestätigen',
                  it: 'Conferma indirizzo email',
                  en: 'Confirm email address',
                },
                sendInvoice: {
                  de: 'Schicken Sie mir eine Rechnung',
                  it: 'Richiesta fattura',
                  en: 'Please send me an invoice',
                },
                streetNo: {
                  de: 'Straße / Nr.',
                  it: 'Via / n°',
                  en: 'Street / n°',
                },
                zip: {
                  de: 'PLZ',
                  it: 'CAP',
                  en: 'ZIP',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                },
                company: {
                  de: 'Firma',
                  it: 'Ditta',
                  en: 'Company',
                },
                vatId: {
                  de: 'MwSt.Nr.',
                  it: 'Partita IVA',
                  en: 'VAT number',
                },
                invoice: {
                  de: 'Bitte schicken Sie mir eine Rechnung',
                  it: 'Richiesta invio fattura',
                  en: 'Please send me an invoice',
                },
                acceptPrivacy: {
                  de: 'Ich akzeptiere die Datenschutzvereinbarung und erkläre mich mit der Speicherung meiner Daten zur Bestellabwicklung einverstanden.',
                  it: "Accetto le norme in materia di protezione dei dati e l'uso dei miei dati personali per lo svolgimento dell'ordine.",
                  en: 'I agree on privacy policy and the use of my personal data for this purchase.',
                },
                sameForBilling: {
                  de: 'Rechnungsadresse entspricht der obigen',
                  it: 'Indirizzio di fatturazione sorrisponde a quello sopra indicato',
                  en: 'Billing address corresponds to the one indicated above',
                },
                pecEmail: {
                  de: 'PEC E-Mail-Adresse',
                  it: 'Indirizzo email PEC',
                  en: 'PEC email address',
                },
                sdiCode: {
                  de: 'SDI-Code',
                  it: 'Codice SDI',
                  en: 'SDI code',
                },
                emailSubjectSentToMe: {
                  de: "Gutschein vom Ca'Virginia Country House",
                  it: "Voucher dall’Hotel Ca'Virginia Country House",
                  en: "Voucher of the Ca'Virginia Country House",
                },
                emailTemplateSentToMe: {
                  de: "<p>{{ firstname }} {{ lastname }},</p>\
            <p>vielen Dank, dass Sie sich für einen Gutschein bei uns im Haus entschieden haben.</p>\
            <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
            Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
            <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
            <p><em>Ihr Ca'Virginia Country House Team</em></p>",
                  it: "<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per il nostro hotel.</p>\
            <p>In allegato trova il voucher in formato pdf. Il voucher è stato registrato presso la nostra reception.<br>\
              Può stamparlo oppure riscattare il voucher via smartphone direttamente presso la nostra reception.<p> \
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Ca'Virginia Country House</em></p>",
                  en: "<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing our hotel for purchasing a voucher.</p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at our reception.<br>\
              You can either print the voucher, or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Ca'Virginia Country House</em><p>",
                },
                emailSubjectConfirmToMe: {
                  de: "Gutschein von {{ firstname }} {{ lastname }} für {{ name }} vom Ca'Virginia Country House",
                  it: "Voucher acquistato da {{ firstname }} {{ lastname }} per {{ name }} per l’ Ca'Virginia Country House",
                  en: "Voucher purchased by {{ firstname }} {{ lastname }} for the Ca'Virginia Country House",
                },
                emailTemplateConfirmToMe: {
                  de: "<p>{{ firstname }} {{ lastname }},</p>\
             <p>vielen Dank, dass Sie sich für einen Gutschein für {{ name }} bei uns im Haus entschieden haben.</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an {{ name }} gesandt und an unserer Rezeption registriert.<br>\
             Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Ca'Virginia Country House Team</em></p>",
                  it: "<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per {{ name }} per il nostro hotel.</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato inviato a {{ name }} e registrato presso la nostra reception.<br>\
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Ca'Virginia Country House</em></p>",
                  en: "<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing a voucher for {{ name }} for our hotel.</p> \
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been sent to {{ name }} and registered at the reception.<br>\
            You can either print the voucher or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Ca'Virginia Country House </em></p>",
                },
                emailSubjectSentToOther: {
                  de: "Gutschein von {{ firstname }} {{ lastname }} vom Ca'Virginia Country House",
                  it: "Voucher acquistato da {{ firstname }} {{ lastname }} per l’ Ca'Virginia Country House",
                  en: "Voucher purchased by {{ firstname }} {{ lastname }} for the Ca'Virginia Country House",
                },
                emailTemplateSentToOther: {
                  de: "<p>{{ name }},</p>\
             <p>für Sie wurde von {{ firstname }} {{ lastname }} ein Gutschein bei uns im Haus hinterlegt:</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
             Sie können den Gutschein Ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Ca'Virginia Country House Team</em></p>",
                  it: "<p>{{ name }},</p>\
            <p>{{ firstname }} {{ lastname }} ha acquistato un voucher per il nostro hotel per Lei:</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato registrato presso la nostra reception.<br> \
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura. </p>\
            <p><em>Il team dell’ Ca'Virginia Country House</em></p>",
                  en: "<p>{{ name }},</p>\
            <p>a voucher purchased by {{ firstname }} {{ lastname }} has been registered at our hotel:</p>\
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at the reception.<br>\
            You can either print this voucher or redeem it by smartphone directly at the reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours, sincerely</p>\
            <p><em>The team of Ca'Virginia Country House</em></p>",
                },
              },
            ],
            PaymentFailed: [
              {
                title: {
                  de: 'Zahlung fehlgeschlagen',
                  it: 'Pagamento fallito',
                  en: 'Payment failed',
                },
                description: {
                  de: 'Lieber {name}, d.',
                  it: 'Caro/a {name}',
                  en: 'Dear {name}',
                },
              },
            ],
            PageNotFound: [
              {
                title: {
                  de: 'Seite nicht gefunden',
                  it: 'Pagina non trovata',
                  en: 'Page not found',
                },
                description: {
                  de: 'Die angegebene Adresse entspricht keiner bekannten Seite.',
                  it: `L'indirizzo indicato non corrisponde a nessun sito raggiungibile`,
                  en: 'The indicated address does not match any common site',
                },
                backToStart: {
                  de: 'Zurück zur Startseite',
                  it: 'Torna alla pagina inizale',
                  en: 'Back to the homepage',
                },
              },
            ],
          },
        ],
      },
    },
  ],
}

const vmtsConfigLeitlhof = {
  _id: '4vJml93fAD',
  language: 'de',
  name: 'de',
  slug: 'de',
  path: '/',
  default: true,
  title: 'Gutscheine schenken',
  pages: [],
  // styles: {
  //   'fontFamily-body': '"Favorit-Regular", sans-serif',
  //   'fontFamily-heading': '"Reckless-Light", sans-serif',
  //   'fontWeight-heading': 500,
  //   'color-primary': '#5d5a43',
  //   'color-light': '#b7b6ab',
  // },
  styles: {
    'fontFamily-body': '"Favorit-Regular", sans-serif',
    'fontFamily-subHeading': '"Reckless-Light", sans-serif',
    'fontFamily-heading': '"Reckless-Light", sans-serif',
    'fontFamily-button': '"Favorit-Regular", sans-serif',
    'fontSize-max': '16px',
    'fontSize-min': '16px',
    'fontSize-heading-max': '60px',
    'fontSize-heading-min': '36px',
    'fontSize-subHeading-max': '40px',
    'fontSize-subHeading-min': '28px',
    'fontSize-button-max': '16px',
    'fontSize-button-min': '16px',
    'lineHeight-body': '1.2',
    'fontWeight-heading': 500,
    'fontWeight-subHeading': 500,
    'fontWeight-body': 400,
    'backgroundColor-primary': '#fff',
    'backgroundColor-light': '#f4f4f2',
    'color-primary': '#5d5a43',
    'color-secondary': '#a39d91',
    'color-light': '#b7b6ab',
    'color-button': '#fff',
    'color-button-hover': '#fff',
    'backgroundColor-button': '#bcbbac',
    'backgroundColor-button-hover': '#a39d91',
    'viewPort-min': '640px',
    'viewPort-max': '1200px',
    'borderColor-button': '#bcbbac',
    'borderColor-button-hover': '#a39d91',
    'textTransform-button': 'uppercase',
    'opacity-button-hover': '1',
  },
  components: [
    {
      _id: '8lY6k9n8KF',
      name: 'Voucher-mts',
      component: 'Vmts',
      category: 'widget',
      status: true,
      version: '1',
      blockProps: {
        //Leitlhof
        clientId: 'u0724',
        hotelId: 'S003910', //needed to load the images with kognitiv-loader
        paymentMethod: 'hobex',
        contactTemplate: `<h2>New message from V-MTS contact form</h2>
        <h3>{{ subject }}</h3>
        <p>{{ message }}</p>
        <h3>Contact Details</h3>
        <ul>
        <li>Name: {{ name }}</li>
        <li>Email: {{ email }}</li>
        </ul>`,
        categories: [
          {
            title: {
              de: 'Wertgutschein',
              it: 'Buono valore',
              en: 'Value voucher',
              fr: 'Voucher',
            },
            slug: 'valuevoucher',
            // priceText: "ab 10 €",
            code: 'V_VALUEVOUCHER',
            linkText: {
              de: 'Gutschein erstellen',
              it: 'Create il Vostro voucher individuale',
              en: 'Create a voucher',
              fr: 'Créer un voucher',
            },
            // description: "Erstellen Sie hier Ihren Gutschein",
            validDays: 365,
            image: [
              {
                width: 640,
                height: 540,
                fileName: 'Wertgutschein_1.jpg',
              },
            ],
            type: 'voucher',
            options: [
              {
                minAmount: 10,
                maxAmount: 10000,
                maxQuantity: 100,
              },
            ],
            templates: [
              // multiple templates possible
              {
                // labels: - if there are fixed texts
                component: '',
                format: 'portrait',
                labels: [
                  {
                    title: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                      fr: 'Voucher',
                    },
                    voucher: {
                      de: 'Gutschein',
                      en: 'Voucher',
                      it: 'Voucher',
                      fr: 'Voucher',
                    },
                    orderNo: {
                      de: 'Bestellnummer',
                      en: 'Order number',
                      it: "Numero d'ordine",
                      fr: 'Numero de commande',
                    },
                    validFrom: {
                      de: 'Ausgestellt',
                      en: 'date of issue',
                      it: 'data di emissione',
                      fr: 'Date de création',
                    },
                    validTo: {
                      de: 'Einzulösen',
                      en: 'Valid until',
                      it: 'Da riscattare entro',
                      fr: "Date limite d'utilisation",
                    },
                    footer: [
                      {
                        name: {
                          en: '',
                          de: 'Naturhotel Leitlhof',
                          it: '',
                          fr: '',
                        },
                        address: {
                          de: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                          it: '',
                          fr: '',
                        },
                        phone: {
                          de: '+39 0474 913440',
                          it: '',
                          fr: '',
                        },
                        fax: {
                          de: '+39 0474 914300',
                          it: '',
                          fr: '',
                        },
                        web: {
                          de: 'www.leitlhof.com',
                          it: '',
                          fr: '',
                        },
                        email: {
                          de: 'info@leitlhof.com',
                          it: '',
                          fr: '',
                        },
                      },
                    ],
                  },
                ],
                images: [
                  {
                    logo: 'https://www.leitlhof.com/img/footer-logo-icon.svg',
                    header: [
                      //multiple image selection per template
                      { fileName: 'Wertgutschein_1.jpg' },
                      { fileName: 'Wertgutschein_2.jpg' },
                      { fileName: 'Wertgutschein_3.jpg' },
                      { fileName: 'Wertgutschein_4.jpg' },
                      { fileName: 'Wertgutschein_5.jpg' },
                      { fileName: 'Wertgutschein_6.jpg' },
                      { fileName: 'Wertgutschein_7.jpg' },
                      { fileName: 'Wertgutschein_8.jpg' },
                      { fileName: 'Wertgutschein_9.jpg' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: {
              de: 'Restaurant-Gutschein',
              it: 'Buono ristorante',
              en: 'Restaurant voucher',
              fr: '',
            },
            linkText: {
              de: '',
              it: 'Buono per colazione o cena nel nostro ristorante',
              en: 'Create a voucher',
              fr: '',
            },
            slug: 'restaurant-gutschein',
            code: 'V_RESTAURANT',
            validDays: 365,
            image: {
              width: 640,
              height: 540,
              fileName: 'LT_mikerabensteiner-4713.jpg',
            },
            type: 'categories',
            // priceText: "ab 22 €",
            categories: [
              {
                title: {
                  de: 'Frühstück',
                  en: 'Breakfast',
                  it: 'Colazione',
                  fr: 'Petit déjeuner',
                },
                slug: 'breakfast',
                code: 'V_FRUEHSTUCK',
                validDays: 365,
                image: [
                  {
                    width: 640,
                    height: 540,
                    fileName: 'leitlhof©bureaurabensteiner-3102.jpg',
                  },
                ],
                type: 'voucher',
                priceText: {
                  de: 'ab 22 €',
                  en: 'from 22 € ',
                  it: 'a partire da 22 €',
                  fr: 'à partir de € 22',
                },
                options: [
                  {
                    unit: {
                      per: 'person', //other options: unit (default), room [personNight, roomNight (not used probably)]
                      amount: 22,
                    },
                    title: {
                      de: 'Frühstück-Gutschein',
                      it: 'Buono colazione',
                      en: 'Breakfast Voucher',
                      fr: 'Voucher pour le petit déjeuner',
                    },
                    description: {
                      de: 'Genießen Sie ein Frühstück bei uns mit folgendem Menü...',
                      en: 'Enjoy our breakfast including the following menu',
                      it: 'Gustate la nostra colazione che include come segue',
                      fr: 'Venez déguster notre petit dejeuner avec une sélection variée de...',
                    },
                    minAmount: 22,
                  },
                ],
                templates: [
                  // multiple templates possible
                  {
                    // labels: - if there are fixed texts
                    component: '',
                    format: 'portrait',
                    labels: [
                      {
                        title: {
                          de: 'Gutschein',
                          en: 'Voucher',
                          it: 'Voucher',
                          fr: 'Voucher',
                        },
                        voucher: {
                          de: 'Gutschein',
                          en: 'Voucher',
                          it: 'Voucher',
                          fr: 'Voucher',
                        },
                        orderNo: {
                          de: 'Bestellnummer',
                          en: 'Order number',
                          it: "Numero d'ordine",
                          fr: 'Numero de commande',
                        },
                        validFrom: {
                          de: 'Ausgestellt',
                          en: 'Date of issue',
                          it: 'Data di emissione',
                          fr: 'Date de création',
                        },
                        validTo: {
                          de: 'Einzulösen',
                          en: 'Valid until',
                          it: 'Da riscattare entro',
                          fr: "Date limite d'utilisation",
                        },
                        footer: [
                          {
                            name: {
                              en: 'Naturhotel Leitlhof',
                              de: 'Naturhotel Leitlhof',
                              it: 'Naturhotel Leitlhof',
                              fr: 'Naturhotel Leitlhof',
                            },
                            address: {
                              en: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                              it: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                              fr: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                            },
                            phone: {
                              de: '+39 0474 913440',
                              it: '+39 0474 913440',
                              fr: '+39 0474 913440',
                            },
                            fax: {
                              de: '+39 0474 914300',
                              it: '+39 0474 914300',
                              fr: '+39 0474 914300',
                            },
                            web: {
                              de: 'www.leitlhof.com',
                              it: 'www.leitlhof.com',
                              fr: 'www.leitlhof.com',
                            },
                            email: {
                              de: 'info@leitlhof.com',
                              it: 'info@leitlhof.com',
                              fr: 'info@leitlhof.com',
                            },
                          },
                        ],
                      },
                    ],
                    images: [
                      {
                        logo: 'https://www.leitlhof.com/img/footer-logo-icon.svg',
                        header: [
                          { fileName: 'Frühstück_1.jpg' },
                          { fileName: 'Frühstück_2.jpg' },
                          { fileName: 'Frühstück_3.jpg' },
                          { fileName: 'Frühstück_4.jpg' },
                          { fileName: 'Frühstück_5.jpg' },
                          { fileName: 'Frühstück_6.jpg' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                title: {
                  de: 'Abendessen',
                  en: 'dinner',
                  it: 'cena',
                  fr: 'Dîner',
                },
                slug: 'abendessen',
                code: 'V_ABENDESSEN',
                validDays: 365,
                image: [
                  {
                    width: 640,
                    height: 540,
                    fileName: 'leitlhof©bureaurabensteiner-0817.jpg',
                  },
                ],
                priceText: {
                  de: 'ab 65 €',
                  en: 'from 65 € ',
                  it: 'a partire da 65 €',
                  fr: 'à partir de € 65',
                },
                type: 'voucher',
                options: [
                  {
                    unit: {
                      per: 'person', //other options: unit (default), room [personNight, roomNight (not used probably)]
                      amount: 65,
                    },
                    title: {
                      de: 'Abendessen-Gutschein',
                      it: 'Voucher per una cena',
                      en: 'Voucher for a dinner',
                      fr: 'voucher pour le dîner',
                    },
                    description: {
                      de: 'Genießen Sie ein Abendessen bei uns mit folgendem Menü...',
                      en: 'Enjoy a dinner including the following',
                      it: 'Gustate una cena che include il seguente menu',
                      fr: 'Venez déguster notre dîner avec une sélection variée de...',
                    },
                    minAmount: 65,
                  },
                ],
                templates: [
                  // multiple templates possible
                  {
                    // labels: - if there are fixed texts
                    component: '',
                    format: 'portrait',
                    labels: {
                      title: {
                        de: 'Abendessen-Gutschein',
                        en: 'Dinner Voucher',
                        it: 'Voucher per una cena',
                        fr: 'voucher pour le dîner',
                      },
                      voucher: {
                        de: 'Gutschein',
                        en: 'Voucher',
                        it: 'Voucher',
                        fr: 'Voucher',
                      },
                      orderNo: {
                        de: 'Bestellnummer',
                        en: 'Order number',
                        it: "Numero d'ordine",
                        fr: 'Numero de commande',
                      },
                      validFrom: {
                        de: 'Ausgestellt',
                        en: 'Issued on',
                        it: 'Data di emissione',
                        fr: 'Date de création',
                      },
                      validTo: {
                        de: 'Einzulösen',
                        en: 'Valid until',
                        it: 'Da riscattare entro',
                        fr: "Date limite d'utilisation",
                      },
                      footer: [
                        {
                          name: {
                            en: 'Naturhotel Leitlhof',
                            it: 'Naturhotel Leitlhof',
                            de: 'Naturhotel Leitlhof',
                            fr: 'Naturhotel Leitlhof',
                          },
                          address: {
                            de: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                            it: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                            fr: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                          },
                          phone: {
                            de: '+39 0474 913440',
                            it: '+39 0474 913440',
                            fr: '+39 0474 913440',
                          },
                          fax: {
                            de: '+39 0474 914300',
                            it: '+39 0474 914300',
                            fr: '+39 0474 914300',
                          },
                          web: {
                            de: 'www.leitlhof.com',
                            it: 'www.leitlhof.com',
                            fr: 'www.leitlhof.com',
                          },
                          email: {
                            de: 'info@leitlhof.com',
                            it: 'info@leitlhof.com',
                            fr: 'info@leitlhof.com',
                          },
                        },
                      ],
                    },
                    images: [
                      {
                        logo: 'https://www.leitlhof.com/img/footer-logo-icon.svg',
                        header: [
                          { fileName: 'Abendessen_1.jpg' },
                          { fileName: 'Abendessen_2.jpg' },
                          { fileName: 'Abendessen_3.jpg' },
                          { fileName: 'Abendessen_4.jpg' },
                          { fileName: 'Abendessen_5.jpg' },
                          { fileName: 'Abendessen_6.jpg' },
                          { fileName: 'Abendessen_7.jpg' },
                          { fileName: 'Abendessen_8.jpg' },
                          { fileName: 'Abendessen_9.jpg' },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            //n.b. title, description and image fileName will be taken from kognitiv when not set
            title: {
              de: 'SPA-Anwendungen',
              it: 'Servizi SPA',
              en: 'SPA services',
              fr: '',
            },
            slug: 'servicevoucher',
            code: 'V_SERVICEVOUCHER',
            //priceText: "ab 28 €",
            linkText: {
              de: 'Gutschein erstellen',
              it: 'Creare un voucher',
              en: 'Create a voucher',
              fr: 'Créer un voucher',
            },
            //description: "Erstellen Sie Ihren invididuellen Gutschein aus unseren SPA-Angeboten",
            validDays: 365,
            image: [
              {
                width: 640,
                height: 540,
                fileName: 'Spa_1.jpg',
              },
            ],
            type: 'voucher',
            options: [
              {
                createTitle: {
                  de: 'Service-Gutschein erstellen',
                  it: 'Creare un voucher di servizio',
                  en: 'Create a sevice voucher',
                  fr: 'Créer un voucher de service',
                },
                editTitle: {
                  de: 'Service-Gutschein bearbeiten',
                  it: 'Modifica un voucher di servizio',
                  en: 'Change a service voucher',
                  fr: 'Modifier un voucher de service',
                },
                minAmount: 0,
              },
            ],
            serviceGroups: [
              {
                title: {
                  de: 'Körper',
                  it: 'Corpo',
                  en: 'Body',
                  fr: 'Corps',
                },
                categories: [{ categoryName: 'KOERPER' }, { categoryName: 'SPA' }, { categoryName: 'BAD' }],
              },
              {
                title: {
                  de: 'Pflege',
                  it: 'Cura',
                  en: 'care',
                  fr: 'Soins',
                },
                categories: [{ categoryName: 'PFLEGE' }, { categoryName: 'MANIK' }, { categoryName: 'Kosmetik' }],
              },
              {
                title: {
                  de: 'Paare',
                  it: 'Coppie',
                  en: 'Couples',
                  fr: 'Couples',
                },
                categories: [{ categoryName: 'ZWEI' }],
              },
            ],
            templates: [
              // multiple templates possible
              {
                // labels: - if there are fixed texts
                component: '',
                format: 'portrait',
                labels: [
                  {
                    title: {
                      de: 'Service-Gutschein',
                      en: 'Service-Voucher',
                      it: 'Voucher di servizio',
                      fr: 'Voucher de service',
                    },
                    voucher: {
                      de: 'Gutschein',
                      it: 'Voucher',
                      en: 'Voucher',
                      fr: 'Voucher',
                    },
                    orderNo: {
                      de: 'Bestellnummer',
                      it: "Numero d'ordine",
                      en: 'Order number',
                      fr: 'Numero de commande',
                    },
                    validFrom: {
                      de: 'Ausgestellt',
                      it: 'Data di emissione',
                      en: 'Date of issue',
                      fr: 'Date de création',
                    },
                    validTo: {
                      de: 'Einzulösen',
                      it: 'Da riscattare entro',
                      en: 'Valid until',
                      fr: "Date limite d'utilisation",
                    },
                    footer: [
                      {
                        name: {
                          en: 'Naturhotel Leitlhof',
                          it: 'Naturhotel Leitlhof',
                          de: 'Naturhotel Leitlhof',
                          fr: 'Naturhotel Leitlhof',
                        },
                        address: {
                          de: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                          it: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                          fr: 'Pustertalerstr. 29, 39038 Innichen, Südtirol (I)',
                        },
                        phone: {
                          de: '+39 0474 913440',
                          it: '+39 0474 913440',
                          fr: '+39 0474 913440',
                        },
                        fax: {
                          de: '+39 0474 914300',
                          it: '+39 0474 914300',
                          fr: '+39 0474 914300',
                        },
                        web: {
                          de: 'www.leitlhof.com',
                          it: 'www.leitlhof.com',
                          fr: 'www.leitlhof.com',
                        },
                        email: {
                          de: 'info@leitlhof.com',
                          it: 'info@leitlhof.com',
                          fr: 'info@leitlhof.com',
                        },
                      },
                    ],
                  },
                ],
                images: [
                  {
                    logo: 'https://www.leitlhof.com/img/footer-logo-icon.svg',
                    header: [
                      //multiple image selection per template
                      { fileName: 'Spa_1.jpg' },
                      { fileName: 'Spa_2.jpg' },
                      { fileName: 'Spa_3.jpg' },
                      { fileName: 'Spa_4.jpg' },
                      { fileName: 'Spa_5.jpg' },
                      { fileName: 'Spa_6.jpg' },
                      { fileName: 'Spa_7.jpg' },
                      { fileName: 'Spa_8.jpg' },
                      { fileName: 'Spa_9.jpg' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        labels: [
          {
            App: [
              {
                reallyDeleteVoucher: {
                  de: 'Wollen Sie den Gutschein wirklich löschen?',
                  it: 'Sei sicuro di voler cancellare il voucher?',
                  en: 'Are you sure you want to delete your voucher?',
                  fr: 'Voulez-vous vraiment annuler le voucher',
                },
                reallyDeleteAppointment: {
                  de: 'Wollen Sie den Termin wirklich löschen?',
                  it: "Sei sicuro di voler disdire l'appuntamento?",
                  en: 'Are you sure you want to cancel your appointment?',
                  fr: 'Voulez-vous vraiment annuler la réservation',
                },
              },
            ],
            IntroText: [
              {
                title: {
                  de: 'Freude schenken',
                  it: 'Regalare un sorriso',
                  en: 'Giving Joy',
                  fr: 'Faire plaisir',
                },
                description: {
                  de: 'Sie möchten einem lieben Menschen etwas Besonderes schenken? Eine kleine Auszeit vom Alltag? Dann sind unsere Geschenk-Gutscheine das Richtige für Sie! Einfach online bezahlen und der Gutschein wird schön verpackt per Post oder, wenn’s mal schneller gehen muss, per E-Mail zugeschickt. Bei Fragen und Sonderwünschen sind wir gerne behilflich!',
                  it: 'Sta cercando un regalo speciale per una persona cara? Una piccola pausa dalla vita di tutti i giorni? Allora i nostri buoni regalo sono la cosa giusta per Voi! Basta pagare online e il buono sarà inviato in confezione regalo per posta o, se deve essere più veloce, via e-mail. Siamo felici di aiutare con domande e richieste speciali!',
                  en: 'Would you like to give something special to someone you love? A little break from everyday life? Then our gift vouchers are the right thing for you! Simply pay online and the voucher will be sent to you nicely packaged by post or, if it has to be faster, by email. We are happy to help with questions and special requests!',
                  fr: "Vous désirez faire un cadeau exceptionnel, original qui sorte du quotidien? Nos bons cadeaux sont faits pour vous! C'est simple, vous payez par online et vous recevez le voucher par courrier, ou pour plus de rapidité par e-mail. Pour des demandes spéciales et pour toutes questions nous sommes à votre disposition.",
                },
              },
            ],
            //Modals - should be extended with external link function
            Shipment: [
              {
                title: {
                  de: 'Versandkosten',
                  it: 'Costi di spedizione',
                  en: 'Shipping costs',
                  fr: "Frais d'expédition",
                },
                description: {
                  de: `<b>E-Mail Versand</b><br><br> Wenn sie sich für die Versandart Gutschein per E-Mail (Print at home) entschieden haben entstehen keine Kosten. Sie oder ihr Beschenkter erhalten den Gutschein per E-Mail im .pdf Format zum speichern oder ausdrucken. Es entstehen keine Kosten.
        <br><br>

        <b>Post Versand</b><br><br> Wenn sie sich für die Versandart per Post entscheiden, übernimmt das Hotel Leitlhof die Kosten. Der Gutschein Empfänger erhält einen exklusiv verpackten Gutschein. Bitte beachten Sie, dass wir keine Haftung für den rechtzeitigen Empfang des Gutscheins übernehmen. Wir versenden die Gutscheine innerhalb 2 Werktage. Rechnen Sie bei der Bestellung per Post genügend Versandzeit der Post ein.`,
                  it: '',
                  en: '',
                  fr: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                  fr: 'Mentions légales',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Colophon',
                  en: 'Imprint text',
                  fr: 'Texte à imprimer',
                },
                link: {
                  de: '/de/impressum',
                  it: '/it/colophon',
                  en: '/en/imprint',
                  fr: '/fr/mentionslégales',
                },
              },
            ],
            Privacy: [
              {
                title: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Privacy',
                  fr: 'Protection des données',
                },
                description: {
                  de: 'Datenschutz- und Privacy',
                  it: 'Protezione dei dati e privacy',
                  en: 'Data protection and privacy',
                  fr: 'Protection des données et confidentialité',
                },
              },
            ],
            Tos: [
              {
                title: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                  fr: 'CGV',
                },
                description: {
                  de: `<b>Allgemeine Geschäftsbedingungen</b>
        <br>
        <br>
        <b>Kauf- und Lieferbedingungen</b>
        <br>
        <br>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.
        <br>
        <br>

        <b>Bestellung</b>
        <br>
        <br>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.leitlhof.com und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die Leitlhof GmbH haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der Leitlhof GmbH rückerstattet werden.
        <br>
        <br>

        Jeder Gutschein kann nur einmal eingelöst werden.
        <br>
        <br>

        <b>Mindestalter</b>
        <br>
        <br>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.
        <br>
        <br>

        <b>Preise und Produkte</b>
        <br>
        <br>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.
        <br>
        <br>

        <b>Rücktrittsrecht</b>
        <br>
        <br>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <br>
        <br>
        <b>Sicherheitsgarantie & Datenschutz</b>
        <br>
        <br>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        <br>
        <br>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die Leitlhof GmbH, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                  it: '',
                  en: '',
                  fr: '',
                },
              },
            ],
            Colophon: [
              {
                title: {
                  de: 'Impressum',
                  it: 'Informazione legale',
                  en: 'Legal information',
                  fr: 'Mentions légales',
                },
                description: {
                  de: 'Impressumtext',
                  it: 'Informazione legale',
                  en: 'Legal information',
                  fr: 'Texte à imprimer',
                },
              },
            ],
            Contact: [
              {
                title: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                  fr: 'Contact',
                },
                submit: {
                  de: 'Senden',
                  it: 'Invia',
                  en: 'Send',
                  fr: 'Envoyer',
                },
                sentMail: {
                  de: 'Danke',
                  it: 'Grazie',
                  en: 'Thank you',
                  fr: 'Merci',
                },
                subject: {
                  de: 'V-MTS | Kontakt',
                  it: 'V-MTS | Contatto',
                  en: 'V-MTS | Contact',
                  fr: 'V-MTS | Contact',
                },
              },
            ],
            ContactForm: [
              {
                subject: {
                  de: 'Betreff',
                  it: 'Soggetto',
                  en: 'Subject',
                  fr: 'Sujet ',
                },
                name: {
                  de: 'Ihr Name',
                  it: 'Il tuo nome',
                  en: 'Your name',
                  fr: 'Votre nom ',
                },
              },
            ],
            BasketItemVoucher: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                  fr: 'Nr',
                },
                quantity: {
                  de: 'Anzahl',
                  it: 'Quantità',
                  en: 'Quantity',
                  fr: '',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                  fr: 'Destinataire',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                  fr: "Message d'accueil",
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                  fr: 'Valeur',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                  fr: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                  fr: 'Modifier',
                },
              },
            ],
            BasketItemAppointment: [
              {
                no: {
                  de: 'Nr',
                  it: 'Nr',
                  en: 'No',
                  fr: 'Nr',
                },
                name: {
                  de: 'Empfänger',
                  it: 'Destinatario',
                  en: 'Recipient',
                  fr: 'Destinataire',
                },
                myself: {
                  de: 'Ich selbst',
                  it: 'Me stesso',
                  en: 'Myself',
                  fr: 'Moi même',
                },
                service: {
                  de: 'Service',
                  it: 'Service',
                  en: 'Service',
                  fr: 'Service',
                },
                appointments: {
                  de: 'Termine',
                  it: 'Appuntamenti',
                  en: 'Appointments',
                  fr: 'Rendez-vous',
                },
                persons: {
                  de: 'Pers.',
                  it: 'pers.',
                  en: 'pers.',
                  fr: 'Pers.',
                },
                value: {
                  de: 'Wert',
                  it: 'Valore',
                  en: 'Value',
                  fr: 'Valeur',
                },
                totalValue: {
                  de: 'Summe',
                  it: 'Totale',
                  en: 'Total',
                  fr: 'Total',
                },
                edit: {
                  de: 'Bearbeiten',
                  it: 'Modifica',
                  en: 'Change',
                  fr: 'Modifier',
                },
              },
            ],
            Basket: [
              {
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti per servizi',
                  en: 'Service appointments',
                  fr: 'Rendez-vous de prestations',
                },
                title: {
                  de: 'Ihr Warenkorb',
                  it: 'Il Suo carrello',
                  en: 'Your basket',
                  fr: 'Votre panier',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                  fr: 'Voucher',
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Importo totale',
                  en: 'Total',
                  fr: 'Montant total',
                },
                continue: {
                  de: 'Weiterstöbern',
                  it: 'Continua navigare',
                  en: 'Continue shopping',
                  fr: 'Continuer de naviguer',
                },
                checkout: {
                  de: 'Zur Kassa',
                  it: 'Procedi al pagamento',
                  en: 'Proceed with payment',
                  fr: 'Passer à la caisse',
                },
              },
            ],
            FooterMenu: [
              {
                shipment: {
                  de: 'Versandkosten',
                  it: "Costi d'invio",
                  en: 'Delivery charges',
                  fr: "Frais d'envois",
                },
                privacy: {
                  de: 'Datenschutz',
                  it: 'Protezione dei dati',
                  en: 'Data protection',
                  fr: 'Protection des données',
                },
                //when any of the keys with suffix "Link" is provided the footer menu links to external urls opening in new tab
                privacyLink: {
                  de: 'https://www.leitlhof.com/datenschutz-p39.html',
                  it: 'https://www.leitlhof.com/privacy-dolomiti-p86.html',
                  en: 'https://www.leitlhof.com/privacy-dolomites-p133.html',
                  fr: 'https://www.leitlhof.com/protection-donnees-p180.html',
                },
                tos: {
                  de: 'AGB',
                  it: 'CGC',
                  en: 'SBT',
                  fr: 'CGV',
                },
                tosTemplate: {
                  de: `<h2>Allgemeine Geschäftsbedingungen</h2>
        <b>Kauf- und Lieferbedingungen</b>
        Der Vertrag wird mit dem Hotel, abgeschlossen und kommt mit der Bezahlung des Gutscheins zustande.

        <b>Bestellung</b>
        Die Bestellung erfolgt in unserem Gutschein Shop auf unserer Homepage www.leitlhof.com und wird mittels Kreditkartebezahlt. Der bezahlte Gutschein wird mittels Email zugestellt und kann sofort ausgedruckt werden. Auf Wunsch kann die Zustellung des Gutscheines auch auf dem Postweg kostenlos erfolgen. Die Gutscheine sind mit einem einmaligen Code versehen, der zum Einlösen des Gutscheins erforderlich ist. Der Kunde ist für die Aufbewahrung bzw. das Handling der Gutschein-Originalvorlage selbst verantwortlich. Die Leitlhof GmbH haftet nicht für den Missbrauch der Gutscheinvorlage. Bei Verlust, Diebstahl oder unsachgemäßer Entwertung von Gutscheinen, kann der Betrag nicht von der Leitlhof GmbH rückerstattet werden.

        Jeder Gutschein kann nur einmal eingelöst werden.

        <b>Mindestalter</b>
        Zum Einkauf in unserem Internet-Shop sind nur Personen ab dem 18. Lebensjahr berechtigt.

        <b>Preise und Produkte</b>
        Die gekauften bzw. bestellten Gutscheine können nicht in bar abgelöst werden, auch nicht teilweise. Sollte die Konsumation geringer ausfallen als der Wert des Gutscheines, erhaltet der Begünstigte einen neuen Gutschein in der Höhe der Differenz.
        Die diesbezügliche Steuerquittung wird nach Zahlung direkt an den Käufer gesandt.
        Es wird keine Haftung für eine verspätete Zustellung auf dem Postweg übernommen.
        Der Gutschein ist erst dann gültig, wenn der fällige Betrag vollständig bezahlt wurde.
        Das Ausstelldatum ist auf dem Gutschein gedruckt bzw. angegeben und ist ab dem ausgestellten Datum 2 Jahre gültig ist. Der Gutschein ist innerhalb dieses Zeitraumes einzulösen.
        Die Artikel und Pakete können sich während der Gültigkeitsdauer ändern und/oder von den Angaben auf dem Gutschein abweichen.
        Sollte ein bestellter Artikel nicht mehr verfügbar sein, kann der Gutschein nach Vereinbarung mit der Hoteldirektion für andere Dienstleistungen in unserem Haus verwendet werden.

        <b>Rücktrittsrecht</b>
        Gutscheine, sollten sie nicht Ihren Vorstellungen entsprechen, können innerhalb 14 Tage zurückgegeben werden. Die schriftliche Widerrufserklärung muss innerhalb 14 Tage ab Ausstellungsdatum abgeschickt werden. Das Rücktrittsrecht kann nicht mehr in Anspruch genommen werden, wenn die Leistung innerhalb dieser Frist bereits begonnen hat.

        <b>Sicherheitsgarantie & Datenschutz</b>
        Sicherheit hat höchste Priorität! Daher werden alle persönlichen Daten wie Kreditkartennummer, Name und Anschrift bei Bezahlung mit Kreditkarten über eine geschützte SSL-Leitung übertragen. Damit werden sensible Daten im Internetverkehr unleserlich. Um für die zusätzliche Sicherheit im Gutschein Shop zu sorgen, werden eine Reihe von zusätzlichen Sicherheitsmaßnahmen angewandt.

        <b>Ermächtigung zur Verwendung von persönlichen Daten laut Art. 13 Legislativdekret nr. 196/03</b>
        Im Sinne des Legislativdekretes Nr. 196/03, nach Erhalt der Informationen über die Verwendung, ermächtige ich die Leitlhof GmbH, meine persönlichen Daten ausschließlich für die Ausstellung und Zusendung der Gutscheine sowie die Zustellung von periodischen Unterlagen über Preise und Angebote zu verwenden. Eine Weitergabe an Dritte findet nicht statt.
        `,
                },
                colophon: {
                  de: 'Impressum',
                  it: 'Colophon',
                  en: 'Imprint',
                  fr: 'Mentions légales',
                },
                colophonLink: {
                  de: 'https://www.leitlhof.com/impressum-p38.html',
                  it: 'https://www.leitlhof.com/colophon-dolomiti-p85.html',
                  en: 'https://www.leitlhof.com/imprint-dolomites-p132.html',
                  fr: 'https://www.leitlhof.com/empreinte-dolomites-p179.html',
                },
                contact: {
                  de: 'Kontakt',
                  it: 'Contatto',
                  en: 'Contact',
                  fr: 'Contact',
                },
                // contactLink: {
                //   de: 'https://www.leitlhof.com/anfrage-dolomiten-p42.html',
                //   it: '',
                //   en: '',
                //   fr: '',
                // },
              },
            ],
            Thankyou: [
              {
                title: {
                  de: 'Danke für Ihren Einkauf',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                  fr: 'Merci de votre achants',
                },
                description: {
                  de: 'Danke für Ihren Einkauf.',
                  it: 'Grazie per il Vostro acquisto',
                  en: 'Thanks for your purchase',
                  fr: 'Merci de votre achants',
                },
              },
            ],
            Categories: [
              {
                title: {
                  de: 'Wählen Sie bitte aus:',
                  it: 'Scegliere',
                  en: 'Please select',
                  fr: 'Choisissez',
                },
              },
            ],
            Voucher: [
              {
                createVoucher: {
                  de: 'Wertgutschein erstellen',
                  it: 'Creare un vuocher di valore',
                  en: 'Value voucher',
                  fr: 'Créer un voucher',
                },
                editVoucher: {
                  de: 'Wertgutschein bearbeiten',
                  it: 'Modifica voucher di valore',
                  en: 'Change value voucher',
                  fr: 'Modifier un voucher',
                },
                quantity: {
                  de: 'Anzahl Gutscheine',
                  it: 'Quantita voucher',
                  en: 'Voucher quantity',
                  fr: 'Nombre de vouchers',
                },
                persons: {
                  de: 'Personen',
                  it: 'Persone',
                  en: 'Persons',
                  fr: 'Personnes',
                },
                value: {
                  de: 'Wert:',
                  it: 'Valore',
                  en: 'Value',
                  fr: 'Valeur',
                },
                voucherValue: {
                  de: 'Gutscheinwert',
                  it: 'Valore del voucher',
                  en: 'Amount of voucher',
                  fr: 'Valeur du voucher ',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                  fr: 'Titre',
                },
                dear: {
                  de: 'Lieber',
                  it: 'Egregio/Gentile',
                  en: 'Dear',
                  fr: 'Cher',
                },
                recipientName: {
                  de: 'Empfängername',
                  it: 'Nome del destinatario',
                  en: 'Name of the recipient',
                  fr: 'Destinataire',
                },
                greetings: {
                  de: 'Grußbotschaft',
                  it: 'Messaggio di saluto',
                  en: 'Greeting message',
                  fr: "Message d'accueil",
                },
                sendVia: {
                  de: 'Senden Via',
                  it: 'Invia tramite',
                  en: 'Send by',
                  fr: 'Envoyer par ',
                },
                optionEmail: {
                  de: 'E-Mail',
                  it: 'posta elettronica',
                  en: 'email',
                  fr: 'E-Mail',
                },
                optionMail: {
                  de: 'Post',
                  it: 'Posta ordinaria',
                  en: 'mailing route',
                  fr: 'Courrier',
                },
                sendToMe: {
                  de: 'an mich senden',
                  it: 'invia a me',
                  en: 'sent to myself',
                  fr: "m'envoyer",
                },
                sendToOther: {
                  de: 'an jemand anderen senden',
                  it: "invia a un'altra persona",
                  en: 'send to someone else',
                  fr: "envoyer à quelqu'un d'autre",
                },
                recipientEmail: {
                  de: 'E-Mail-Adresse des Empfängers',
                  it: 'Indirizzo email del destinatario',
                  en: 'Email address of the recipient',
                  fr: 'Adresse E-Mail du destinataire',
                },
                addressPlaceHolder: {
                  de: 'Straße, Platz + Nr',
                  it: 'Via, Piazza + Nr',
                  en: 'Street, place + no',
                  fr: 'Nr + Rue, Place',
                },
                address: {
                  de: 'Adresse',
                  it: 'Indirizzo',
                  en: 'Address',
                  fr: 'Adresse',
                },
                zipPlaceHolder: {
                  de: 'PlZ',
                  it: 'CAP',
                  en: 'ZIP',
                  fr: 'CP',
                },
                zip: {
                  de: 'Postleitzahl',
                  it: 'Codice avviamento postale',
                  en: 'postcode',
                  fr: 'Code postal',
                },
                placePlaceHolder: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                  fr: 'Place',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                  fr: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                  fr: 'Pays',
                },
                saveChanges: {
                  de: 'Änderungen speichern',
                  it: 'Salva modifiche',
                  en: 'Save changes',
                  fr: 'Sauvegarder les modifications',
                },
                addToBasket: {
                  de: 'Hinzufügen zum Warenkorb',
                  it: 'Aggiungi al carrello',
                  en: 'Add to the basket',
                  fr: 'Ajouter au panier',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                  fr: 'Retour',
                },
                serviceSelection: {
                  de: 'Leistungsauswahl',
                  it: 'Selezione dei servizi',
                  en: 'Selection of services',
                  fr: 'Sélection de prestations',
                },
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                  fr: 'Catégorie',
                },
              },
            ],
            Appointment: [
              {
                serviceCategory: {
                  de: 'Kategorie:',
                  it: 'Categoria',
                  en: 'Category',
                  fr: 'Catégorie',
                },
                back: {
                  de: 'Zurück',
                  it: 'Indietro',
                  en: 'Back',
                  fr: 'Retour',
                },
                createServiceAppointment: {
                  de: 'SPA-Termin vormerken',
                  it: 'Prenotare appuntamento SPA',
                  en: 'Make a SPA appointment',
                  fr: 'Noter le rendez-vous SPA',
                },
              },
            ],
            Template: [
              {
                serviceTitle: {
                  de: 'Leistungen',
                  it: 'Servizi',
                  en: 'Services',
                  fr: 'Sélection de prestations',
                },
              },
            ],
            Checkout: [
              {
                title: {
                  de: 'Kassa',
                  it: 'Cassa',
                  en: 'Checkout',
                  fr: 'Caisse',
                },
                paynow: {
                  de: 'Gutscheine bezahlen',
                  it: 'Pagamento del voucher',
                  en: 'Voucher payment',
                  fr: 'Paiement par voucher',
                },
                requestnow: {
                  de: 'Termine anfragen',
                  it: 'Richiedere un appuntamento',
                  en: 'Request an appointment',
                  fr: 'Demandes des dates de rendez-vous',
                },
                voucher: {
                  de: 'Gutscheine',
                  it: 'Voucher',
                  en: 'Voucher',
                  fr: 'Vouchers',
                },
                appointment: {
                  de: 'Service-Termine',
                  it: 'Appuntamenti servizio',
                  en: 'Service appointments',
                  fr: 'Rendez-vous de prestations',
                },
                personalData: {
                  de: 'Ihre Daten',
                  it: 'I suoi dati',
                  en: 'Your data',
                  fr: 'Votre coordonnées',
                },
                appointmentNotice: {
                  de: 'Terminvereinbarungen müssen vom Hotel bestätigt werden und werden vor Ort bezahlt, sobald ein Termin wahrgenommen wird.',
                  it: 'Appuntamenti devono essere confermati dal nostro hotel e sono pagati direttamente sul posto',
                  en: 'Appointments need to be confirmed by our hotel and are paid on site at the time of your appointment',
                  fr: `'Les rendez-vous doivent être confirmés par l'hôtel et seront payés sur place une fois le rendez-vous pris.`,
                },
                total: {
                  de: 'Gesamtbetrag:',
                  it: 'Totale',
                  en: 'Total',
                  fr: 'Montant total',
                },
                salutation: {
                  de: 'Anrede',
                  it: 'Titolo',
                  en: 'Title',
                  fr: 'Titre',
                },
                salutationOptions: {
                  de: ['Herr', 'Frau', 'Familie'],
                  it: ['Signor', 'Signora', 'Famiglia'],
                  en: ['Mr.', 'Mrs.', 'Family'],
                  fr: ['Monsieur', 'Madame', 'Famille'],
                },
                title: {
                  de: 'Titel',
                  it: 'Titolo',
                  en: 'Title',
                  fr: 'Titre',
                },
                firstName: {
                  de: 'Vorname',
                  it: 'Nome',
                  en: 'first name',
                  fr: 'Prénom',
                },
                lastName: {
                  de: 'Nachname',
                  it: 'Cognome',
                  en: 'last name',
                  fr: 'Nom',
                },
                phone: {
                  de: 'Telefon',
                  it: 'Telefono',
                  en: 'Phone',
                  fr: 'Téléphone',
                },
                email: {
                  de: 'E-Mail-Adresse',
                  it: 'Indirizzo email',
                  en: 'Email address',
                  fr: 'Adresse E-Mail',
                },
                emailConfirm: {
                  de: 'E-Mail-Adresse bestätigen',
                  it: 'Conferma indirizzo email',
                  en: 'Confirm email address',
                  fr: "Confirmer l'adresse E-Mail",
                },
                sendInvoice: {
                  de: 'Schicken Sie mir eine Rechnung',
                  it: 'Richiesta fattura',
                  en: 'Please send me an invoice',
                  fr: 'Je vous prie de me faire parvenir la facture',
                },
                streetNo: {
                  de: 'Straße / Nr.',
                  it: 'Via / n°',
                  en: 'Street / n°',
                  fr: 'Nr. / Rue',
                },
                zip: {
                  de: 'PLZ',
                  it: 'CAP',
                  en: 'ZIP',
                  fr: 'CP',
                },
                place: {
                  de: 'Ort',
                  it: 'Localita',
                  en: 'Place',
                  fr: 'Place',
                },
                country: {
                  de: 'Land',
                  it: 'Paese',
                  en: 'Country',
                  fr: 'Pays',
                },
                company: {
                  de: 'Firma',
                  it: 'Ditta',
                  en: 'Company',
                  fr: 'Société',
                },
                vatId: {
                  de: 'MwSt.Nr.',
                  it: 'Partita IVA',
                  en: 'VAT number',
                  fr: 'Nr. de la taxe',
                },
                invoice: {
                  de: 'Bitte schicken Sie mir eine Rechnung',
                  it: 'Richiesta invio fattura',
                  en: 'Please send me an invoice',
                  fr: 'Je vous prie de me faire parvenir la facture',
                },
                acceptPrivacy: {
                  de: 'Ich akzeptiere die Datenschutzvereinbarung und erkläre mich mit der Speicherung meiner Daten zur Bestellabwicklung einverstanden.',
                  it: "Accetto le norme in materia di protezione dei dati e l'uso dei miei dati personali per lo svolgimento dell'ordine.",
                  en: 'I agree on privacy policy and the use of my personal data for this purchase.',
                  fr: "J'accepte les conditions de protection des données et je suis d'accord que mes données soient enregistrées pour le traitement de cette commande",
                },
                sameForBilling: {
                  de: 'Rechnungsadresse entspricht der obigen',
                  it: 'Indirizzio di fatturazione sorrisponde a quello sopra indicato',
                  en: 'Billing address corresponds to the one indicated above',
                  fr: "L'adresse de facturation correspond à ce qui précède",
                },
                pecEmail: {
                  de: 'PEC E-Mail-Adresse',
                  it: 'Indirizzo email PEC',
                  en: 'PEC email address',
                  fr: 'Adresse E-Mail PEC',
                },
                sdiCode: {
                  de: 'SDI-Code',
                  it: 'Codice SDI',
                  en: 'SDI code',
                  fr: 'Code SDI',
                },
                emailSubjectSentToMe: {
                  de: 'Gutschein vom Hotel Leitlhof',
                  it: 'Voucher dall’Hotel Leitlhof',
                  en: 'Voucher of the Hotel Leitlhof',
                  fr: "Bon d'achat/voucher de l'hôtel Leitlhof",
                },
                emailTemplateSentToMe: {
                  de: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>vielen Dank, dass Sie sich für einen Gutschein bei uns im Haus entschieden haben.</p>\
            <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
            Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
            <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
            <p><em>Ihr Hotel Leitlhof Team</em></p>',
                  it: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per il nostro hotel.</p>\
            <p>In allegato trova il voucher in formato pdf. Il voucher è stato registrato presso la nostra reception.<br>\
              Può stamparlo oppure riscattare il voucher via smartphone direttamente presso la nostra reception.<p> \
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Hotel Leitlhof</em></p>',
                  en: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing our hotel for purchasing a voucher.</p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at our reception.<br>\
              You can either print the voucher, or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Hotel Leitlhof</em><p>',
                  fr: "<p>{{ firstname }} {{ lastname }},</p>\
        <p>Merci d'avoir choisi un bon d'achat (voucher) dans notre hôtel.</p>\
        <p>Vous trouverez ci-joint ce bon  au format .pdf. Il a été enregistré à la réception.</p>\
        <p>Vous pouvez l'imprimer ou l'échanger à l'aide de votre smartphone à la réception.</p>\
        <p>C'est avec plaisir que nous vous accueillerons parmi nous</p>\
        <p><em>Votre équipe de l'Hôtel Leitlhof</em></p>",
                },
                emailSubjectConfirmToMe: {
                  de: 'Gutschein von {{ firstname }} {{ lastname }} für {{ name }} vom Hotel Leitlhof',
                  it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per {{ name }} per l’ Hotel Leitlhof',
                  en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Hotel Leitlhof',
                  fr: "Bon d'achat/voucher de {{ firstname }} {{ lastname }} pour {{ name }} de l'hôtel Leitlhof",
                },
                emailTemplateConfirmToMe: {
                  de: '<p>{{ firstname }} {{ lastname }},</p>\
             <p>vielen Dank, dass Sie sich für einen Gutschein für {{ name }} bei uns im Haus entschieden haben.</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an {{ name }} gesandt und an unserer Rezeption registriert.<br>\
             Sie können den Gutschein ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Hotel Leitlhof Team</em></p>',
                  it: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>grazie per aver scelto un voucher per {{ name }} per il nostro hotel.</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato inviato a {{ name }} e registrato presso la nostra reception.<br>\
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura.</p> \
            <p><em>Il team dell’ Hotel Leitlhof</em></p>',
                  en: '<p>{{ firstname }} {{ lastname }},</p>\
            <p>Thank you for choosing a voucher for {{ name }} for our hotel.</p> \
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been sent to {{ name }} and registered at the reception.<br>\
            You can either print the voucher or redeem the voucher by smartphone directly at our reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours sincerely,</p>\
            <p><em>The team of Hotel Leitlhof </em></p>',
                  fr: "<p>{{ firstname }} {{ lastname }},</p>\
        <p>Merci d'avoir choisi un bon d'achat (voucher) pour {{ name }} dans notre hôtel</p>\
        <p>Vous trouverez ci-joint ce bon au format .pdf. Il a été envoyé à {{ name }} et enregistré à la réception.</p>\
        <p>Vous pouvez l'imprimer  ou l'échanger à l'aide de votre smartphone à la réception.</p>\
        <p>C'est avec plaisir que nous vous accueillerons parmi nous</p>\
        <p><em>Votre équipe de l' Hôtel Leitlhof</em></p>",
                },
                emailSubjectSentToOther: {
                  de: 'Gutschein von {{ firstname }} {{ lastname }} vom Hotel Leitlhof',
                  it: 'Voucher acquistato da {{ firstname }} {{ lastname }} per l’ Hotel Leitlhof',
                  en: 'Voucher purchased by {{ firstname }} {{ lastname }} for the Hotel Leitlhof',
                  fr: "Bon d'achat/voucher de {{ firstname }} {{ lastname }} de l'hôtel Leitlhof",
                },
                emailTemplateSentToOther: {
                  de: '<p>{{ name }},</p>\
             <p>für Sie wurde von {{ firstname }} {{ lastname }} ein Gutschein bei uns im Haus hinterlegt:</p>\
             <p></p>\
             <p>Anbei finden Sie den Gutschein in .pdf Format. Der Gutschein wurde an unserer Rezeption registriert.<br>\
             Sie können den Gutschein Ausdrucken oder per Smartphone an unserer Rezeption einlösen.</p>\
             <p>Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.</p>\
             <p><em>Ihr Hotel Leitlhof Team</em></p>',
                  it: '<p>{{ name }},</p>\
            <p>{{ firstname }} {{ lastname }} ha acquistato un voucher per il nostro hotel per Lei:</p>\
            <p></p>\
            <p>In allegato trova il voucher in formato .pdf. Il voucher è stato registrato presso la nostra reception.<br> \
            Può stamparlo oppure riscattare il buono via smartphone direttamente presso la nostra reception.</p>\
            <p>Siamo lieti di darle il benvenuto presso la nostra struttura. </p>\
            <p><em>Il team dell’ Hotel Leitlhof</em></p>',
                  en: '<p>{{ name }},</p>\
            <p>a voucher purchased by {{ firstname }} {{ lastname }} has been registered at our hotel:</p>\
            <p></p>\
            <p>Attached you find the voucher in .pdf format. The voucher has been registered at the reception.<br>\
            You can either print this voucher or redeem it by smartphone directly at the reception.</p>\
            <p>We are looking forward to welcoming you.</p>\
            <p>Yours, sincerely</p>\
            <p><em>The team of Hotel Leitlhof</em></p>',
                  fr: "<p>{{ name }},</p>\
        <p>Un bon d'achat (voucher) de {{ firstname }} {{ lastname }} a été déposé dans notre hôtel.</p>\
        <p>Vous trouverez ci-joint ce bon au format .pdf. Il a été enregistré à la réception.</p>\
        <p>Vous pouvez l'imprimer ou l'échanger à l'aide de votre smartphone à la réception.</p>\
        <p>C'est avec plaisir que nous vous accueillerons parmi nous</p>\
        <p><em>Votre équipe Hotel Leitlhof</em></p>",
                },
              },
            ],
            PaymentFailed: [
              {
                title: {
                  de: 'Zahlung fehlgeschlagen',
                  it: 'Pagamento fallito',
                  en: 'Payment failed',
                  fr: 'Paiement non effectué',
                },
                description: {
                  de: 'Lieber {name}, d.',
                  it: 'Caro/a {name}',
                  en: 'Dear {name}',
                  fr: 'Cher {name}, d.',
                },
              },
            ],
            PageNotFound: [
              {
                title: {
                  de: 'Seite nicht gefunden',
                  it: 'Pagina non trovata',
                  en: 'Page not found',
                  fr: 'Page non trouvée',
                },
                description: {
                  de: 'Die angegebene Adresse entspricht keiner bekannten Seite.',
                  it: `L'indirizzo indicato non corrisponde a nessun sito raggiungibile`,
                  en: 'The indicated address does not match any common site',
                  fr: `'L'adresse indiquée ne correspond à aucun site connu.`,
                },
                backToStart: {
                  de: 'Zurück zur Startseite',
                  it: 'Torna alla pagina inizale',
                  en: 'Back to the homepage',
                  fr: `'L'adresse indiquée ne correspond à aucun site connu.`,
                },
              },
            ],
          },
        ],
      },
    },
  ],
}

const findStyles = ({ content, target, languages = [] }) => {
  return content.reduce((acc, contentItem) => {
    const data = {
      ...acc,
      ...(contentItem[target] && contentItem[target]),
      ...(contentItem.components &&
        Array.isArray(contentItem.components) &&
        findStyles({ content: contentItem.components, target, languages })),
      ...(contentItem.props &&
        Array.isArray(contentItem.props) &&
        findStyles({ content: contentItem.props, target, languages })),
      ...(contentItem.blockProps &&
        Array.isArray(contentItem.blockProps) &&
        findStyles({ content: contentItem.blockProps, target, languages })),
      ...(contentItem.blockProps &&
        languages.reduce((acc, lang) => {
          const isKeyd = contentItem.blockProps[lang]?.[target]?.[0]
          const isNonLanguage = contentItem.blockProps[target]

          return {
            ...acc,
            ...(isKeyd && isKeyd),
            ...(!isKeyd &&
              ((contentItem.blockProps[lang]?.[target] && contentItem.blockProps[lang][target]) || isNonLanguage)),
          }
        }, {})),
    }

    return data
  }, {})
}

const applyStyles = ({ content, languages }) => {
  return content.map((contentItem) => {
    const styles = findStyles({ content: [contentItem], target: 'styles', languages })
    console.log('++++++++++++++')
    console.log({ styles })
    return { ...contentItem, default: true, styles }
  })
}

const applyFonts = (styledContent) => Object.values(styledContent)

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const handler = nextConnect()
handler.use(middleware)
// handler.use(cors)
handler.get(async (req, res) => {
  const {
    query: { version, client, domain: origin, productName, id },
  } = req

  console.log({ origin })
  const domain = origin && (await getDomainByUrl(req, origin))
  console.log({ domain })
  if (!domain) {
    res.status(404).json({ error: 'No data found', data: null })
    return
  }
  // console.log({ origin })
  // console.log({ client })
  const domainClient = domain && origin && (await getClient(req, client))
  // console.log({ domainClient })
  const domainName = domain && domain.name
  const domainUrl = domain && domain.url
  // console.log({ domainUrl })
  const product =
    domainClient?.domains?.find((d) => d.toString() === domain._id.toString()) &&
    (await getProduct(req, origin, productName === 'mmts' ? 'vmts' : productName, version || 0))

  const content = product && (await getContent(req, product.contentId))
  console.log({ product })
  const languages = content?.reduce((acc, contentItem) => {
    return [...acc, ...contentItem.languages]
  }, []) || ['de']

  console.log({ languages })

  const contentStyled = content && applyStyles({ content, languages })
  // console.log('==== contentStyled ====')
  // console.log({ contentStyled })
  const contentWithFonts = contentStyled && applyFonts(contentStyled)
  // console.log('==== contentWithFonts ====')
  // console.log({ contentWithFonts })
  // console.log(productName === 'vmts' && client === 'u1013' && origin === 'cavirginia.it')
  // console.log({ productName })
  // console.log({ client })
  // console.log({ origin })
  // const styles = (content && product?.type === 'widget' && findStyles({ content, target: 'styles', languages })) || {}
  console.log({ productName })
  if (!content || isEmpty(content)) {
    // &&
    // (productName === 'vmts' && client === 'u1013' && origin === 'cavirginia.it')
    // && productName !== 'services'
    res.status(404).json({ error: 'No data found', data: null })
    return
  }
  // else if (productName === 'iiq-mts' && client === 'u0724') {
  //   res.setHeader('Access-Control-Allow-Origin', '*')
  //   res.status(200).json({
  //     error: null,
  //     data: {
  //       ...product,
  //       domainUrl,
  //       domainName,
  //       clientId: client,
  //       domainId: domain._id,
  //       content: [iiqMtsConfigLeitlhof],
  //       productionVersion: version,
  //     },
  //   })
  //   return
  // }
  else if (productName === 'vmts' && client === 'u0724' && origin === 'leitlhof.com') {
    // console.log('Leitlhof VMTS')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        // content: applyFonts(applyStyles({ vmtsConfigLeitlhof, languages })),
        content: [vmtsConfigLeitlhof],
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  } else if (productName === 'vmts' && client === 'u0699' && origin === 'villaverde-meran.com') {
    console.log('villaverde')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        // content: applyFonts(applyStyles({ vmtsConfigVillaVerde, languages })),
        content: [vmtsConfigVillaVerde],
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  } else if (productName === 'vmts' && client === 'u1065' && origin === 'villaverde-meran.com') {
    console.log('villaverde')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        // content: applyFonts(applyStyles({ vmtsConfigVillaVerde, languages })),
        content: [vmtsConfigVillaVerde2],
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  } else if (productName === 'mmts' && client === 'u0699' && origin === 'villaverde-meran.com') {
    console.log('villaverde mmts')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        content: [mmtsConfigVillaVerde],
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  } else if (productName === 'vmts' && client === 'u1013' && origin === 'cavirginia.it') {
    // console.log("Country House Ca'Virginia VMTS")
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        content: [vmtsConfigCaVirginia],
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  }
  // else if (productName === 'services' && client === 'u1014') {
  //   // console.log("Country House Ca'Virginia VMTS")
  //   console.log('Tratterhof Services')
  //   res.setHeader('Access-Control-Allow-Origin', '*')
  //   res.status(200).json({
  //     error: null,
  //     data: {
  //       ...product,
  //       domainUrl,
  //       domainName,
  //       clientId: client,
  //       domainId: domain._id,
  //       content: [servicesConfigTratterhof],
  //       productionVersion: version,
  //     },
  //   })
  //   return
  // }
  else if (productName === 'iiq-mts' && client === 'u0500' && origin === 'ludwigshof.it') {
    // console.log('Ludwigshof IIQ')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        content: [iiqMtsConfigLudwigshof],
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  } else {
    // console.log('======= VERSION ========')
    // console.log({ version })
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      error: null,
      data: {
        ...product,
        domainUrl,
        domainName,
        clientId: client,
        domainId: domain._id,
        content: contentWithFonts,
        productionVersion: version,
        ...(id && { id }),
      },
    })
    return
  }
})

export default handler
