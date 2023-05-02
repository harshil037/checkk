import React, { useEffect, useState } from 'react'

function Pagination({ paginationInfo, setPaginationInfo, rowsPerPage }) {
  const [pageNumbers, setPageNumbers] = useState([])

  const pageList = []
  for (let i = 1; i <= Math.ceil(paginationInfo.length / 10); i++) {
    pageList.push(i * 10)
    if (pageList.length == 5) {
      break
    }
  }

  useEffect(() => {
    const end = Math.ceil(paginationInfo.currentPage / 5) * 5
    const start = end - 5
    setPaginationInfo((prevState) => ({
      ...prevState,
      pageList: {
        ...prevState.pageList,
        start: start,
        end: end,
      },
    }))
  }, [paginationInfo.currentPage, paginationInfo.perPage])

  useEffect(() => {
    let tempPageNumbers = []
    for (let i = 1; i <= Math.ceil(paginationInfo.length / paginationInfo.perPage); i++) {
      tempPageNumbers.push(i)
    }
    setPageNumbers(tempPageNumbers)
  }, [paginationInfo.perPage, paginationInfo.length])

  const setPaginationState = (key, value) => {
    setPaginationInfo((state) => ({
      ...state,
      [key]: value,
    }))
  }

  return (
    <div className="flex flex-wrap justify-between gap-4 my-4">
      <div className="flex items-center px-4">
        <span className="mr-4 td-text">{rowsPerPage}:</span>
        <select
          value={paginationInfo.perPage}
          onChange={(e) => {
            setPaginationInfo((prevState) => ({
              ...prevState,
              perPage: parseInt(e.target.value),
              currentPage: 1,
            }))
          }}
          name="rows"
          id="#row"
          className="px-1 py-2 bg-white rounded-lg sm:px-2 td-text"
        >
          {pageList.map((perPage) => (
            <option key={perPage} value={perPage}>
              {perPage}
            </option>
          ))}
          {pageList.length > 1 ? (
            paginationInfo.length < 500 ? (
              <option key={paginationInfo.length} value={paginationInfo.length}>
                All
              </option>
            ) : (
              <option key={500} value={500}>
                500
              </option>
            )
          ) : null}
        </select>
      </div>
      <div className="px-4">
        <nav className="flex flex-row content-center flex-nowrap" aria-label="Pagination">
          {paginationInfo.perPage * 5 < paginationInfo.length && (
            <div
              onClick={() => {
                setPaginationInfo((prevState) => ({
                  ...prevState,
                  currentPage: 1,
                }))
              }}
              className="items-center justify-center hidden w-10 h-10 mx-2 ml-1 text-black bg-white rounded-lg cursor-pointer md:flex hover:border-gray-300"
            >
              <img className="block w-4 h-4 fill-current" src="/images/prev_double.svg" />
            </div>
          )}

          <div
            onClick={() => {
              if (paginationInfo.currentPage > 1) {
                setPaginationInfo((prevState) => ({
                  ...prevState,
                  currentPage: prevState.currentPage - 1,
                }))
              }
            }}
            className="flex items-center justify-center w-10 h-10 mr-1 text-black bg-white rounded-lg cursor-pointer hover:border-gray-300"
          >
            <span className="sr-only">Previous Page</span>
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path>
            </svg>
          </div>

          {Math.ceil(paginationInfo.length / 5) > Math.ceil(paginationInfo.length / paginationInfo.currentPage) && (
            <>
              <div
                onClick={() => {
                  setPaginationInfo((prevState) => ({
                    ...prevState,
                    currentPage: 1,
                  }))
                }}
                className="items-center justify-center hidden w-10 h-10 mx-1 text-black bg-white border border-gray-200 rounded-lg cursor-pointer md:flex bg-white-300 hover:border-gray-300"
              >
                1
              </div>

              <div className="items-center justify-center hidden w-10 h-10 mx-1 text-black cursor-pointer md:flex hover:border-gray-300">
                <div className="inline-block w-1 h-1 rounded-full bg-primary-400"></div>
                <div className="inline-block w-1 h-1 mx-2 rounded-full bg-primary-400"></div>
                <div className="inline-block w-1 h-1 rounded-full bg-primary-400"></div>
              </div>
            </>
          )}

          <div className="hidden md:flex">
            {pageNumbers.slice(paginationInfo.pageList.start, paginationInfo.pageList.end).map((number) => (
              <div
                key={'page-' + number}
                onClick={() => {
                  setPaginationState('currentPage', number)
                }}
                className={`flex w-10 h-10 mx-1 cursor-pointer justify-center items-center rounded-lg border ${
                  number === paginationInfo.currentPage ? 'bg-primary-400 text-white' : 'bg-white'
                } border-gray-200 text-black hover:border-gray-300`}
              >
                {number}
              </div>
            ))}
          </div>
          <div
            className={`flex md:hidden w-10 h-10 mx-1 cursor-pointer justify-center items-center rounded-lg border bg-primary-400 border-gray-200 text-black hover:border-gray-300`}
          >
            {paginationInfo.currentPage}
          </div>

          {Math.ceil(paginationInfo.length / paginationInfo.perPage) > paginationInfo.pageList.end && (
            <>
              <div className="items-center justify-center hidden w-10 h-10 mx-1 text-black cursor-pointer md:flex hover:border-gray-300">
                <div className="inline-block w-1 h-1 rounded-full bg-primary-400"></div>
                <div className="inline-block w-1 h-1 mx-2 rounded-full bg-primary-400"></div>
                <div className="inline-block w-1 h-1 rounded-full bg-primary-400"></div>
              </div>
              <div
                onClick={() => {
                  const lastPage = Math.ceil(paginationInfo.length / paginationInfo.perPage)
                  setPaginationInfo((prevState) => ({
                    ...prevState,
                    currentPage: lastPage,
                  }))
                }}
                className="items-center justify-center hidden w-10 h-10 mx-1 text-black bg-white border border-gray-200 rounded-lg cursor-pointer md:flex hover:border-gray-300"
              >
                {Math.ceil(paginationInfo.length / paginationInfo.perPage)}
              </div>
            </>
          )}

          <div
            onClick={() => {
              if (paginationInfo.currentPage < pageNumbers.length) {
                setPaginationInfo((prevState) => ({
                  ...prevState,
                  currentPage: prevState.currentPage + 1,
                }))
              }
            }}
            className="flex items-center justify-center w-10 h-10 ml-1 text-black bg-white rounded-lg cursor-pointer hover:border-gray-300"
          >
            <span className="sr-only">Next Page</span>
            <svg className="block w-4 h-4 fill-current" viewBox="0 0 256 512" aria-hidden="true" role="presentation">
              <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path>
            </svg>
          </div>

          {paginationInfo.perPage * 5 < paginationInfo.length && (
            <div
              onClick={() => {
                if (pageNumbers.length > paginationInfo.pageList.end) {
                  setPaginationInfo((prevState) => ({
                    ...prevState,
                    currentPage: paginationInfo.pageList.end + 1,
                  }))
                }
              }}
              className="items-center justify-center hidden w-10 h-10 mx-2 ml-1 text-black bg-white rounded-lg cursor-pointer md:flex hover:border-gray-300"
            >
              <img className="block w-4 h-4 fill-current" src="/images/next_double.svg" />
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

export default Pagination
