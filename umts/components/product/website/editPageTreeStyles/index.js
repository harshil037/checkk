import React, { useState, useContext, useEffect, useMemo } from 'react'
import PopUp from '../../../../components/dialog/popUp'
import { Input } from '../../../../components/componentLibrary'
import Button from '../../../../components/common/Button'
import useConfirm from '../../../../components/dialog/useConfirm'
import EditComponent from '../../../EditComponent'
import { deepClone } from '../../../../lib/object'
import { isEqual } from '../../../../lib/utils'

const EditPagetreeStyles = ({ draft, setDraft, setOpenStylesModal, globalStylesProps }) => {
  const { isConfirmed } = useConfirm()

  /***** component states start *****/
  const [styleProps, setStyleProps] = useState({ themes: [], props: [] })
  const [prevStyleProps, setPrevStyleProps] = useState({ themes: [], props: [] })
  const [currentTheme, setCurrentTheme] = useState('default')
  const [themeToAdd, setThemeToAdd] = useState('')
  const [openAddThemeModal, setOpenAddThemeModal] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isReset, setIsReset] = useState(false)
  /***** component states ends *****/

  useEffect(() => {
    if (globalStylesProps?.props) {
      const props = deepClone(globalStylesProps.props)
      if (draft?.themes?.length > 0) {
        const newProps = addThemesInProps(props)
        setStyleProps({ themes: draft.themes, props: newProps })
        setPrevStyleProps({ themes: draft.themes, props: newProps })
      } else {
        setStyleProps({ themes: [], props: props })
        setPrevStyleProps({ themes: [], props: props })
      }
    }
  }, [globalStylesProps?.props])

  useEffect(() => {
    if (isReset) {
      if (!isEqual(prevStyleProps, styleProps)) {
        setStyleProps(prevStyleProps)
      }
      setIsReset(false)
    }
  }, [isReset])

  /**
   * Save changes
   */
  const handleSubmit = async (values) => {
    const confirmed = await isConfirmed(`Are you sure to save the changes ?`)
    if (confirmed) {
      setDraft((prev) => ({ ...prev, styles: values, themes: styleProps.themes }))
      setOpenStylesModal(false)
    }
  }

  const handleCancel = async () => {
    const confirmed = await isConfirmed(`Are you sure to discard the changes ?`)
    if (confirmed) {
      setOpenStylesModal(false)
    }
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
          newProps.push({
            ...prop[i],
            props: removeThemesFromProps(prop[i].props),
          })
          break
        case 'list':
          newProps.push({
            ...prop[i],
            props: removeThemesFromProps(prop[i].props),
          })
          break
        default:
          newProps.push(prop[i])
      }
    }

    return newProps
  }

  const handleThemeBased = async (e) => {
    if (e.target.checked) {
      const confirmed = await isConfirmed(`Are you sure to make styles theme based?`)
      if (confirmed) {
        setStyleProps({ themes: ['default'], props: addThemesInProps(deepClone(styleProps.props)) })
      }
    } else {
      const confirmed = await isConfirmed(`Are you sure to remove themes?`)
      if (confirmed) {
        setStyleProps({ themes: [], props: removeThemesFromProps(deepClone(styleProps.props)) })
        setCurrentTheme('default')
      }
    }
  }

  const addTheme = () => {
    if (themeToAdd && !styleProps.themes.includes(themeToAdd)) {
      setStyleProps((prev) => ({ ...prev, themes: [...prev.themes, themeToAdd] }))
      setThemeToAdd('')
      setOpenAddThemeModal(false)
    }
  }

  const removeTheme = (theme) => async () => {
    const confirmed = await isConfirmed(`Are you sure to remove ${theme} theme?`)
    if (confirmed) {
      setStyleProps((prev) => ({ ...prev, themes: prev.themes.filter((item) => item !== theme) }))
      setCurrentTheme('default')
    }
  }

  return (
    <div>
      <div className="w-full text-left bg-white rounded-lg">
        <div className="flex w-full py-2 justify-between items-center border-b border-b-black mb-2">
          <h2 className="text-xl font-semibold text-gray-600">Pagetree Styles</h2>
          <div className="flex items-center">
            <label htmlFor="themebased-global-styles">Theme Based</label>
            <Input
              type="toggle"
              variant="primary"
              id="themebased-global-styles"
              checked={styleProps.themes.length > 0}
              onChange={handleThemeBased}
            />
            {styleProps.themes.length > 0 && (
              <>
                <p className="font-bold mr-2">Themes :</p>
                {styleProps.themes.map((item) => (
                  <Button
                    variant="secondary"
                    className="mr-2"
                    key={item}
                    disabled={item === 'default'}
                    onClick={removeTheme(item)}
                  >
                    {item}
                    {item !== 'default' && (
                      <img className="inline-block ml-2" src="/images/langaugedelete.svg" alt="Delete Theme" />
                    )}
                  </Button>
                ))}

                <Button
                  variant="success"
                  onClick={() => setOpenAddThemeModal(true)}
                  type="button"
                  className="!bg-white mr-2"
                  title="To add new a theme"
                >
                  Add Theme
                  <img className="inline-block" src="/images/plus-bar.svg" alt="Pages" />
                </Button>
              </>
            )}

            <Button
              onClick={() => {
                if (isDirty) {
                  handleCancel()
                } else {
                  setOpenStylesModal(false)
                }
              }}
              type="button"
              variant="danger"
            >
              Cancel
            </Button>
          </div>
        </div>
        <div className="p-4 border border-gray-400 rounded-lg max-h-[calc(100vh_-_278px)] overflow-y-auto overflow-x-hidden custom-scrollbar custom-scrollbar-bg-light">
          {styleProps.props.length > 0 && (
            <EditComponent
              currentTheme={currentTheme}
              themes={styleProps.themes}
              fields={styleProps.props}
              value={draft.styles || {}}
              onSubmit={(values) => {
                handleSubmit(values)
              }}
              onThemeChange={setCurrentTheme}
              isDirty={setIsDirty}
              onReset={() => {
                setIsReset(true)
              }}
            />
          )}
        </div>
      </div>
      {/* Add Theme PopUp */}
      <PopUp openModal={openAddThemeModal}>
        <div className="w-1/2 p-4 mt-36 mx-auto bg-white rounded-lg ">
          <div className="flex justify-between pb-2 border-b border-black border-solid">
            <h1 className="text-lg sm:text-[22px] text-heading font-medium w-10/12 text-left">Add Theme</h1>
            <svg
              onClick={() => {
                setOpenAddThemeModal(false)
                setThemeToAdd('')
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
            <div className="w-5/6 mx-auto my-2">
              <label className="mt-2">Theme : </label>
              <div className="my-2">
                <Input
                  type="text"
                  variant="primary"
                  value={themeToAdd}
                  onChange={(e) => setThemeToAdd(e.target.value.trim())}
                  className="py-2"
                />
              </div>
              <div className="flex w-full justify-center mt-4">
                <Button variant="success" onClick={addTheme}>
                  Add
                </Button>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </PopUp>
    </div>
  )
}

export default EditPagetreeStyles
