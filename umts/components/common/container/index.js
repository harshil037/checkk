import React, { useState } from 'react'
import { TextInput, ListInput, ContainerInput } from './components'
import { Button } from '../../componentLibrary'
import PlusIcon from '../../icons/plus'

const Container = ({
  props = [],
  values = {},
  path = '',
  setPath,
  setPropsPath,
  currentLang = 'en',
  languages = ['en'],
  setCurrentLang,
  handleChange,
  propsPath = '',
  focusedField,
  handleFocusField,
  setFocusValue,
  editable,
  onEdit = () => {},
  setOpenModal,
  activeTab,
  accordion,
  handleAccordion = () => {},
  handleListChange,
  addListItem,
  removeListItem,
  setEditPath,
  setEditPropsPath,
}) => {
  const generateFields = (props = []) => {
    const fields = []
    for (let i = 0; i < props.length; i++) {
      const currentField = props[i]
      if (currentField.type === 'text') {
        if (currentField.languages) {
          fields.push(
            <TextInput
              key={path === '' ? currentField.key : `${path}.${currentField.key}.${i}`}
              path={path === '' ? currentField.key : `${path}.${currentField.key}`}
              label={currentField.label[currentLang] || currentField?.key}
              value={values[currentField.key][currentLang]}
              values={values[currentField.key]}
              placeholder={currentField.label[currentLang] || currentField?.key}
              languageBased={true}
              languages={languages}
              currentLanguage={currentLang}
              onLanguageChange={(lang) => setCurrentLang(lang)}
              focusedField={focusedField}
              handleFocusField={handleFocusField}
              setFocusValue={setFocusValue}
              editable={editable}
              onEditField={() => {
                const newPath = propsPath !== '' ? `${path}.${currentField.key}` : `${currentField.key}`
                const newPropsPath = propsPath !== '' ? `${propsPath}.${i}` : `${i}`
                onEdit(i, newPath, newPropsPath)
              }}
              onChange={(e) =>
                handleChange(
                  path === '' ? `${currentField.key}.${currentLang}` : `${path}.${currentField.key}.${currentLang}`,
                  e.target.value,
                )
              }
            />,
          )
        } else {
          fields.push(
            <TextInput
              key={path === '' ? currentField.key : `${path}.${currentField.key}.${i}`}
              path={path === '' ? currentField.key : `${path}.${currentField.key}`}
              label={currentField.label[currentLang] || currentField?.key}
              value={values[currentField.key]}
              placeholder={currentField.label[currentLang] || currentField?.key}
              editable={editable}
              onEditField={() => {
                const newPath = propsPath !== '' ? `${path}.${currentField.key}` : `${currentField.key}`
                const newPropsPath = propsPath !== '' ? `${propsPath}.${i}` : `${i}`
                onEdit(i, newPath, newPropsPath)
              }}
              onChange={(e) =>
                handleChange(path === '' ? currentField.key : `${path}.${currentField.key}`, e.target.value)
              }
            />,
          )
        }
      } else if (currentField.type === 'list') {
        if (currentField.languages) {
          fields.push(
            <ListInput
              key={path === '' ? currentField.key : `${path}.${currentField.key}.${i}`}
              // path={path === '' ? currentField.key : `${path}.${currentField.key}`}
              label={currentField.label[currentLang] || currentField?.key}
              value={values[currentField.key]}
              placeholder={currentField.label[currentLang] || currentField?.key}
              languageBased={true}
              languages={languages}
              componentKey={currentField.key}
              currentLanguage={currentLang}
              onLanguageChange={(lang) => setCurrentLang(lang)}
              editable={editable}
              onEditField={() => {
                const newPath = propsPath !== '' ? `${path}.${currentField.key}` : `${currentField.key}`
                const newPropsPath = propsPath !== '' ? `${propsPath}.${i}` : `${i}`
                onEdit(i, newPath, newPropsPath)
              }}
              onChange={(values) => {
                handleChange(`${path}.${currentField.key}`, values)
              }}
            />,
          )
        } else {
          fields.push(
            <ListInput
              key={path === '' ? currentField.key : `${path}.${currentField.key}.${i}`}
              // path={path === '' ? currentField.key : `${path}.${currentField.key}`}
              label={currentField.label[currentLang] || currentField?.key}
              value={values[currentField.key]}
              placeholder={currentField.label[currentLang] || currentField?.key}
              componentKey={currentField.key}
              editable={editable}
              onEditField={() => {
                const newPath = propsPath !== '' ? `${path}.${currentField.key}` : `${currentField.key}`
                const newPropsPath = propsPath !== '' ? `${propsPath}.${i}` : `${i}`
                onEdit(i, newPath, newPropsPath)
              }}
              onChange={(values) => {
                handleChange(`${path}.${currentField.key}`, values)
              }}
            />,
          )
        }
      } else if (activeTab !== 'general' && currentField.type === 'container') {
        fields.push(
          <ContainerInput
            key={path === '' ? currentField.key : `${path}.${currentField.key}.${i}`}
            path={path === '' ? currentField.key : `${path}.${currentField.key}`}
            header={currentField.label[currentLang] || currentField?.key}
            editable={editable}
            onEditField={() => {
              const newPath = propsPath !== '' ? `${path}.${currentField.key}` : `${currentField.key}`
              const newPropsPath = propsPath !== '' ? `${propsPath}.${i}` : `${i}`
              onEdit(i, newPath, newPropsPath)
            }}
            accordion={accordion}
            handleAccordion={() => {
              handleAccordion(path, currentField.key, i)
            }}
            accordionPath={`${path}${currentField.key}[${i}]`}
          >
            <Button
              className={`flex gap-2 px-3 py-1 border rounded-md border-primary-400`}
              onClick={() => {
                // setPath(path === '' ? currentField.key : `${path}.${currentField.key}`)
                // setPropsPath(propsPath !== '' ? `${propsPath}.${i}.props` : `${i}.props`)
                setEditPath(path === '' ? currentField.key : `${path}.${currentField.key}`)
                setEditPropsPath(propsPath !== '' ? `${propsPath}.${i}.props` : `${i}.props`)
                setOpenModal(true)
              }}
            >
              <span>Add {currentField.label[currentLang] || currentField?.key}</span>
              <span>
                <PlusIcon className="fill-[#68D0C2]"></PlusIcon>
              </span>
            </Button>
            <div>
              <Container
                values={values[currentField.key]}
                path={path === '' ? currentField.key : `${path}.${currentField.key}`}
                setPath={setPath}
                setPropsPath={setPropsPath}
                currentLang={currentLang}
                languages={languages}
                setCurrentLang={setCurrentLang}
                key={currentField.key}
                props={currentField.props}
                handleChange={handleChange}
                propsPath={propsPath !== '' ? `${propsPath}.${i}.props` : `${i}.props`}
                focusedField={focusedField}
                handleFocusField={handleFocusField}
                setFocusValue={setFocusValue}
                editable={editable}
                onEdit={onEdit}
                setOpenModal={setOpenModal}
                activeTab={activeTab}
                accordion={accordion}
                handleAccordion={handleAccordion}
                handleListChange={handleListChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
                setEditPath={setEditPath}
                setEditPropsPath={setEditPropsPath}
              />
            </div>
          </ContainerInput>,
        )
      }
    }
    return fields
  }

  return <div className="w-full">{generateFields(props)}</div>
}

export default Container
// export default React.memo(Container)
