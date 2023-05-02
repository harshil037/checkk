/**
 * to create page tree from flat pages array
 * @param {any[]} pages
 * @returns
 */
export const createPageTree = (pages = []) => {
  const base = { pages: [] }

  for (const node of pages) {
    const path = node.path.match(/\/[^\/]+/g)

    let curr = base

    for (let i = 0; i < path.length; i++) {
      const currPath = path.slice(0, i + 1).join('')

      const child = curr.pages.find((e) => e.path === currPath)

      if (child) {
        curr = child
      } else {
        curr.pages.push({
          ...node,
          path: currPath,
          pages: [],
        })
        curr = curr.pages[curr.pages.length - 1]
      }
    }
  }

  return base.pages
}

// to create flat pages array from page tree
export const flattenPageTree = (tree) => {
  const list = []

  const queue = tree

  while (queue.length) {
    const curr = queue.shift()
    if (curr.pages.length) {
      queue.push(...curr.pages)
    }
    delete curr.pages

    list.push(curr)
  }
  return list
}
