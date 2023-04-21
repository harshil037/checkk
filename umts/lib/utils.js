const findValuesByKey = (object, objKey) => {
  return Object.entries(object).reduce((acc, [key, val]) => {
    return Array.isArray(val)
      ? key === objKey
        ? [
            ...acc,
            ...val,
            ...val.reduce((pageAcc, page) => {
              return [...pageAcc, ...findValuesByKey(page, objKey)]
            }, acc),
          ]
        : [
            ...acc,
            ...val.reduce((pageAcc, page) => {
              return [...pageAcc, ...findValuesByKey(page, objKey)]
            }, acc),
          ]
      : [...acc]
  }, [])
}

const findDuplicates = (arr) =>
  arr.reduce((acc, el, i, arr) => (arr.indexOf(el) !== i && acc.indexOf(el) < 0 ? [...acc, el] : acc), [])
const findUnique = (arr) => arr.filter((v, i, a) => a.indexOf(v) === i)

const isEqual = (value, other) => {
  const type = Object.prototype.toString.call(value)
  if (type !== Object.prototype.toString.call(other)) return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false
  const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length
  const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length
  if (valueLen !== otherLen) return false

  const compare = (item1, item2) => {
    const itemType = Object.prototype.toString.call(item1)
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false
    } else {
      if (itemType !== Object.prototype.toString.call(item2)) return false
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) return false
      } else {
        if (item1 !== item2) return false
      }
    }
  }
  if (type === '[object Array]') {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false
    }
  } else {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false
      }
    }
  }
  return true
}

const slugify = (str) => {
  str = str.replace(/^\s+|\s+$/g, '')
  str = str.replace('www', '')
  str = str.toLowerCase()

  var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
  var to = 'aaaaeeeeiiiioooouuuunc------'
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes

  return str
}

const isValidJSON = (str) => {
  try {
    JSON.parse(str)
  } catch (error) {
    return false
  }
  return true
}

const removeEmptyArrs = (arr, key) =>
  arr.reduce((acc, item) => {
    if (Array.isArray(item[key]) && !item[key]?.length) {
      const itemWithoutItems = Object.entries(item).reduce((kAcc, [k, v]) => {
        return k === key ? { ...kAcc } : { ...kAcc, [k]: v }
      }, {})
      return [...acc, { ...itemWithoutItems }]
    } else if (Array.isArray(item[key]) && item[key]?.length > 0) {
      return [...acc, { ...item, [key]: removeEmptyArrs(item[key], key) }]
    } else return [...acc, item]
  }, [])

const removeItemWithId = (arr, removeItem, comparisonKey, recursiveArrKey) => {
  return removeEmptyArrs(removeItemWithIdRecursively(arr, removeItem, comparisonKey, recursiveArrKey), recursiveArrKey)
}

// returns an array without a given object (compared with comparisonKey), recursiveArrKey = key of the children array
const removeItemWithIdRecursively = (arr, removeItem, comparisonKey, recursiveArrKey) => {
  return arr
    .filter((obj) => obj[comparisonKey] !== removeItem[comparisonKey])
    .map(function (obj) {
      if (obj[recursiveArrKey] !== undefined) {
        return {
          ...obj,
          [recursiveArrKey]:
            obj[recursiveArrKey] !== undefined
              ? removeItemWithIdRecursively(obj[recursiveArrKey], removeItem, comparisonKey, recursiveArrKey)
              : undefined,
        }
      } else {
        return {
          ...obj,
        }
      }
    })
}

// checks whether an obeject (compared with comparisonKey) exists in a tree, recursiveArrKey = key of the children array
const existsInTree = (tree, item, comparisonKey, recursiveArrKey) => {
  return tree.find((t) =>
    t[comparisonKey] === item[comparisonKey]
      ? true
      : t[recursiveArrKey]
      ? existsInTree(t[recursiveArrKey], item, comparisonKey, recursiveArrKey)
      : false,
  )
}

