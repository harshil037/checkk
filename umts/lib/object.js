/**
 * @property {object} object - The object to query
 * @property {string} path - The path of the property to get for ex: a.b.c.0.d
 * @property {object} fallback - The default value to return if no value found in path
 * @returns {any} Returns the resolved value (undefined / fallback value / value found).
 */
export const get = (object, path, fallback) => {
  const dot = typeof path === 'string' ? path.indexOf('.') : -1

  if (typeof object !== 'object' || object === null || object === undefined) {
    return fallback
  }

  if (dot === -1) {
    if (path.length && path in object) {
      return object[path]
    }

    return fallback
  }

  return get(object[path.substr(0, dot)], path.substr(dot + 1), fallback)
}

/**
 * @property {object} object - The object to query
 * @property {string} path - The path of the property to set for ex: a.b.c.0.d
 * @property {any} value - The value to set to the key found in path
 * @returns {object} Returns the updated object
 */
export const set = (object, path, value) => {
  if (Object(object) !== object) return object

  if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
  path
    .slice(0, -1)
    .reduce(
      (a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})),
      object,
    )[path[path.length - 1]] = value
  return object
}

/**
 * To make deep clone of a object
 * @property {object} object
 */
export const deepClone = (object) => {
  const globalObject =
    typeof window !== 'undefined'
      ? window
      : typeof WorkerGlobalScope !== 'undefined'
      ? self
      : typeof global !== 'undefined'
      ? global
      : Function('return this;')()

  if (globalObject.structuredClone) return globalObject.structuredClone(object)
  return JSON.parse(JSON.stringify(object))
}
/**
 * intended to compare objects of identical shape; ideally static.
 * any top-level key with a primitive value which exists in `previous` but not
 * in `current` returns `undefined` while vice versa yields a diff.
 * in general, the input type determines the output type. that is if `previous`
 * and `current` are objects then an object is returned. if arrays then an array
 * is returned, etc.
 * @param {object} previous previous object
 * @param {object} current updated object
 */
export const getChanges = (previous, current) => {
  if (isPrimitive(previous) && isPrimitive(current)) {
    if (previous === current) {
      return ''
    }

    return current
  }

  if (isObject(previous) && isObject(current)) {
    const diff = getChanges(Object.entries(previous), Object.entries(current))

    return diff.reduce((merged, [key, value]) => {
      return {
        ...merged,
        [key]: value,
      }
    }, {})
  }

  const changes = []

  if (JSON.stringify(previous) === JSON.stringify(current)) {
    return changes
  }

  for (let i = 0; i < current.length; i++) {
    const item = current[i]

    if (JSON.stringify(item) !== JSON.stringify(previous[i])) {
      changes.push(item)
    }
  }

  return changes
}

const typeOf = (o) => Object.prototype.toString.call(o)

const isObject = (o) => o !== null && !Array.isArray(o) && typeOf(o).split(' ')[1].slice(0, -1) === 'Object'

const isPrimitive = (o) => {
  switch (typeof o) {
    case 'object': {
      return false
    }
    case 'function': {
      return false
    }
    default: {
      return true
    }
  }
}
