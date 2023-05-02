import { slugify, removeEmptyArrs } from '../../lib/utils'

const findPages = (content) =>
  content.reduce((acc, item) => {
    const slug = item.slug ? item.slug : slugify(item.name)
    return { ...acc, [slug]: item.pages ? [{ ...item, pages: item.pages }] : [{ ...item }] }
  }, {})

const findPagesRecursively = (pages) =>
  pages.reduce((acc, item) => {
    return item.pages ? [...acc, { ...item }, ...findPagesRecursively(item.pages)] : [...acc, { ...item }]
  }, [])

const findAllPages = (content) => {
  return content.reduce((acc, item) => {
    return item.pages ? [...acc, item, ...findPagesRecursively(item.pages)] : [...acc, item]
  }, [])
}

const addSlash = (parent) => {
  if (!parent) {
    return '/'
  } else if (parent && parent.charAt(parent.length - 1) === '/') {
    return ''
  } else return '/'
}

const updatePaths = (pages, parent) => removeEmptyArrs(updatePathsRecursively(pages, parent), 'pages')

const updatePathsRecursively = (pages, parent) => {
  return pages.reduce((acc, p) => {
    return p.pages
      ? [
          ...acc,
          {
            ...p,
            path: `${parent ? parent : ''}${addSlash(parent)}${p.slug}`,
            pages: updatePaths(p.pages, `${parent ? parent : ''}${addSlash(parent)}${p.slug}`),
          },
        ]
      : [...acc, { ...p, path: `${parent ? parent : ''}${addSlash(parent)}${p.slug}` }]
  }, [])
}

const updatePagesByStatus = (pages) => {
  return pages.reduce((acc, p) => {
    return p.pages ? [...acc, ...(p.status && { ...p, pages: updatePaths(p.pages) })] : [...acc, ...(p.status && p)]
  }, [])
}

export { updatePaths, findPages, findAllPages, findPagesRecursively, updatePagesByStatus }
