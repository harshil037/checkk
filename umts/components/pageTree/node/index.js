import React, { useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'

const TreeNode = ({ data, moveTreeItem, path, deleteNode, node, clipboard, copyNode, cancleCopy, pasteNode }) => {
  const [appendChild, setAppendChild] = useState(false)
  const [expand, setExpand] = useState(true)

  // useDrag - the tree node is draggable
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'node',
      item: { path },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => {
        if (data.canDrag === false || data.canDrag === 'false') return false
        return true
      },
    }),
    [path],
  )

  // useDrop - the tree node is also a drop area
  const [{ hovered, draggedItem }, dropRef] = useDrop(
    {
      accept: 'node',
      drop: (item, monitor) => {
        const dragItemPath = item.path

        const hoverItemPath = path

        // to append node to child
        if (monitor.getDifferenceFromInitialOffset().x > 50) {
          moveTreeItem(dragItemPath, hoverItemPath, true)
        } else {
          // to append node to sibling
          moveTreeItem(dragItemPath, hoverItemPath)
        }
      },
      canDrop: () => {
        if (data.canDrop === false || data.canDrop === 'false') return false
        return true
      },
      hover: (item, monitor) => {
        // to append node to child
        if (monitor.getDifferenceFromInitialOffset().x > 50) {
          setAppendChild(true)
        } else {
          setAppendChild(false)
        }
      },
      collect: (monitor) => {
        return {
          hovered: monitor.isOver(),
          draggedItem: monitor.getItem(),
        }
      },
    },
    [path],
  )

  // Join the 2 refs together into one (both draggable and can be dropped on)
  const ref = useRef(null)
  const dragDropRef = dragRef(dropRef(ref))

  const opacity = isDragging ? 0 : 1

  const toggleFn = () => {
    setExpand(!expand)
  }

  return (
    <>
      <li className={`${data.pages.length > 0 ? 'parent-li' : ''}`}>
        <div
          ref={dragDropRef}
          style={{
            opacity,
          }}
          className={'bg-white z-10 relative'}
        >
          {node({
            data,
            deleteNode: deleteNode(path),
            hasChild: data.pages.length > 0,
            toggleFn: data.pages.length > 0 ? toggleFn : undefined,
            expand,
            copyNode: !clipboard && copyNode(data),
            cancleCopy: clipboard && clipboard.path === data.path && cancleCopy,
            pasteNode:
              clipboard && !data.path.includes(`${clipboard.path}/`) && data.path !== clipboard.path && pasteNode(path),
          })}
        </div>

        {/* children nodes */}
        {!isDragging && (
          <ul className={`pl-6 ${data.pages.length > 0 ? (expand ? 'h-full' : 'h-0 overflow-hidden') : ''}`}>
            {data.pages.map((page, index) => (
              <TreeNode
                key={page.id}
                data={page}
                path={[...path, index]}
                moveTreeItem={moveTreeItem}
                deleteNode={deleteNode}
                node={node}
                clipboard={clipboard}
                copyNode={copyNode}
                cancleCopy={cancleCopy}
                pasteNode={pasteNode}
              />
            ))}
          </ul>
        )}

        {/* showing drop guideline */}
        {hovered &&
          data.canDrop !== false &&
          path.join('.') !== draggedItem.path.join('.') &&
          !(
            path.length > draggedItem.path.length &&
            path.slice(0, draggedItem.path.length).join('.') === draggedItem.path.join('.')
          ) && <div className={`border border-b-2 border-b-gray-600 ${appendChild && 'ml-6'}`}></div>}
      </li>
    </>
  )
}

export default TreeNode
