import dynamic from 'next/dynamic'
import Button from '../../../common/Button'
import ArrayInput from './ArrayInput'
import ColorField from './ColorInput'
import DateTime from './DateTime'
import KeyedInput from './KeyedInput'
import ListInput from './ListInput'
import MultiSelect from './MultiSelect'
import RadioInput from './RadioInput'
import Select from './Select'
import StaticList from './StaticList'
import TextInput from './TextInput'
import ToggleInput from './ToggleInput'
import ImageInput from './ImageInput'

const RichTextEditor = dynamic(() => import('./RTE'), {
  ssr: false,
  loading: () => <div className="border border-gray-400 rounded-lg p-4 text-center">Loading the editor...</div>,
})

export const getField = ({
  inputType,
  key,
  description,
  label,
  props,
  options,
  languages,
  type,
  placeholder,
  path = '',
  currentLanguage,
  formLanguages,
  multiSelect,
  accordion,
  handleAccordion,
  onLanguageChange,
  themes,
  currentTheme,
  onThemeChange,
  themeBased,
  clientId = '',
}) => {
  switch (inputType) {
    case 'text':
      if (!languages) {
        if (themeBased) {
          return (
            <div className="w-1/2 flex flex-wrap items-center" key={`${path}${key}.${currentTheme}`}>
              <TextInput
                name={`${path}${key}.${currentTheme}`}
                label={label[currentLanguage] || key}
                type={type}
                placeholder={placeholder}
                className="w-1/2 p-2"
              />

              {themes?.map((theme) => (
                <Button
                  variant="secondary"
                  type="button"
                  className={` rounded-lg uppercase mt-6 p-2 mx-2 ${
                    theme === currentTheme ? 'border-2 font-bold' : 'border'
                  } border-gray-400`}
                  key={theme}
                  onClick={() => onThemeChange(theme)}
                >
                  {theme}
                </Button>
              ))}
            </div>
          )
        } else {
          return (
            <TextInput
              name={`${path}${key}`}
              label={label[currentLanguage] || key}
              type={type}
              placeholder={placeholder}
              key={`${path}${key}`}
              className="w-1/2 p-2"
            />
          )
        }
      } else {
        return (
          <div className="w-full flex flex-wrap items-center" key={`${path}${key}.${currentLanguage}`}>
            <TextInput
              name={`${path}${key}.${currentLanguage}`}
              label={label[currentLanguage] || key}
              type={type}
              placeholder={placeholder}
              className="w-1/2 p-2"
            />
            {formLanguages.map((language) => (
              <Button
                variant="secondary"
                type="button"
                className={` rounded-lg mt-6 uppercase mx-2 ${
                  language === currentLanguage ? 'border-2 font-bold' : 'border'
                } border-gray-400`}
                key={language}
                onClick={() => onLanguageChange(language)}
              >
                {language}
              </Button>
            ))}
          </div>
        )
      }
    case 'select':
      if (!languages) {
        return (
          <Select
            className={'w-1/2 p-2'}
            name={`${path}${key}`}
            key={`${path}${key}`}
            label={label[currentLanguage] || key}
            options={options}
          />
        )
      } else {
        return (
          <div className="w-1/2 flex flex-wrap items-center" key={`${path}${key}`}>
            <Select
              className={'w-1/2 p-2'}
              name={`${path}${key}.${currentLanguage}`}
              key={`${path}${key}`}
              label={label[currentLanguage] || key}
              options={options.map((option) => ({
                title: option.title[currentLanguage]
                  ? option.title[currentLanguage]
                  : typeof option.title === 'string'
                  ? option.title
                  : option.title[Object.keys(option.title)[0]],
                value: option.value[currentLanguage]
                  ? option.value[currentLanguage]
                  : typeof option.value === 'string'
                  ? option.value
                  : option.value[Object.keys(option.value)[0]],
              }))}
            />
            {formLanguages.map((language) => (
              <Button
                variant="secondary"
                type="button"
                className={`rounded-lg mt-6 p-2 uppercase mx-2 ${
                  language === currentLanguage ? 'border-2 font-bold' : 'border'
                } border-gray-400`}
                key={language}
                onClick={() => onLanguageChange(language)}
              >
                {language}
              </Button>
            ))}
          </div>
        )
      }
    case 'list':
      return (
        <div key={`${path}${key}`} className="p-2 my-1 w-full">
          <ListInput
            name={`${path}${key}`}
            label={label[currentLanguage] || key}
            props={props}
            currentLanguage={currentLanguage}
            formLanguages={formLanguages}
            key={`${path}${key}`}
            accordion={accordion}
            handleAccordion={handleAccordion}
            fieldKey={key}
            path={path}
            onLanguageChange={onLanguageChange}
            currentTheme={currentTheme}
            themes={themes}
            onThemeChange={onThemeChange}
            clientId={clientId}
          />
        </div>
      )
    case 'staticList':
      return (
        <div className="p-2 w-full" key={`${path}${key}`}>
          <StaticList
            name={`${path}${key}`}
            label={label[currentLanguage] || key}
            props={props}
            path={path}
            fieldKey={key}
            currentLanguage={currentLanguage}
            formLanguages={formLanguages}
            onLanguageChange={onLanguageChange}
            currentTheme={currentTheme}
            themes={themes}
            onThemeChange={onThemeChange}
            accordion={accordion}
            handleAccordion={handleAccordion}
            clientId={clientId}
          />
        </div>
      )
    case 'array':
      if (!languages) {
        return (
          <ArrayInput
            name={`${path}${key}`}
            label={label[currentLanguage] || key}
            className="p-2 m-2 w-full px-4 mb-4 border border-gray-400 rounded-lg lg:mt-5 text-sm"
            key={`${path}${key}`}
            placeholder={placeholder}
            type={type}
          />
        )
      } else {
        return (
          <div className="w-full flex flex-wrap items-start m-2 p-4 border border-gray-400 rounded-lg" key={`${path}${key}`}>
            <ArrayInput
              className={'w-full text-sm'}
              name={`${path}${key}.${currentLanguage}`}
              key={`${path}${key}`}
              label={label[currentLanguage] || key}
              placeholder={placeholder}
              type={type}
            />
            {formLanguages.map((language) => (
              <Button
                variant='secondary'
                type="button"
                className={`rounded-lg uppercase mt-4 mx-2 ${
                  language === currentLanguage ? 'border-2 font-bold' : 'border'
                } border-gray-400`}
                key={language}
                onClick={() => onLanguageChange(language)}
              >
                {language}
              </Button>
            ))}
          </div>
        )
      }
    case 'toggle':
      return (
        <div className="p-2 w-1/2 flex my-3 md:mt-5 items-center" key={`${path}${key}`}>
          <ToggleInput name={`${path}${key}`} label={label[currentLanguage] || key} />
        </div>
      )
    case 'rte':
      if (languages) {
        return (
          <div className="m-2 w-full p-4 border border-gray-300 rounded-xl" key={`${path}${key}`}>
            <label className="block mb-4 pl-3 text-sm">{label[currentLanguage] || key}</label>
            <ul className="flex ml-2 flex-wrap">
              {formLanguages.map((language, i) => {
                return (
                  <li
                    className={`bg-white text-gray-800 p-2 mr-4 rounded-t cursor-pointer after:absolute after:top-0 after:right-0 after:left-0  after:h-1 after:w-full relative after:rounded-t-lg border-r border-l border-t border-gray-300 ${
                      language === currentLanguage ? 'after:bg-primary-400' : 'after:bg-transparent'
                    }`}
                    key={`${path}${key}` + language + i}
                    onClick={() => onLanguageChange(language)}
                  >
                    <span className={`px-4 lg:px-16 md:px-8 ${language === currentLanguage ? 'font-bold' : ''}`}>
                      {language.toUpperCase()}
                    </span>
                  </li>
                )
              })}
            </ul>
            <RichTextEditor name={`${path}${key}.${currentLanguage}`} placeholder={placeholder} />
          </div>
        )
      } else {
        return (
          <div className="p-2 w-1/2" key={`${path}${key}`}>
            <label className="block mb-2">{label[currentLanguage] || key}</label>
            <RichTextEditor name={`${path}${key}`} placeholder={placeholder} />
          </div>
        )
      }
    case 'radio':
      if (languages) {
        return (
          <div key={`${path}${key}`} className="p-2 w-1/2 flex flex-wrap items-center">
            <RadioInput
              name={`${path}${key}`}
              label={label[currentLanguage] || key}
              options={options.map((option) => ({
                title:
                  option.title[currentLanguage] ||
                  option.value[currentLanguage] ||
                  option.value[Object.keys(option.value)[0]] ||
                  option.value,
                value: option.value[currentLanguage] || option.value[Object.keys(option.value)[0]] || option.value,
              }))}
              className="p-2 w-1/2"
            />
            <div>
              {formLanguages.map((language) => (
                <button
                  type="button"
                  className={`rounded-lg mt-6 p-2 mx-2 ${
                    language === currentLanguage ? 'border-2 font-bold' : 'border'
                  } border-gray-400`}
                  key={language}
                  onClick={() => onLanguageChange(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        )
      } else {
        return (
          <RadioInput
            name={`${path}${key}`}
            key={`${path}${key}`}
            label={label[currentLanguage] || key}
            options={options.map((option) => ({
              title: option.title[currentLanguage] || option.value,
              value: option.value,
            }))}
            className="p-2 w-1/2"
          />
        )
      }
    case 'keyedInput':
      return (
        <div className="p-2 w-1/2" key={`${path}${key}`}>
          <KeyedInput
            label={label[currentLanguage] || key}
            languageBased={languages}
            languages={formLanguages}
            type={type}
            name={`${path}${key}`}
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>
      )
    case 'color':
      if (themeBased) {
        return (
          <div className="w-1/2 flex flex-wrap items-center" key={`${path}${key}.${currentTheme}`}>
            <ColorField
              label={label[currentLanguage] || key}
              name={`${path}${key}.${currentTheme}`}
              className="w-1/2 p-2"
            />

            {themes?.map((theme) => (
              <Button
                variant="secondary"
                type="button"
                className={` rounded-lg uppercase mt-6 p-2 mx-2 ${
                  theme === currentTheme ? 'border-2 font-bold' : 'border'
                } border-gray-400`}
                key={theme}
                onClick={() => onThemeChange(theme)}
              >
                {theme}
              </Button>
            ))}
          </div>
        )
      } else {
        return (
          <div className="p-2 w-1/2" key={`${path}${key}`}>
            <ColorField label={label[currentLanguage] || key} name={`${path}${key}`} />
          </div>
        )
      }

    case 'dateTime':
      return (
        <div className="p-2 w-1/2" key={`${path}${key}`}>
          <DateTime label={label[currentLanguage] || key} name={`${path}${key}`} />
        </div>
      )

    case 'multiSelect':
      return (
        <div className="p-2 w-1/2" key={`${path}${key}`}>
          <MultiSelect
            label={label[currentLanguage] || key}
            options={options.map((item) => ({ label: item.title[currentLanguage] || item.value, value: item.value }))}
            name={`${path}${key}`}
          />
        </div>
      )
    case 'image':
      return (
        <div className="p-2 w-1/2" key={`${path}${key}`}>
          <ImageInput
            label={label[currentLanguage] || key}
            multiSelect={multiSelect}
            name={`${path}${key}`}
            clientId={clientId}
          />
        </div>
      )
  }
}
