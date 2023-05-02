/**
 * @function buildDataObj this recursive function creates empty values object for the given props array.
 * @param {any[]} props array of props.
 * @param {string[]} languages languages
 * @param {any} prevData previous data
 * @returns {object} values for the given props array
 */
export const buildDataObj = (props, languages = [], prevData = {}, themes = []) => {
  let obj = {}
  for (let i = 0; i < props.length; i++) {
    switch (props[i].inputType) {
      case 'text':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            const value =
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || ''
                : props[i]?.defaultValue?.[languages[j]] || ''

            obj[props[i].key] = {
              ...obj[props[i].key],
              [languages[j]]: value,
            }
          }
        } else if (props[i].themeBased && themes.length > 0) {
          for (let j = 0; j < themes.length; j++) {
            const currentTheme = themes[j]
            if (
              prevData[props[i].key] &&
              (typeof prevData[props[i].key] === 'string' || typeof prevData[props[i].key] === 'number')
            ) {
              if (currentTheme === 'default') {
                const value = prevData[props[i].key] || ''

                obj[props[i].key] = {
                  ...obj[props[i].key],
                  [currentTheme]: value,
                }
              }
            } else {
              const value =
                props[i].key in prevData
                  ? prevData[props[i].key]?.[currentTheme] || ''
                  : props[i]?.defaultValue?.[currentTheme] || ''

              obj[props[i].key] = {
                ...obj[props[i].key],
                [currentTheme]: value,
              }
            }
          }
        } else {
          if (
            prevData[props[i].key] &&
            typeof prevData[props[i].key] === 'object' &&
            prevData[props[i].key].hasOwnProperty('default')
          ) {
            obj[props[i].key] = prevData[props[i].key].default
          } else {
            const value = prevData[props[i].key] || ''
            obj[props[i].key] = value
          }
        }
        break
      case 'staticList':
        obj[props[i].key] = buildDataObj(props[i].props, languages, prevData[props[i].key], themes)
        break
      case 'list':
        obj[props[i].key] =
          prevData[props[i].key] && prevData[props[i].key].length > 0
            ? prevData[props[i].key].map((value) => buildDataObj(props[i].props, languages, value, themes))
            : []
        break
      case 'array':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            // const value = prevData[props[i].key]?.[languages[j]] || props[i]?.defaultValue?.[languages[j]] || []
            const value =
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || []
                : props[i]?.defaultValue?.[languages[j]] || []

            obj[props[i].key] = {
              ...obj[props[i].key],
              [languages[j]]: value,
            }
          }
        } else {
          const value = prevData[props[i].key] || props[i]?.defaultValue || []
          obj[props[i].key] = value
        }
        break
      case 'select':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            const value =
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || ''
                : props[i]?.defaultValue?.[languages[j]] || ''

            obj[props[i].key] = {
              ...obj[props[i].key],
              [languages[j]]: value,
            }
          }
        } else {
          const value = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || ''
          obj[props[i].key] = value
        }
        break
      case 'toggle':
        obj[props[i].key] =
          prevData[props[i].key] === undefined ? props[i]?.defaultValue || false : prevData[props[i].key]
        break
      case 'rte':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            const value =
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || ''
                : props[i]?.defaultValue?.[languages[j]] || ''

            obj[props[i].key] = {
              ...obj[props[i].key],
              [languages[j]]: value,
            }
          }
        } else {
          const value = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || ''
          obj[props[i].key] = value
        }
        break
      case 'radio':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            const value =
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || ''
                : props[i]?.defaultValue?.[languages[j]] || ''

            obj[props[i].key] = {
              ...obj[props[i].key],
              [languages[j]]: value,
            }
          }
        } else {
          const value = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || ''
          obj[props[i].key] = value
        }
        break
      case 'keyedInput':
        if (props[i].type === 'object') {
          obj[props[i].key] = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || {}
        } else {
          obj[props[i].key] = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || []
        }

        break
      case 'link':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            const titleValue =
              props[i].key in prevData
                ? prevData[props[i].key]?.title?.[languages[j]] || ''
                : props[i]?.defaultValue?.title?.[languages[j]] || ''

            const linkValue =
              props[i].key in prevData
                ? prevData[props[i].key]?.link?.[languages[j]] || ''
                : props[i]?.defaultValue?.link?.[languages[j]] || ''

            const targetValue =
              prevData[props[i].key]?.targetBlank?.[languages[j]] === undefined
                ? props[i]?.defaultValue?.targetBlank?.[languages[j]] || false
                : prevData[props[i].key]?.targetBlank?.[languages[j]]

            obj[props[i].key] = {
              title: { ...obj[props[i].key]?.title, [languages[j]]: titleValue },
              link: { ...obj[props[i].key]?.link, [languages[j]]: linkValue },
              targetBlank: {
                ...obj[props[i].key]?.targetBlank,
                [languages[j]]: targetValue,
              },
            }
          }
        } else {
          const titleValue =
            props[i].key in prevData ? prevData[props[i].key]?.title || '' : props[i]?.defaultValue?.title || ''

          const linkValue =
            props[i].key in prevData ? prevData[props[i].key]?.link || '' : props[i]?.defaultValue?.link || ''

          const targetValue =
            prevData[props[i].key]?.targetBlank === undefined
              ? props[i]?.defaultValue?.targetBlank || false
              : prevData[props[i].key]?.targetBlank

          obj[props[i].key] = {
            title: titleValue,
            link: linkValue,
            targetBlank: targetValue,
          }
        }
        break
      case 'color':
        if (props[i].themeBased && themes.length > 0) {
          for (let j = 0; j < themes.length; j++) {
            const currentTheme = themes[j]
            if (
              (props[i].key in prevData && typeof prevData[props[i].key] === 'string') ||
              typeof prevData[props[i].key] === 'number'
            ) {
              if (currentTheme === 'default') {
                const value = prevData[props[i].key] || ''

                obj[props[i].key] = {
                  ...obj[props[i].key],
                  [currentTheme]: value,
                }
              }
            } else {
              const value =
                props[i].key in prevData
                  ? prevData[props[i].key]?.[currentTheme] || ''
                  : props[i]?.defaultValue?.[currentTheme] || ''

              obj[props[i].key] = {
                ...obj[props[i].key],
                [currentTheme]: value,
              }
            }
          }
        } else {
          if (
            props[i].key in prevData &&
            typeof prevData[props[i].key] === 'object' &&
            prevData[props[i].key].hasOwnProperty('default')
          ) {
            obj[props[i].key] = prevData[props[i].key].default
          } else {
            obj[props[i].key] = prevData[props[i].key] || props[i]?.defaultValue || ''
          }
        }
        break
      case 'flipBookPdf':
        for (let j = 0; j < languages.length; j++) {
          obj[props[i].key] = {
            ...obj[props[i].key],
            [languages[j]]:
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || []
                : props[i]?.defaultValue?.[languages[j]] || [],
          }
        }
        break
      case 'image':
        obj[props[i].key] = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || []
        break
      case 'dateTime':
        if (props[i].languages) {
          for (let j = 0; j < languages.length; j++) {
            const value =
              props[i].key in prevData
                ? prevData[props[i].key]?.[languages[j]] || props[i]?.defaultValue?.[languages[j]]
                : prevData[props[i].key]?.[languages[j]] || props[i]?.defaultValue?.[languages[j]]

            const date = new Date(value)

            obj[props[i].key] = {
              ...obj[props[i].key],
              [languages[j]]: Number.isNaN(date.getTime()) ? '' : date.getTime(),
            }
          }
        } else {
          const value = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue
          const date = new Date(value)
          obj[props[i].key] = Number.isNaN(date.getTime()) ? '' : date.getTime()
        }
        break
      case 'multiSelect':
        const value = props[i].key in prevData ? prevData[props[i].key] : props[i]?.defaultValue || []
        obj[props[i].key] = value
        break
    }
  }
  return obj
}