// Adds an object to an array (compared with comparisonKey) based on an optional position (above, below or child), if 'child' is given the item becomes a child of it's target, recursiveArrKey = key of the children array
const addItemToArray = (arr, movedItem, targetItem, position, comparisonKey, recursiveArrKey) => {
  return Array.isArray(arr) && arr.length === 0
    ? [movedItem]
    : arr.reduce((acc, p) => {
        if (p[comparisonKey] === targetItem[comparisonKey]) {
          if (position === 'above') {
            return [...acc, movedItem, p]
          } else if (position === 'below') return [...acc, p, movedItem]
          else
            return p[recursiveArrKey]
              ? [...acc, { ...p, [recursiveArrKey]: [...p[recursiveArrKey], movedItem] }]
              : [...acc, { ...p, [recursiveArrKey]: [movedItem] }]
        } else if (p[recursiveArrKey]) {
          return [
            ...acc,
            {
              ...p,
              [recursiveArrKey]: addItemToArray(
                p[recursiveArrKey],
                movedItem,
                targetItem,
                position,
                comparisonKey,
                recursiveArrKey,
              ),
            },
          ]
        } else return [...acc, p]
      }, [])
}

// Upadate an object in an Array (compared with comparisonKey), recursiveArrKey = key of the children array
const updateItemInArr = (arr, targetItem, comparisonKey, recursiveArrKey) => {
  return arr.reduce((acc, p) => {
    if (p[comparisonKey] === targetItem[comparisonKey]) {
      return [...acc, targetItem]
    } else if (p[recursiveArrKey]) {
      return [
        ...acc,
        { ...p, [recursiveArrKey]: updateItemInArr(p[recursiveArrKey], targetItem, comparisonKey, recursiveArrKey) },
      ]
    } else return [...acc, p]
  }, [])
}

// Test the memory footprint of an object
const memorySizeOf = (obj) => {
  let bytes = 0

  const sizeOf = (obj) => {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8
          break
        case 'string':
          bytes += obj.length * 2
          break
        case 'boolean':
          bytes += 4
          break
        case 'object':
          const objClass = Object.prototype.toString.call(obj).slice(8, -1)
          if (objClass === 'Object' || objClass === 'Array') {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) continue
              sizeOf(obj[key])
            }
          } else bytes += obj.toString().length * 2
          break
      }
    }
    return bytes
  }

  const formatByteSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KiB'
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MiB'
    else return (bytes / 1073741824).toFixed(3) + ' GiB'
  }

  return formatByteSize(sizeOf(obj))
}
const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join('').toLowerCase()
const isEmpty = (obj) => Object.keys(obj).length === 0
const generateRandomNumber = (n) => {
  const add = 1
  let max = 12 - add // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max)
  }

  max = Math.pow(10, n + add)
  const min = max / 10 // Math.pow(10, n) basically
  const number = Math.floor(Math.random() * (max - min + 1)) + min

  return ('' + number).substring(add)
}

const isValidValue = (value) => {
  if (!value || value == undefined || value == '' || value == null) {
    return false
  } else {
    return true
  }
}

const getWidgetImage = (widgetModule, isHover = false) => {
  let image = '/images/iiq-check.svg'
  if (widgetModule) {
    if (widgetModule.includes('WidgetVmts')) {
      image = isHover ? '/images/voucher_hover.svg' : '/images/voucher.svg'
    } else if (widgetModule.includes('WidgetFlipbook')) {
      image = isHover ? '/images/flipbook_hover.svg' : '/images/flipbook.svg'
    } else if (widgetModule.includes('WidgetIIQCheck')) {
      image = isHover ? '/images/iiq-check_hover.svg' : '/images/iiq-check.svg'
    } else if (widgetModule.includes('WidgetIIQ')) {
      image = isHover ? '/images/iiq-check_hover.svg' : '/images/iiq-check.svg'
    } else if (widgetModule.includes('WidgetPriceCalculator')) {
      image = isHover ? '/images/compare_hover.svg' : '/images/compare.svg'
    } else if (widgetModule.includes('WidgetRoomCompare')) {
      image = isHover ? '/images/room_hover.svg' : '/images/room.svg'
    } else if (widgetModule.includes('WidgetSocialWall')) {
      image = isHover ? '/images/social-wall_hover.svg' : '/images/social-wall.svg'
    } else if (widgetModule.includes('WidgetTest')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('HeroContent')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('MenuBasic')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('MenuLanguageMenu')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('MenuNavigation')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('TextBasic')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('TextDetail')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('TextLinkboxes')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('TextLogo')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('TextTextBoxes')) {
      image = '/images/iiq-check.svg'
    } else if (widgetModule.includes('Categories')) {
    } else if (widgetModule.includes('reception')) {
      image = '/images/hotel-reception.svg'
    }
  }
  return image
}

