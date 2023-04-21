import { Input } from '../../components/componentLibrary'
import Button from '../common/Button'
import Pagination from '../shared/pagination'

const GridMaster = ({
  onSort,
  gridInfo,
  setGridInfo,
  handleOpen,
  newButtonText,
  headerText,
  setIsSearching,
  passedData,
  deleteSelected,
  children,
  showNewButton = true,
  showLanguageButton = false,
  language = 'en',
  arrLanguages = ['de', 'en', 'it'],
  languageTitle = 'Language',
  languageHandler = () => {},
  showSearch = true,
  rowsPerPage = 'Rows per page',
  selectedTitle = '',
}) => {
  return (
    <>
      {showNewButton ? (
        <>
          <div className="fixed z-10 w-full text-right sorting lg:pr-8 pr-4 right-0 md:w-[calc(100%-150px)] md:left-[unset] left-0 pl-4 md:pl-0">
            <div className="inline-block object-right w-full mt-4 ml-auto bg-white border rounded-lg sm:w-auto lg:mt-0">
              <ul className="flex justify-between p-2">
                <li className="px-2 border-r sm:px-4">
                  <div onClick={onSort} className="flex px-2 py-1 cursor-pointer">
                    Sort
                    <img
                      className={`inline-block px-2 ${gridInfo.sort.name && 'transform rotate-180'}`}
                      src="/images/sorting.svg"
                      alt="Products"
                    />
                  </div>
                </li>
                <li className="px-2 border-r sm:px-4">
                  <Button onClick={handleOpen} variant="primary">
                    {newButtonText}
                    <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
                  </Button>
                </li>
                <li className="px-2 sm:px-4">
                  {showLanguageButton && (
                    <div className="flex flex-wrap gap-2 text-sm text-left place-items-center">
                      <label htmlFor="language">{languageTitle ? languageTitle : 'Language'}:</label>
                      <select
                        id="language"
                        className="p-1 bg-white border rounded-lg outline-none cursor-pointer border-primary-400"
                        value={language}
                        // onChange={(e) => {
                        //   setLanguage(e.target.value)
                        //   window.localStorage.setItem('mts-language', e.target.value)
                        // }}
                        onChange={(e) => languageHandler(e)}
                      >
                        {/* <option value="de">DE</option>
                          <option value="en">EN</option>
                          <option value="it">IT</option> */}
                        {arrLanguages &&
                          arrLanguages.length > 0 &&
                          arrLanguages.map((language) => (
                            <option value={language} key={language}>
                              {language?.toLocaleUpperCase() || language}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : null}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div
          className={`flex ${
            gridInfo.searchToggle && 'flex-wrap sm:flex-nowrap'
          } py-2 mx-4 border-b border-black border-solid lg:justify-between`}
        >
          <div className="flex flex-wrap gap-2 items-center w-full text-[#000000A6] leading-7 xl:w-3/5">
            <h3 className="text-[22px] font-bold text-left">{headerText}</h3>
            {passedData.filter((x) => x.isSelected).length > 0 && (
              <div className="flex items-center w-full gap-2 sm:w-auto">
                <h3 className="align-middle">
                  {'( ' +
                    passedData.filter((x) => x.isSelected).length +
                    ` ${selectedTitle}` +
                    (passedData.filter((x) => x.isSelected).length > 1 ? 's' : '') +
                    ' Selected) '}
                </h3>
                <img
                  title="Delete selected"
                  onClick={async () => {
                    await deleteSelected()
                  }}
                  className="inline-block"
                  src="/images/langaugedelete.svg"
                  alt="Langauge Delete"
                />
              </div>
            )}
          </div>

          {showSearch && (
            <ul className="flex justify-end w-full xl:w-auto">
              <li className="flex px-2 py-1 rounded-xl">
                <div className="relative flex items-center max-w-xs search">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className={`mb-0 w-full relative ${gridInfo.searchToggle && 'input-open'}`}
                  >
                    <Input
                      onChange={(e) => {
                        setIsSearching(true)
                        setGridInfo((state) => ({
                          ...state,
                          ['currentPage']: 1,
                          ['searchText']: e.target.value,
                        }))
                      }}
                      type="text"
                      value={gridInfo.searchText}
                      className="pt-4 pb-4 pl-4 rounded-lg search-input"
                      placeholder="Search"
                      id="search"
                    />
                    {gridInfo.searchText && (
                      <div
                        onClick={() => {
                          setIsSearching(true)
                          setGridInfo((state) => ({
                            ...state,
                            ['currentPage']: 1,
                            ['searchText']: '',
                          }))
                        }}
                        className="cursor-pointer clear-icon"
                      >
                        <img src="/images/clear.png" width="20" height="20" />
                      </div>
                    )}
                  </form>
                  <button
                    onClick={() => {
                      if (gridInfo.searchText == '') {
                        setGridInfo((state) => ({
                          ...state,
                          ['searchToggle']: !state.searchToggle,
                        }))
                      }
                    }}
                    className="absolute top-0 right-0 h-full search-bttn"
                    title="search"
                  >
                    <img src="/images/userssearch.svg" alt="search" />
                  </button>
                </div>
              </li>
            </ul>
          )}
        </div>
        <div className="2xl:whitespace-normal whitespace-nowrap">{children}</div>
      </div>
      {passedData?.length > 0 && (
        <Pagination paginationInfo={gridInfo} setPaginationInfo={setGridInfo} rowsPerPage={rowsPerPage} />
      )}
    </>
  )
}

export default GridMaster
