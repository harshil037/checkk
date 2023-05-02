import React from 'react'
const AppContext = React.createContext({})
const AppProvider = AppContext.Provider
const DefaultAppContext = {
  domain: { perPage: 10, currentPage: 1, pageList: { start: 0, end: 5 }, sort: { url: true } },
  confirm: {
    prompt: '',
    isOpen: false,
    proceed: null,
    cancel: null,
  },
  search: {
    clientId: '',
    filterdDomains: '',
    lastSearched: null,
    default: { clientId: '', url: '', productName: '' },
    reload: 0,
    domainUpdate: 0,
    clientUpdate: 0,
  },
  navigationItem: '',
  canOpenProduct: true,
  isLoading: false,
  apiCount: 0,
  currentPage: '',
  saveDirty: true,
  workerPath: 'https://worker.mts-online.com',
  //workerPath: 'http://10.10.10.119:3001',
}
export { AppContext, AppProvider, DefaultAppContext }