const containsSpecial = (str) => {
  const characters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  return characters.test(str)
}

const toBool = (string) => {
  if (string === 'true' || string === '1' || string === 'yes') {
    return true
  } else {
    return false
  }
}

const isDefined = (v) => typeof v !== 'undefined' //is (v) defined
const isNull = (v) => isDefined(v) && v === null //is v null but defined
const isNotNull = (v) => !isNull(v) //is v not null or undefined
const isObject = (obj) => obj === Object(obj) && !Array.isArray(obj) && typeof obj === 'object'
const isObjectLike = (o) => typeof o === 'object'
const isArray = (v) => isObjectLike(v) && isNotNull(v) && Array.isArray(v) //is (v) an array

/**
 * To get status of payment result code.
 * @param {string} code code of payment status response i.e. 000.000.000
 */
const getHobexPaymentStatus = (code) => {
  const paymentSuccess = /^(000.000.|000.100.1|000.[36]|000.400.[1][12]0)/.test(code)
  const paymentReview = /^(000.400.0[^3]|000.400.100)/.test(code)
  const paymentPending = /^(000\.200)/.test(code) || /^(800\.400\.5|100\.400\.500)/.test(code)
  const paymentFailed =
    /^(000\.400\.[1][0-9][1-9]|000\.400\.2)/.test(code) ||
    /^(800\.[17]00|800\.800\.[123])/.test(code) ||
    /^(900\.[1234]00|000\.400\.030)/.test(code) ||
    /^(800\.[56]|999\.|600\.1|800\.800\.[84])/.test(code) ||
    /^(100\.39[765])/.test(code) ||
    /^(300\.100\.100)/.test(code) ||
    /^(100\.400\.[0-3]|100\.38|100\.370\.100|100\.370\.11)/.test(code) ||
    /^(800\.400\.1)/.test(code) ||
    /^(800\.400\.2|100\.380\.4|100\.390)/.test(code) ||
    /^(100\.100\.701|800\.[32])/.test(code) ||
    /^(800\.1[123456]0)/.test(code) ||
    /^(600\.[23]|500\.[12]|800\.121)/.test(code) ||
    /^(100\.[13]50)/.test(code) ||
    /^(100\.250|100\.360)/.test(code) ||
    /^(700\.[1345][05]0)/.test(code) ||
    /^(200\.[123]|100\.[53][07]|800\.900|100\.[69]00\.500)/.test(code) ||
    /^(100\.800)/.test(code) ||
    /^(100\.[97]00)/.test(code) ||
    /^(100\.100|100.2[01])/.test(code) ||
    /^(100\.55)/.test(code) ||
    /^(100\.380\.[23]|100\.380\.101)/.test(code) ||
    /^(000\.100\.2)/.test(code)
  if (paymentSuccess) {
    return 'success'
  } else if (paymentPending) {
    return 'pending'
  } else if (paymentFailed) {
    return 'failed'
  } else if (paymentReview) {
    return 'review'
  } else {
    return ''
  }
}

export {
  isObject,
  isEqual,
  isEmpty,
  updateItemInArr,
  capitalize,
  addItemToArray,
  existsInTree,
  removeItemWithId,
  isValidJSON,
  memorySizeOf,
  findValuesByKey,
  slugify,
  generateRandomNumber,
  removeEmptyArrs,
  findDuplicates,
  findUnique,
  containsSpecial,
  toBool,
  isValidValue,
  getWidgetImage,
  getHobexPaymentStatus,
  isArray,
}
