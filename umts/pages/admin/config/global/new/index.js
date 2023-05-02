import React, { useState, useEffect, useContext, useMemo } from 'react'
import Authenticate from '../../../../../lib/authenticate'
import { AppContext } from '../../../../../context/appContext'
import { useRouter } from 'next/router'
import { get, set } from '../../../../../lib/object.js'
import Container from '../../../../../components/common/container'

const GlobalConfig = () => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)
  const [selectedField, setSelectedField] = useState({
    type: '',
    label: '',
    key: '',
    languages: false,
  })
  const initialProps = {
    name: 'config',
    props: [
      { type: 'text', languages: false, key: 'hello', label: 'Hello' },
      { type: 'list', languages: false, key: 'list', label: 'List' },
      {
        type: 'container',
        languages: false,
        key: 'cont',
        label: 'Container',
        props: [
          { type: 'text', languages: false, key: 'world', label: 'World' },
          { type: 'text', languages: true, key: 'worldLang', label: 'WorldLang' },
          { type: 'list', languages: true, key: 'list2', label: 'List2' },
          {
            type: 'container',
            languages: false,
            key: 'cont2',
            label: 'Container',
            props: [{ type: 'text', languages: false, key: 'textInput', label: 'Text Input' }],
          },
        ],
      },
    ],
    languages: ['de', 'it', 'en'],
    values: {
      hello: '',
      list: [],
      cont: {
        world: '',
        worldLang: { en: '', de: '', it: '' },
        list2: { en: [], de: [], it: [] },
        cont2: {
          textInput: '',
        },
      },
    },
  }

  // const initialProps = {
  //   name: 'config',
  //   props: [],
  //   languages: ['de', 'it', 'en'],
  //   values: {},
  // }

  const [form, setForm] = useState(initialProps)
  const [currentLang, setCurrentLang] = useState('en')
  const [editField, setEditField] = useState({ index: null, isEditing: false })
  const [editFormErrors, setEditFormErrors] = useState({ label: '', key: '' })
  const [language, setLanguage] = useState('')
  const [editView, setEditView] = useState(false)

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'config',
    }))
  }, [])

  const handleChange = (path, value) => {
    const valuesObj = { ...form.values }
    set(valuesObj, path, value)
    setForm((prev) => ({ ...prev, values: valuesObj }))
  }

  const addField = (propsPath, path) => () => {
    const props = [...form.props]
    const valuesObj = { ...form.values }

    const key = 'newKey'
    const value = ''

    const val = propsPath ? get(props, propsPath) : props
    val.push({ type: 'text', languages: false, key: key, label: 'New Label' })

    set(valuesObj, `${path}.${key}`, value)

    if (propsPath) {
      set(props, propsPath, val)
      setForm((prev) => ({ ...prev, props: props, values: valuesObj }))
    } else {
      setForm((prev) => ({ ...prev, props: val, values: valuesObj }))
    }
  }

  return (
    <div className="p-4 mt-8 text-left bg-white rounded-lg">
      <Container
        props={form.props}
        values={form.values}
        setCurrentLang={setCurrentLang}
        currentLang={currentLang}
        languages={form.languages}
        path=""
        handleChange={handleChange}
        // propsPath="props"
        addField={addField}
      />
    </div>
  )
}

export default GlobalConfig

export async function getServerSideProps(context) {
  return Authenticate(context)
}
