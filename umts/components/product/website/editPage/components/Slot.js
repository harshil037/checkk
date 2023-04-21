import React, { useState, useEffect } from 'react'
import { useDrop } from 'react-dnd'
import Button from '../../../../common/Button'
import { Input, Select } from '../../../../componentLibrary'
import PopUp from '../../../../dialog/popUp'
import Module from './Module'
import ModuleSelection from './moduleSelection'

const Slot = ({
  slot,
  modules,
  active,
  handleSlotActivation,
  addExistingModule,
  deleteModule,
  moveModuleToSlot,
  swapModuleInSlot,
  slots,
  editModule,
  modulesList,
  addNewModule,
  domainId,
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [existingModule, setExistingModule] = useState(true)
  const [selectedModule, setSelectedModule] = useState({ type: '', module: '', name: '', version: '', status: false })
  const [allModules, setAllModules] = useState({})
  const [moduleTypes, setModuleTypes] = useState([])

  const [{ hovered, draggedItem }, dropRef] = useDrop(
    {
      accept: 'module',
      drop: (item, monitor) => {
        if (item.slot !== slot.key) {
          moveModuleToSlot(item.id, item.slot, slot.key)
        }
      },
      collect: (monitor) => {
        return {
          hovered: monitor.isOver(),
          draggedItem: monitor.getItem(),
        }
      },
    },
    [slot, slots],
  )

  useEffect(() => {
    const components = {}
    for (let i = 0; i < modulesList.length; i++) {
      const prod = modulesList[i]
      if (components[prod.module]) {
        components[prod.module].versions.push(prod.version)
      } else {
        components[prod.module] = {}
        components[prod.module].versions = [prod.version]
        components[prod.module].title = prod.name.en || prod.module
        components[prod.module].type = prod.type
      }
    }
    const types = new Set(modulesList.map((item) => item.type))
    setModuleTypes(Array.from(types))
    setAllModules(components)
  }, [modulesList])

  const addModule = () => {
    const currModule = {
      contentId: null,
      id: `${slot.key}-${selectedModule.name}`,
      library: '',
      slot: slot.key,
      ...selectedModule,
    }
    addNewModule(currModule)
    setExistingModule(true)
    setSelectedModule({ type: '', module: '', name: '', version: '', status: false })
    setOpenModal(false)
  }

  return (
    <div className="bg-white rounded-lg p-4 mt-2 border border-gray-400" ref={dropRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label htmlFor={slot.key} className="font-bold text-sm">
            {slot.name['en']}
          </label>
          <Input
            type="toggle"
            variant="primary"
            checked={active}
            id={slot.key}
            onChange={handleSlotActivation(slot.key)}
          />
        </div>
        <Button onClick={() => setOpenModal(true)}>Add Module</Button>
      </div>
      <div>
        {slot.modules.map((module, index) => (
          <Module
            id={module.id}
            name={module.name}
            module={module.module}
            deleteModule={deleteModule(slot.key)}
            editModule={editModule}
            key={module.id}
            slot={module.slot}
            swapModuleInSlot={swapModuleInSlot}
            moduleIndex={index}
            slots={slots}
            domainId={domainId}
            moduleType={module.type}
          />
        ))}
        {hovered && slot.key !== draggedItem.slot && (
          <div className="p-2 my-2 border border-dashed border-gray-400 bg-gray-100 rounded-lg text-center">
            Drop Here To Move Widget To {slot.name['en']}
          </div>
        )}
      </div>
      {/* <ModuleSelection modules={modules} onAddModule={addModule(slot.key)} /> */}
      <PopUp openModal={openModal}>
        <div className="bg-white md:w-3/4 xl:w-2/4 mx-auto mt-72 p-6 rounded-lg">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">Add Module</h1>
            <svg
              onClick={() => {
                setOpenModal(false)
                setExistingModule(true)
                setSelectedModule({ type: '', module: '', name: '', version: '', status: false })
              }}
              className="w-4 h-4 cursor-pointer fill-current sm:w-6 sm:h-6"
              role="button"
              viewBox="0 0 20 20"
            >
              <path
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center my-2">
              <label>Add Existing module</label>
              <Input
                type="toggle"
                variant="primary"
                title="Existing Module"
                checked={existingModule}
                name={`existingModule-${slot.key}`}
                id={`existingModule-${slot.key}`}
                onChange={(e) => {
                  setExistingModule(e.target.checked)
                }}
              />
            </div>
            <div>
              {existingModule && (
                <div className="flex items-start flex-wrap">
                  <div className="p-2 w-1/2">
                    <label className="block mb-2 text-sm text-gray-500">Type :</label>
                    <Select
                      variant="primary"
                      value={selectedModule.type}
                      onChange={(e) =>
                        setSelectedModule((prev) => ({
                          ...prev,
                          type: e.target.value,
                          module: '',
                          version: '',
                          name: '',
                        }))
                      }
                    >
                      <option value="">Select module type</option>
                      {moduleTypes.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="p-2 w-1/2">
                    {!!selectedModule.type && (
                      <ModuleSelection
                        modules={modules.filter((item) => item.type === selectedModule.type)}
                        setOpenModal={setOpenModal}
                        onAddModule={addExistingModule(slot.key)}
                      />
                    )}
                  </div>
                </div>
              )}

              {!existingModule && (
                <div className="flex items-center flex-wrap">
                  <div className="p-2 w-1/2">
                    <label className="block mb-2 text-sm text-gray-500">Type :</label>
                    <Select
                      variant="primary"
                      value={selectedModule.type}
                      onChange={(e) =>
                        setSelectedModule((prev) => ({
                          ...prev,
                          type: e.target.value,
                          module: '',
                          version: '',
                          name: '',
                          status: false,
                        }))
                      }
                    >
                      <option value="">Select module type</option>
                      {moduleTypes.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {!!selectedModule.type && (
                    <div className="p-2 w-1/2">
                      <label className="block mb-2 text-sm text-gray-500">Please Select A Module :</label>
                      <Select
                        variant="primary"
                        value={selectedModule.module}
                        onChange={(e) =>
                          setSelectedModule((prev) => ({
                            ...prev,
                            module: e.target.value,
                            version: '',
                            name: '',
                            status: false,
                          }))
                        }
                      >
                        <option value="">Select module</option>
                        {Object.keys(allModules)
                          .filter((item) => allModules[item].type === selectedModule.type)
                          .map((item) => (
                            <option value={item} key={item}>
                              {allModules[item].title || item}
                            </option>
                          ))}
                      </Select>
                    </div>
                  )}
                  {!!selectedModule.type && !!selectedModule.module && (
                    <>
                      <div className="p-2 w-1/2">
                        <label className="block mb-2 text-sm text-gray-500">Version :</label>
                        <Select
                          variant="primary"
                          value={selectedModule.version}
                          onChange={(e) => setSelectedModule((prev) => ({ ...prev, version: e.target.value }))}
                        >
                          <option value="">Select version</option>
                          {allModules[selectedModule.module].versions.map((item) => (
                            <option value={item} key={item}>
                              {item}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="p-2 w-1/2">
                        <label className="block mb-2 text-sm text-gray-500">Name :</label>
                        <Input
                          type="text"
                          variant="primary"
                          value={selectedModule.name}
                          onChange={(e) => setSelectedModule((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="p-2 w-1/2 flex items-center">
                        <label className="text-sm text-gray-500">Status :</label>
                        <Input
                          type="toggle"
                          variant="primary"
                          id={`status-${slot.key}`}
                          checked={selectedModule.status}
                          onChange={(e) => setSelectedModule((prev) => ({ ...prev, status: e.target.checked }))}
                        />
                      </div>
                    </>
                  )}
                  <div className="w-full pt-2 px-2 text-right">
                    <Button
                      variant="primary"
                      type="button"
                      disabled={
                        !selectedModule.module ||
                        !selectedModule.name ||
                        !selectedModule.version ||
                        !selectedModule.name
                      }
                      onClick={addModule}
                    >
                      Add Module
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PopUp>
    </div>
  )
}

export default Slot
