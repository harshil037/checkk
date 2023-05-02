import { useMemo, useState } from 'react'
import styles from './tree.module.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { v4 as uuid } from 'uuid'
import TreeNode from './node'
import { deepClone, get } from '../../lib/object'
import { createPageTree, flattenPageTree } from '../../lib/pageTreeUtils'

const PageTree = ({ value = [], children, onChange = (value) => {} }) => {
  const tree = useMemo(() => createPageTree(value), [value])
  const [clipboard, setClipboard] = useState(null)

  /**
   * to update chaild page's path and language
   * @param {any[]} pages
   * @param {string} path
   * @param {string} language
   * @param {boolean} changeId
   */
  const updateChild = (pages, path, language, changeId = false) => {
    for (let i = 0; i < pages.length; i++) {
      if (changeId) pages[i].id = uuid()

      pages[i].path = path + '/' + pages[i].slug
      pages[i].language = language

      updateChild(pages[i].pages, pages[i].path, pages[i].language, changeId)
    }
  }

  /**
   * to move a tree node
   * @param {any} tree tree data
   * @param {Function} onChange change handler function
   */
  const moveTreeItem = (tree, onChange) => (dragItemPath, dropItemPath, isChild) => {
    // path for the current dragging node.
    const dragItemPathString = dragItemPath.join(`.pages.`)

    if (dropItemPath.join(`.pages.`) === dragItemPathString) return false

    // creating drop item's parent node path
    let dropItemParentPathString = [...dropItemPath]
    dropItemParentPathString.pop()
    dropItemParentPathString = dropItemParentPathString.join(`.pages.`)

    // creating drag item's parent node path
    let dragItemParentPathString = [...dragItemPath]
    dragItemParentPathString.pop()
    dragItemParentPathString = dragItemParentPathString.join(`.pages.`)

    // if dragging a parent to its child
    if (
      dropItemPath.length > dragItemPath.length &&
      dropItemPath.slice(0, dragItemPath.length).join('.') === dragItemPath.join('.')
    ) {
      return false
    } else {
      // deep cloning the original tree
      const newTree = deepClone(tree)
      const dragItem = deepClone(get(newTree, dragItemPathString))
      const dragItemIndex = [...dragItemPath].pop()
      const dropItemIndex = [...dropItemPath].pop()
      const dropItemParentNode = get(newTree, dropItemParentPathString)
      const dragItemParentNode = get(newTree, dragItemParentPathString)

      // if both nodes are the nested node
      if (dropItemParentNode && dragItemParentNode) {
        if (isChild) {
          dragItem.language = dropItemParentNode['pages'][dropItemIndex].language
          dragItem.path = `${dropItemParentNode['pages'][dropItemIndex].path}/${dragItem.slug}`

          // checking if path is already exists
          if (dropItemParentNode['pages'][dropItemIndex]['pages'].find((page) => page.path === dragItem.path)) {
            dragItem.path += '1'
            dragItem.slug += '1'
          }

          // to update nested children nodes
          updateChild(dragItem.pages, dragItem.path, dragItem.language)
          dropItemParentNode['pages'][dropItemIndex]['pages'].push(dragItem)
        } else {
          dragItem.language = dropItemParentNode.language
          dragItem.path = `${dropItemParentNode.path}/${dragItem.slug}`

          // checking if path is already exists
          if (dropItemParentNode['pages'].find((page) => page.path === dragItem.path)) {
            dragItem.path += '1'
            dragItem.slug += '1'
          }

          // to update nested children nodes
          updateChild(dragItem.pages, dragItem.path, dragItem.language)
          dropItemParentNode['pages'].splice(dropItemIndex + 1, 0, dragItem)
        }
        dragItemParentNode['pages'].splice(dragItemIndex, 1)
      } else {
        // if drag node is root node
        if (!dragItemParentNode && dropItemParentNode) {
          console.log('can not make the root node a child node!')
          return false
        } else if (dragItemParentNode && !dropItemParentNode) {
          // if drop node is root node
          dragItemParentNode['pages'].splice(dragItemIndex, 1)
          if (isChild) {
            dragItem.language = newTree[dropItemIndex].language
            dragItem.path = `${newTree[dropItemIndex].path}/${dragItem.slug}`

            // checking if path is already exists
            if (newTree[dropItemIndex]['pages'].find((page) => page.path === dragItem.path)) {
              dragItem.path += '1'
              dragItem.slug += '1'
            }

            // to update nested children nodes
            updateChild(dragItem.pages, dragItem.path, dragItem.language)
            newTree[dropItemIndex]['pages'].push(dragItem)
          } else {
            console.log('can not make a child node a root node!')
            return false
          }
        } else {
          // if both nodes are the root node
          if (isChild) {
            newTree[dropItemIndex]['pages'].push(dragItem)
            newTree.splice(dragItemIndex, 1)
          } else {
            newTree.splice(dragItemIndex, 1)
            newTree.splice(dropItemIndex, 0, dragItem)
          }
        }
      }

      setClipboard(null)
      onChange(flattenPageTree(newTree))
    }
  }

  /**
   * to delete a tree node
   * @param {any} tree tree data
   * @param {Function} onChange change handler function
   */
  const deleteNode = (tree, onChange) => (nodePath) => () => {
    const nodeIndex = nodePath.pop()
    const parentNodePath = nodePath
    const newTree = deepClone(tree)

    if (parentNodePath.length > 0) {
      const parentNode = get(newTree, parentNodePath.join(`.pages.`))
      parentNode['pages'].splice(nodeIndex, 1)
    } else {
      newTree.splice(nodeIndex, 1)
    }

    setClipboard(null)
    onChange(flattenPageTree(newTree))
  }

  const copyNode = (node) => () => {
    setClipboard(node)
  }

  const cancleCopy = () => {
    setClipboard(null)
  }

  const pasteNode = (path) => () => {
    const newTree = deepClone(tree)
    const pastePath = path.join(`.pages.`)
    const pastePage = get(newTree, pastePath)
    const copyPage = deepClone(clipboard)

    // creating new path
    copyPage.path = pastePage.path + '/' + copyPage.slug
    copyPage.language = pastePage.language
    copyPage.id = uuid()

    // if path already exists then creating new path and new slug
    let count = 1
    while (pastePage.pages.find((page) => page.path === copyPage.path)) {
      if (count > 1) {
        const re = new RegExp(`${count - 1}$`)
        copyPage.slug = copyPage.slug.replace(re, count)
        copyPage.path = copyPage.path.replace(re, count)
      } else {
        copyPage.slug = copyPage.slug + count
        copyPage.path = copyPage.path + count
      }

      count++
    }

    // updating path and language of the nested children
    updateChild(copyPage.pages, copyPage.path, copyPage.language, true)

    pastePage.pages.push(copyPage)

    setClipboard(null)
    onChange(flattenPageTree(newTree))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.tree}>
        <ul>
          {tree.map((item, index) => (
            <TreeNode
              key={item.id}
              data={item}
              path={[index]}
              moveTreeItem={moveTreeItem(tree, onChange)}
              deleteNode={deleteNode(tree, onChange)}
              node={children}
              copyNode={copyNode}
              cancleCopy={cancleCopy}
              clipboard={clipboard}
              pasteNode={pasteNode}
            />
          ))}
        </ul>
      </div>
    </DndProvider>
  )
}

export default PageTree
