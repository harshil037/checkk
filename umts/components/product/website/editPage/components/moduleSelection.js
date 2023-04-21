import React, { useState } from 'react'
import Button from '../../../../common/Button'
import { Select } from '../../../../componentLibrary'

const ModuleSelection = ({ modules = [], onAddModule, setOpenModal }) => {
  const [formErrors, setFormErrors] = useState({ isValid: false })
  const [module, setModule] = useState('')

  return (
    <div>
      <label className="text-sm block mb-2 text-gray-500">Please Select A Module :</label>
      <div className="flex">
        <Select
          variant={formErrors?.name ? 'danger' : 'primary'}
          value={module}
          onChange={(e) => setModule(e.target.value)}
        >
          <option value="">Select a existing module</option>
          {modules.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} ({product.module})
            </option>
          ))}
        </Select>
      </div>
      <div className="w-full pt-4 text-right">
        <Button
          onClick={() => {
            onAddModule(module)
            setModule('')
            setOpenModal(setOpenModal(false))
          }}
          disabled={!module}
        >
          Add Module
        </Button>
      </div>
      <span className="text-red-500">{formErrors?.name}</span>
    </div>
  )
}

export default ModuleSelection
