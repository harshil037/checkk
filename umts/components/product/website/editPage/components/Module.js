import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import Button from '../../../../common/Button'

const Module = ({ name, slot, module, id, editModule, deleteModule, swapModuleInSlot, moduleIndex, slots, domainId, moduleType}) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'module',
      item: { id, slot },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, moduleIndex, slots],
  )

  const [{ hovered, draggedItem }, dropRef] = useDrop(
    {
      accept: 'module',
      drop: (item, monitor) => {
        if (item.slot === slot) {
          const dragItem = item.id
          const dropItem = id
          swapModuleInSlot(dragItem, dropItem, slot)
        }
      },
      collect: (monitor) => {
        return {
          hovered: monitor.isOver(),
          draggedItem: monitor.getItem(),
        }
      },
    },
    [id, moduleIndex, slots],
  )

  const ref = useRef(null)
  const dragDropRef = dragRef(dropRef(ref))

  //   const opacity = isDragging ? 0 : 1

  return (
    <div
      className={`bg-stone-100 justify-between flex items-center p-1 px-4 my-2 rounded-lg border-b ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
      ref={dragDropRef}
    >
      <label className="text-right mt-1 text-sm">
        {name} ({module})
      </label>
      <div className="flex justify-between items-center">
        <Button className="flex items-center text-xs" variant="secondary" onClick={editModule(id)}>
          Edit
        </Button>
        <Button className="flex items-center text-xs ml-2" variant="danger" onClick={deleteModule(id, domainId, moduleType)}>
          Delete Widget
          <img className="inline-block ml-2" src="/images/trash.svg" alt="Delete Widget" />
        </Button>
        <div className="text-primary-400 text-3xl ml-2">&#8801;</div>
      </div>
    </div>
  )
}

export default Module
