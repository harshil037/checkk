const customProps = [
  // * TEXT
  {
    inputType: 'text',
    type: 'string',
    key: 'text',
    label: {
      en: 'Text Label',
    },
    // optional properties
    description: {
      en: 'Text description',
    },
    placeholder: {
      en: 'Text placeholder',
    },
    defaultValue: {
      en: 'Text default value',
    },
    validation: {
      required: true,
    },
  },
  // * LANGUAGE BASED TEXT
  {
    inputType: 'text',
    type: 'string',
    key: 'textLang',
    label: {
      en: 'Text Label En',
      it: 'Text Label It',
      de: 'Text Label De',
    },
    languages: true,
    // optional properties
    description: {
      en: 'Text description en',
      it: 'Text description it',
      de: 'Text description de',
    },
    placeholder: {
      en: 'Text placeholder en',
      it: 'Text placeholder it',
      de: 'Text placeholder de',
    },
    defaultValue: {
      en: 'Text default value en',
      it: 'Text default value it',
      de: 'Text default value de',
    },
    validation: {
      required: true,
    },
  },
  // * SELECT
  {
    inputType: 'select',
    type: 'string',
    key: 'select',
    label: {
      en: 'Select Label',
    },
    options: [
      { title: 'OPTION1', value: 'value1' },
      { title: 'OPTION2', value: 'value2' },
      { title: 'OPTION3', value: 'value3' },
    ],
    // optional properties
    description: {
      en: 'en description',
    },
    placeholder: {
      en: 'en placeholder',
    },
    defaultValue: {
      value: { en: 'value3' },
    },
    validations: {
      required: true,
    },
  },
  // * LANGUAGE BASED SELECT
  {
    inputType: 'select',
    type: 'string',
    key: 'selectLang',
    label: {
      en: 'SELECT EN Label',
      it: 'SELECT IT Label',
      de: 'SELECT DE Label',
    },
    languages: true,
    options: [
      {
        title: { en: 'EN OPTION1', it: 'IT OPTION1', de: 'DE OPTION1' },
        value: { en: 'enValue1', it: 'itValue1', de: 'deValue1' },
      },
      {
        title: { en: 'EN OPTION2', it: 'IT OPTION2', de: 'DE OPTION2' },
        value: { en: 'enValue2', it: 'itValue2', de: 'deValue2' },
      },
      {
        title: { en: 'EN OPTION3', it: 'IT OPTION3', de: 'DE OPTION3' },
        value: { en: 'enValue3', it: 'itValue3', de: 'deValue3' },
      },
    ],
    // optional properties
    description: {
      en: 'en description',
      it: 'it description',
      de: 'de description',
    },
    placeholder: {
      en: 'en placeholder',
      it: 'it placeholder',
      de: 'de placeholder',
    },
    defaultValue: {
      value: {
        en: 'enValue2',
        de: 'deValue3',
        // it: 'enValue1',
      },
    },
    validations: {
      required: true,
    },
  },
  // * TOGGLE
  {
    inputType: 'toggle',
    type: 'boolean',
    key: 'toggle',
    label: {
      en: 'toggle',
    },
    // optional properties
    description: {
      en: 'en description',
    },
    defaultValue: {
      en: true,
    },
  },
  // * RTE
  {
    inputType: 'rte',
    type: 'string',
    key: 'rteKey',
    label: {
      en: 'RTE LABEL',
    },
    // optional properties
    description: {
      en: 'en description',
    },
    placeholder: {
      en: 'en placeholder',
    },
    defaultValue: {
      en: 'en default value',
    },
  },
  // * LANGUAGE BASED RTE
  {
    inputType: 'rte',
    type: 'string',
    key: 'demoRTELang',
    label: {
      en: 'RTE EN Label',
      it: 'RTE IT Label',
      de: 'RTE DE Label',
    },
    languages: true,
    // optional properties
    description: {
      en: 'EN description',
      it: 'IT description',
      de: 'DE description',
    },
    placeholder: {
      en: 'EN placeholder',
      it: 'IT placeholder',
      de: 'DE placeholder',
    },
    defaultValue: {
      en: 'EN defaultValue',
      it: 'IT defaultValue',
      de: 'DE defaultValue',
    },
  },
  // * STATIC LIST
  {
    inputType: 'staticList',
    type: 'object',
    key: 'demoStaticList',
    label: {
      en: 'STATIC Label',
    },
    props: [
      {
        inputType: 'text',
        type: 'string',
        key: 'title',
        label: {
          en: 'STATIC LIST TEXT',
        },
        description: {
          en: 'en help description',
        },
        placeholder: {
          en: 'en placeholder',
        },
        defaultValue: {
          en: 'en defaultValue',
        },
      },
      {
        inputType: 'rte',
        type: 'string',
        key: 'demoRTE',
        label: {
          en: 'STATIC LIST RTE',
        },
        placeholder: {
          en: 'STATIC LIST RTE',
        },
        description: {
          en: 'STATIC LIST RTE',
        },
      },
    ],
    // optional properties
    description: {
      en: 'en this is a object of items',
    },
    tabView: true, //*optional* boolean value to show static list in tabView
  },
  // * LIST
  {
    inputType: 'list',
    type: 'array',
    key: 'demoList',
    label: {
      en: 'LIST Label',
    },
    props: [
      {
        inputType: 'text',
        type: 'string',
        key: 'title',
        label: {
          en: 'LIST TEXT',
        },
        description: {
          en: 'en help description',
        },
        placeholder: {
          en: 'en placeholder',
        },
        defaultValue: {
          en: 'en defaultValue',
        },
      },
      {
        inputType: 'rte',
        type: 'string',
        key: 'demoRTE',
        label: {
          en: 'LIST RTE',
        },
        description: {
          en: 'EN description',
        },
        placeholder: {
          en: 'EN placeholder',
        },
        defaultValue: {
          en: 'EN defaultValue',
        },
      },
    ],
    // optional properties
    description: {
      en: 'en this is a list of items',
    },
    tabView: true, //*optional* boolean value to show list in tabView
    nested: true, //*optional* boolean value to nest list inside list
    maxNesting: 4, //*optional* number value for maximum number of inside nesting
  },
  // * ARRAY
  {
    inputType: 'array',
    type: 'string',
    key: 'demoArray',
    label: {
      en: 'ARRAY Label',
    },
    // optional properties
    description: {
      en: 'EN description',
    },
    placeholder: {
      en: 'EN placeholder',
    },
    defaultValue: [
      {
        key: {
          en: 'item1',
        },
      },
      {
        key: {
          en: 'item2',
        },
      },
      {
        key: {
          en: 'item3',
        },
      },
    ],
  },
  // * LANGUAGE BASED ARRAY
  {
    inputType: 'array',
    type: 'string',
    key: 'demoArrayLang',
    label: {
      en: 'Array Language Based',
    },
    languages: true,
    // optional properties
    description: {
      en: 'EN description',
      it: 'it description',
      de: 'de description',
    },
    placeholder: {
      en: 'EN placeholder',
      it: 'it placeholder',
      de: 'de placeholder',
    },
    defaultValue: [
      {
        key: {
          en: 'en item1',
          it: 'it item1',
          de: 'de item1',
        },
      },
      // {
      //   key: {
      //     en: "item2",
      //     it: "item2",
      //     de: "item2",
      //   },
      // },
      // {
      //   key: {
      //     en: "item3",
      //     it: "item3",
      //     de: "item3",
      //   },
      // },
    ],
  },
  // * RADIO
  {
    inputType: 'radio',
    type: 'string',
    key: 'demoRadio',
    label: {
      en: 'RADIO',
    },
    options: [
      { title: 'Option1', value: 'value1' },
      { title: 'Option2', value: 'value2' },
    ],
    // optional properties
    description: {
      en: 'Demo Radio',
    },
    defaultValue: {
      en: 'value2',
    },
  },
  // * RADIO LANGUAGE BASED
  {
    inputType: 'radio',
    type: 'string',
    key: 'demoRadioLang',
    label: {
      en: 'RADIO LANGUAGE BASED',
    },
    languages: true,
    options: [
      {
        title: { en: 'Option1', it: 'itOption1', de: 'deOption1' },
        value: { en: 'value1', it: 'itValue1', de: 'deValue1' },
      },
      {
        title: { en: 'Option2', it: 'itOption2', de: 'deOption2' },
        value: { en: 'value2', it: 'itValue2', de: 'deValue2' },
      },
    ],
    // optional properties
    description: {
      en: 'en Demo Radio',
      it: 'it Demo Radio',
      de: 'de Demo Radio',
    },
    defaultValue: {
      en: 'value1',
      it: 'itValue2',
      de: 'deValue1',
    },
  },

  // * KEYED INPUT
  {
    inputType: 'keyedInput',
    type: 'array or object',
    key: 'demoKI',
    label: {
      en: 'KeyedInput en',
    },
    description: {
      en: 'en description',
    },
    // optional properties
    placeholder: {
      key: {
        en: 'key',
      },
      value: {
        en: 'value',
      },
    },
    defaultValue: [
      {
        key: 'dynamic key1',
        value: {
          en: 'dynamic value1',
        },
      },
      {
        key: 'dynamic key1',
        value: {
          en: 'dynamic value1',
        },
      },
    ],
  },
  // * KEYED INPUT LANGUAGE BASED
  {
    inputType: 'keyedInput',
    type: 'array or object',
    key: 'demoKILanguage',
    label: {
      en: 'KeyedInput en',
      it: 'KeyedInput it',
      de: 'KeyedInput de',
    },
    languages: true,
    // optional properties
    description: {
      en: 'en description',
      it: 'it description',
      de: 'de description',
    },
    placeholder: {
      key: {
        en: 'key en',
        it: 'it key',
        de: 'de key',
      },
      value: {
        en: 'value en',
        it: 'it value',
        de: 'de value',
      },
    },
    defaultValue: [
      {
        key: 'key1',
        value: {
          en: 'en value1',
          de: 'de value1',
          it: 'it value1',
        },
      },
      {
        key: 'key2',
        value: {
          en: 'en value 2',
          it: 'it value 2',
          de: 'de value 2',
        },
      },
    ],
  },
  // * LINK
  {
    inputType: 'link',
    type: 'string',
    key: 'demoLink',
    label: {
      en: 'Link',
    },
    // optional properties
    description: {
      en: 'link',
    },
    defaultValue: {
      title: { en: 'link title' },
      link: { en: 'en link' },
      targetBlank: { en: true },
    },
    placeholder: {
      title: { en: 'en title1' },
      link: { en: 'en link1' },
    },
  },
  // * LINK LANGUAGE BASED
  {
    inputType: 'link',
    type: 'string',
    key: 'demoLinkLang',
    label: {
      en: 'Demo Link Lang EN',
      de: 'Demo Link Lang DE',
      it: 'Demo Link Lang IT',
    },
    languages: true,
    // optional properties
    description: {
      en: 'description EN',
      de: 'description DE',
      it: 'description IT',
    },
    defaultValue: {
      title: {
        en: 'link title en',
        it: 'link title it',
        de: 'link title de',
      },
      link: {
        en: 'link en',
        it: 'link it',
        de: 'link de',
      },
      targetBlank: {
        en: true,
        de: false,
        it: true,
      },
    },
    placeholder: {
      title: { en: 'en title1', it: 'it title1', de: 'de title1' },
      link: { en: 'en link1', it: 'it link1', de: 'de link1' },
    },
  },
  // * COLOR
  {
    inputType: 'color',
    type: 'string',
    key: 'demoColor',
    label: {
      en: 'Color Primary',
    },
    // optional properties
    description: {
      en: 'link',
    },
    defaultValue: {
      en: '#891010',
    },
  },
  // * FLIP BOOK PDF
  {
    inputType: 'flipBookPdf',
    type: 'string',
    key: 'demoPdf',
    label: {
      en: 'Demo Pdf',
    },
  },
  // * IMAGE UPLOAD
  // {
  //   inputType: "imageUpload",
  //   type: "string",
  //   key: "demoImageUpload",
  //   label: {
  //     en: "Demo Image Upload",
  //   },
  // },
  // * MULTI SELECT
  // {
  //   inputType: "multiSelect",
  //   type: "string",
  //   key: "languages123",
  //   label: {
  //     en: "Languages",
  //   },
  //   options: [
  //     { title: "Germany", value: "de" },
  //     { title: "Italian", value: "it" },
  //     { title: "English", value: "en" },
  //     { title: "French", value: "fr" },
  //     { title: "Dutch", value: "nl" },
  //     { title: "Czech", value: "cs" },
  //     { title: "Russe", value: "ru" },
  //   ],
  //   // optional properties
  //   description: {
  //     en: "multi selection ",
  //   },
  //   placeholder: {
  //     en: "Languages",
  //   },
  //   defaultValue: {
  //     value: { en: ["en", "cs"] },
  //   },
  // },
  // * MULTI SELECT LANGUAGE BASED
  // {
  //   inputType: "multiSelect",
  //   type: "string",
  //   key: "demoMultiSelectLang",
  //   label: {
  //     en: "country",
  //     it: "nazione",
  //     de: "land",
  //   },
  //   languages: true,
  //   options: [
  //     {
  //       title: {
  //         en: "EN OPTION1",
  //         it: "IT OPTION1",
  //         de: "DE OPTION1",
  //       },
  //       value: {
  //         en: "enValue1",
  //         it: "itValue1",
  //         de: "deValue1",
  //       },
  //     },
  //     {
  //       title: {
  //         en: "EN OPTION2",
  //         it: "IT OPTION2",
  //         de: "DE OPTION2",
  //       },
  //       value: {
  //         en: "enValue2",
  //         it: "itValue2",
  //         de: "deValue2",
  //       },
  //     },
  //     {
  //       title: {
  //         en: "EN OPTION3",
  //         it: "IT OPTION3",
  //         de: "DE OPTION3",
  //       },
  //       value: {
  //         en: "enValue3",
  //         it: "itValue3",
  //         de: "deValue3",
  //       },
  //     },
  //     {
  //       title: {
  //         en: "EN OPTION4",
  //         it: "IT OPTION4",
  //         de: "DE OPTION4",
  //       },
  //       value: {
  //         en: "enValue4",
  //         it: "itValue4",
  //         de: "deValue4",
  //       },
  //     },
  //     {
  //       title: {
  //         en: "EN OPTION5",
  //         it: "IT OPTION5",
  //         de: "DE OPTION5",
  //       },
  //       value: {
  //         en: "enValue5",
  //         it: "itValue5",
  //         de: "deValue5",
  //       },
  //     },
  //     {
  //       title: {
  //         en: "EN OPTION6",
  //         it: "IT OPTION6",
  //         de: "DE OPTION6",
  //       },
  //       value: {
  //         en: "enValue6",
  //         it: "itValue6",
  //         de: "deValue6",
  //       },
  //     },
  //     {
  //       title: {
  //         en: "EN OPTION7",
  //         it: "IT OPTION7",
  //         de: "DE OPTION7",
  //       },
  //       value: {
  //         en: "enValue7",
  //         it: "itValue7",
  //         de: "deValue7",
  //       },
  //     },
  //   ],
  //   // optional properties
  //   description: {
  //     it: "Seleziona il paese",
  //     en: "select country",
  //     de: "selecteer land",
  //   },
  //   placeholder: {
  //     en: "english placeholder",
  //     it: "it placeholder",
  //   },
  //   defaultValue: {
  //     value: {
  //       en: ["enValue1", "enValue2"],
  //       it: ["itValue3", "itValue4"],
  //       de: ["deValue4"],
  //     },
  //   },
  // },
  // * ORDER LIST
  // {
  //   inputType: "orderList",
  //   type: "string",
  //   key: "demoTabOrder",
  //   label: {
  //     en: "Tabs Order",
  //   },
  //   options: [
  //     { title: "availability", value: "avl" },
  //     { title: "amenities", value: "amn" },
  //     { title: "prices", value: "prs" },
  //     { title: "offers", value: "offr" },
  //     { title: "booking", value: "bkg" },
  //   ],
  //   // optional properties
  //   description: {
  //     en: "Manage order of tabs",
  //   },
  // },
]

export { customProps }
