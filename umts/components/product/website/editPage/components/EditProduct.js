import React, { useState, useEffect, useContext } from 'react'
import EditComponent from '../../../../EditComponent'
import { AppContext } from '../../../../../context/appContext'
import { deepClone } from '../../../../../lib/object'
import { Input } from '../../../../componentLibrary'
import Button from '../../../../common/Button'
import { isEqual } from '../../../../../lib/utils'

const EditProduct = ({
  props,
  product,
  languages,
  addContentId,
  setEditProductPopup,
  domainId,
  isConfirmed,
  clientId,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(languages[0] || 'en')
  const [value, setValue] = useState({})
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [themeData, setThemeData] = useState({ themeBased: false, themes: [] })
  const [prevThemeData, setPrevThemeData] = useState({ themeBased: false, themes: [] })
  const [currentTheme, setCurrentTheme] = useState('default')
  const [formProps, setFormProps] = useState(props.props)
  const [prevFormProps, setPrevFormProps] = useState(props.props)
  const [themeToAdd, setThemeToAdd] = useState('')
  const [isReset, setIsReset] = useState(false)

  useEffect(() => {
    if (product.contentId) {
      ;(async () => {
        setLoading(true)
        const { data, error } = await (await fetch(`/api/contents/${product.contentId}`)).json()

        if (!error) {
          if (data.themeBased) {
            const newProps = deepClone(formProps)
            const stylesIndex = newProps.findIndex((item) => item.inputType === 'staticList' && item.key === 'styles')
            if (stylesIndex !== -1) {
              newProps[stylesIndex].props = addThemesInProps(newProps[stylesIndex].props)
              setFormProps(newProps)
              setPrevFormProps(newProps)
              setThemeData({ themeBased: data.themeBased, themes: data.themes })
              setPrevThemeData({ themeBased: data.themeBased, themes: data.themes })
            }
          }
          setValue(data.blockProps)
        }
        setLoading(false)
      })()
    }
  }, [])

  useEffect(() => {
    if (isReset) {
      if (!isEqual(themeData, prevThemeData)) {
        setFormProps(prevFormProps)
        setThemeData(prevThemeData)
      }
      setIsReset(false)
    }
  }, [isReset])

  const handleSubmit = async (values, { setSubmitting }) => {
    isConfirmed(
      `Are you sure you want to save changes ? ${!product.contentId ? 'It will save the data in the pagetree.' : ''}`,
    ).then(async (confirm) => {
      if (confirm) {
        setLoading(true)

        const data = {
          name: product.name,
          module: product.module,
          type: product.type,
          version: product.version,
          languages: languages,
          status: product.status,
          props: formProps,
          themeBased: themeData.themeBased,
          themes: themeData.themes,
          blockProps: values,
        }

        if (product.contentId) {
          const response = await fetch(`/api/contents/${product.contentId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (result.data.success) {
            setSubmitting(false)
            setLoading(false)
            setEditProductPopup({
              openPopup: false,
              props: [],
              languages: ['en'],
              product: null,
            })
          }
        } else {
          const response = await fetch('/api/contents', {
            method: 'POST',
            body: JSON.stringify({ domainId, ...data }),
          })

          const result = await response.json()

          setSubmitting(false)
          addContentId(product, result.data._id)
          setLoading(false)
          setEditProductPopup({
            openPopup: false,
            props: [],
            languages: ['en'],
            product: null,
          })
        }
      }
    })
  }

  const addThemesInProps = (prop = []) => {
    const newProps = []
    for (let i = 0; i < prop.length; i++) {
      switch (prop[i].inputType) {
        case 'text':
          newProps.push({ ...prop[i], themeBased: true })
          break
        case 'color':
          newProps.push({ ...prop[i], themeBased: true })
          break
        case 'staticList':
          newProps.push({ ...prop[i], props: addThemesInProps(prop[i].props) })
          break
        case 'list':
          newProps.push({ ...prop[i], props: addThemesInProps(prop[i].props) })
          break
        default:
          newProps.push(prop[i])
      }
    }
    return newProps
  }

  const removeThemesFromProps = (prop) => {
    const newProps = []
    for (let i = 0; i < prop.length; i++) {
      switch (prop[i].inputType) {
        case 'text':
          delete prop[i].themeBased
          newProps.push(prop[i])
          break
        case 'color':
          delete prop[i].themeBased
          newProps.push(prop[i])
          break
        case 'staticList':
          newProps.push({ ...prop[i], props: removeThemesFromProps(prop[i].props) })
          break
        case 'list':
          newProps.push({ ...prop[i], props: removeThemesFromProps(prop[i].props) })
          break
        default:
          newProps.push(prop[i])
      }
    }

    return newProps
  }

  const handleThemeBased = async (e) => {
    const { checked } = e.target
    const response = await isConfirmed(`Confirm ${checked ? 'make theme based?' : 'remove all themes?'}`)

    if (response) {
      if (checked) {
        const newProps = deepClone(formProps)
        const stylesIndex = newProps.findIndex((item) => item.inputType === 'staticList' && item.key === 'styles')
        if (stylesIndex !== -1) {
          newProps[stylesIndex].props = addThemesInProps(newProps[stylesIndex].props)

          setThemeData({ themeBased: checked, themes: ['default'] })
          setFormProps(newProps)
        } else {
          await isConfirmed('This component doesnot have styles!', true)
        }
      } else {
        const newProps = deepClone(formProps)
        const stylesIndex = newProps.findIndex((item) => item.inputType === 'staticList' && item.key === 'styles')
        if (stylesIndex !== -1) {
          newProps[stylesIndex].props = removeThemesFromProps(newProps[stylesIndex].props)
          setFormProps(newProps)
          setThemeData({ themeBased: checked, themes: [] })
        } else {
          setThemeData({ themeBased: checked, themes: [] })
        }
      }
    }
  }

  const hasStyles = (props = []) => {
    const styles = props.find((item) => item.key === 'styles' && item.inputType === 'staticList')

    if (styles) return true
    return false
  }

  return (
    <div>
      {hasStyles(formProps) && (
        <div className="flex flex-wrap items-center border border-gray-400 p-4 rounded-lg mb-2">
          <label>Theme Based:</label>
          <Input
            type="toggle"
            checked={themeData.themeBased}
            onChange={handleThemeBased}
            variant="primary"
            id="themeBased"
          />
          {themeData.themeBased && (
            <div className="flex items-center">
              <div className="w-48">
                <Input
                  type="text"
                  variant="primary"
                  value={themeToAdd}
                  onChange={(e) => {
                    setThemeToAdd(e.target.value.trim())
                  }}
                />
              </div>
              <Button
                type="button"
                variant="primary"
                className="mx-4"
                onClick={() => {
                  if (themeToAdd && !themeData.themes.includes(themeToAdd)) {
                    setThemeData((prev) => ({ ...prev, themes: [...prev.themes, themeToAdd] }))
                    setThemeToAdd('')
                  }
                }}
              >
                Add Theme
              </Button>

              {themeData.themes.map((item) => (
                <Button
                  type="button"
                  className="mx-2 uppercase"
                  variant="secondary"
                  key={item}
                  disabled={item === 'default'}
                  title={item === 'default' ? 'Can not delete default theme!' : ''}
                  onClick={() => {
                    isConfirmed(`Delete ${item} theme?`).then((confirm) => {
                      if (confirm) {
                        setThemeData((prev) => ({ ...prev, themes: prev.themes.filter((theme) => theme !== item) }))
                        setCurrentTheme('default')
                      }
                    })
                  }}
                >
                  {item} {item !== 'default' && <img src="/images/trash.svg" className="inline ml-1" />}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      <EditComponent
        languages={languages}
        onLanguageChange={setCurrentLanguage}
        fields={formProps}
        onSubmit={handleSubmit}
        value={value}
        currentLanguage={currentLanguage}
        themes={themeData.themes}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        onReset={() => {
          setIsReset(true)
        }}
        isSticky={false}
        clientId={clientId}
      />
    </div>
  )
}

export default EditProduct
