import React, { useState, useEffect, useContext, useRef } from 'react'
import Authenticate from '../../../lib/authenticate'
import { useIsMounted } from '../../../lib/hooks'
import PopUp from '../../../components/dialog/popUp'
import { AppContext } from '../../../context/appContext'
import GridMaster from '../../../components/layout/gridMaster'
import { useRouter } from 'next/router'
import Transactions from '../../../components/voucher/transactions'
import OutsideAlerter from '../../../components/shared/outsideAlerter'
import NewVoucher from '../../../components/voucher/NewVoucher'
import translations from '../../../translations/voucher.json'
import { getApi } from '../../../lib/hooks'
import useConfirm from '../../../components/dialog/useConfirm'
// for Voucher preview
import { createPortal } from 'react-dom'
import { printDocument } from '../../../components/voucher/printDocument'
import One from '../../../components/voucher/layouts/one'
import Second from '../../../components/voucher/layouts/second'
import PdfImage from '../../../components/voucher/PdfImage'
import { toSvg, toBlob } from 'html-to-image'

const getClientId = (email) => {
  if (email === 'info@belvedere-hotel.it') {
    return 'u0737'
  } else if (email === 'monika@pragserwildsee.com') {
    return 'u0785'
  } else {
    return ''
  }
}

const Vouchers = (props) => {
  const [contextData, setContextData, setLoading] = useContext(AppContext)
  const [isSearching, setIsSearching] = useState(false)
  const [voucherData, setVoucherData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [isNewVoucher, setIsNewVoucher] = useState(false)
  const [show, setShow] = useState({})
  const [showTemplate, setShowTemplate] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState({})
  const [selectedVoucherItem, setSelectedVoucherItem] = useState({})
  const isMounted = useIsMounted()
  const router = useRouter()
  const [language, setLanguage] = useState('de')
  const [labels, setLabels] = useState({})
  const downlaodRef = useRef(null)
  const { isConfirmed } = useConfirm()
  const [refresh, setRefresh] = useState(false)
  const [productPageData, setProductPageData] = useState({})
  const [pdfLayout, setPdfLayout] = useState({})
  const [contentRef, setContentRef] = useState(null)
  const mountNode = contentRef?.contentWindow?.document?.body
  const [template, setTemplate] = useState('')
  const [imgCreated, setImgCreated] = useState('')
  const clientId = getClientId(props.user.email)
  const [_id, setId] = useState('')
  const [code, setCode] = useState('')
  const delayDebounceFn = useRef(null)
  const [gridInfo, setGridInfo] = useState({
    length: 0,
    currentPage: 1,
    perPage: 10,
    sort: { createdAt: true },
    searchText: '',
    searchToggle: false,
    pageList: { start: 0, end: 10 },
  })
  const [sort, setSort] = useState({ _id: -1 })

  const [clients, setClients] = useState([])
  const [domains, setDomains] = useState([])
  const [client, setClient] = useState({})
  const [domain, setDomain] = useState({})

  const initialize = async () => {
    if (clients.length == 0) {
      const clientRes = await getApi('/api/clients')
      if (clientRes.status === 200) {
        if (clientRes.clients) {
          setLoading(true)
          setClients(clientRes.clients)
          setLoading(false)
        }
      }
      const domainRes = await getApi('/api/domains')
      if (domainRes.status === 200) {
        if (domainRes.domains) {
          setLoading(true)
          setDomains(domainRes.domains)
          setLoading(false)
        }
      }
    }
    // Promise.all([]).then(() => {})
  }

  useEffect(() => {
    setContextData((prevState) => ({
      ...prevState,
      navigationItem: 'vouchers',
    }))

    if (window.localStorage.getItem('mts-language')) {
      setLanguage(window.localStorage.getItem('mts-language'))
    } else {
      window.localStorage.setItem('mts-language', language)
    }

    initialize()
  }, [])

  const getTranslation = (translations, language) => {
    const translationObj = {}
    for (const translation in translations) {
      translationObj[translation] = translations[translation][language] || translation
    }
    return translationObj
  }
  useEffect(() => {
    const translation = getTranslation(translations, language)
    setLabels(translation)
  }, [language])

  const getVouchers = async (clientId = '') => {
    setLoading(true)

    const sortQuery = JSON.stringify(sort)

    // clientNumber
    const voucherApiEndpoint =
      `/api/vouchers?req_offSet=${gridInfo.perPage * (gridInfo.currentPage - 1)}&req_limit=${
        gridInfo.perPage
      }&req_search=${gridInfo.searchText}&req_sort=${sortQuery}` + (clientId ? `&clientId=${clientId}` : '')

    const res = await fetch(voucherApiEndpoint, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await res.json()

    if (result?.vouchers?.data) {
      setVoucherData(result.vouchers.data)
      setGridInfo((state) => ({
        ...state,
        ['length']: result?.vouchers?.length?.total,
      }))
      setLoading(false)
    }
  }

  const addNewVocuher = () => {
    setIsNewVoucher(true)
  }

  useEffect(async () => {
    if (!isSearching && props.user) {
      await getVouchers(clientId)
    }
  }, [gridInfo.currentPage, gridInfo.perPage, gridInfo.sort, sort, refresh])

  useEffect(async () => {
    if (delayDebounceFn) {
      clearTimeout(delayDebounceFn.current)
    }
    delayDebounceFn.current = setTimeout(async () => {
      if (isSearching) {
        await getVouchers(clientId)
      }
      if (isMounted.current) {
        setIsSearching(false)
      }
    }, 1500)
    return () => clearTimeout(delayDebounceFn.current)
  }, [gridInfo.searchText])

  // for Voucher preview
  useEffect(async () => {
    if (
      selectedVoucher &&
      Object.keys(selectedVoucher).length > 0 &&
      selectedVoucherItem &&
      Object.keys(selectedVoucherItem).length > 0
    ) {
      setLoading(true)
      const domainInfo = domains.find((domain) => domain._id === selectedVoucher?.domainId)

      const productInfo = await getApi(
        `/api/clients/${selectedVoucher?.clientId}/${domainInfo?.url}/${selectedVoucher?.product}/2`,
      )

      setProductPageData(productInfo.data)
      setPdfLayout((prev) => ({
        ...prev,
        layout: selectedVoucherItem?.selectedDesign?.layout,
        imgurl:
          selectedVoucherItem?.selectedDesign?.headerImage ||
          selectedVoucherItem?.voucher?.templates?.images?.header?.[0],
        selectedServices: selectedVoucherItem?.selectedServices,
        amount: selectedVoucherItem?.totalAmount,
        currency: selectedVoucherItem?.selectedServices?.[0]?.price.currency || 'EUR',
        code: selectedVoucherItem?.code,
        logo: selectedVoucherItem?.voucher?.templates?.images?.logo,
        labels: selectedVoucherItem?.voucher?.templates?.labels,
        backend: selectedVoucher?.backend,
        selectedVoucherType: selectedVoucherItem?.type,
      }))
      setLoading(false)
    }
  }, [selectedVoucher, selectedVoucherItem])

  useEffect(() => {
    // Get an SVG data URL, but filter out all the <i> elements
    const filter = (node) => {
      return node.tagName !== 'i'
    }
    if (contentRef) {
      const el = contentRef?.contentWindow?.document.querySelector('div')
      // const code = el.getElementById('voucher-code')
      if (el) {
        // const thisfun = async () => {
        //   // await html2canvas(el, { scale: 1, useCORS: true }).then((canvas) => {
        //   //   const imgData = canvas.toDataURL('image/png')
        //   //   setImgCreated(imgData)
        //   // })
        //   toPng(el)
        //     .then(function (dataUrl) {
        //       setImgCreated(dataUrl)
        //       console.log({ dataUrl })
        //     })
        //     .catch(function (error) {
        //       console.error('oops, something went wrong!', error)
        //     })
        // }
        // thisfun()
        setTemplate(el?.innerHTML || '')

        // if DOM has an image, these JavaScript libraries won’t show it. To solve the problem, you need to execute domtoimage twice
        toBlob(el)
          .then(function (dataUrl) {
            // setImgCreated(dataUrl)
            if (dataUrl) {
              toSvg(el, { filter: filter })
                .then(function (dataUrl2) {
                  setImgCreated(dataUrl2)
                })
                .catch(function (error) {
                  console.error('oops, something went wrong!', error)
                })
            }
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error)
          })
      }
    }
  }, [contentRef?.contentWindow?.document?.body?.innerHTML, pdfLayout])

  const handleSort = (type) => () => {
    switch (type) {
      case 'createdAt':
        if (sort.createdAt === 1) {
          setSort({ _id: -1 })
        } else {
          setSort({ _id: 1 })
        }
        break
      case 'name':
        if (sort['voucherItems.recipientMessage.name'] === 1) {
          setSort({ 'voucherItems.recipientMessage.name': -1 })
        } else {
          setSort({ 'voucherItems.recipientMessage.name': 1 })
        }
        break
      case 'firstname':
        if (sort['voucherItems.buyer.firstname'] === 1) {
          setSort({ 'voucherItems.buyer.firstname': -1 })
        } else {
          setSort({ 'voucherItems.buyer.firstname': 1 })
        }
        break
      case 'lastname':
        if (sort['voucherItems.buyer.lastname'] === 1) {
          setSort({ 'voucherItems.buyer.lastname': -1 })
        } else {
          setSort({ 'voucherItems.buyer.lastname': 1 })
        }
        break
      case 'email':
        if (sort['voucherItems.buyer.email'] === 1) {
          setSort({ 'voucherItems.buyer.email': -1 })
        } else {
          setSort({ 'voucherItems.buyer.email': 1 })
        }
        break
      case 'transactionsTime':
        if (sort['transactions.createdAt'] === 1) {
          setSort({ 'transactions.createdAt': -1 })
        } else {
          setSort({ 'transactions.createdAt': 1 })
        }
        break
      default:
        setSort({ _id: -1 })
        break
    }
  }
  const handleCancel = async (clientId, domainId, code) => {
    let confirmed = await isConfirmed(`${labels?.cancelVoucherAlert?.replace('MTS__var', code)}`)
    if (confirmed) {
      const ress = await fetch(`/api/vouchers/datasource`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domains.find((domain) => domain._id === domainId)?.url,
          client: clientId,
        }),
      })
      if (ress.status === 200) {
        const dataSource = await ress.json()
        const res = await fetch(`/api/vmts/webhooks/asa/${clientId}/vouchers/${code}/transactions/id`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', authorization: dataSource?.voucher?.token },
        })
        setTimeout(() => {
          setRefresh((e) => !e)
        }, 200)
      }
    }
  }
  const styles =
    productPageData && Object(productPageData).length > 0
      ? {
          '--MTS-color-main': productPageData.content[0].styles['--MTS-color-secondary'],
        }
      : {}

  return (
    <div className="mt-32 sm:mt-24">
      {/* <div className="flex w-40 px-1 py-2 mb-2 ml-auto text-sm bg-white rounded-lg">
        <div className="mx-auto">
          <label className="mr-2" htmlFor="channel">
            {labels?.language} :
          </label>
          <select
            id="channel"
            className="p-1 bg-white border rounded-lg outline-none cursor-pointer border-primary-400"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value)
              window.localStorage.setItem('mts-language', e.target.value)
            }}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
            <option value="it">IT</option>
          </select>
        </div>
      </div> */}
      <GridMaster
        newButtonText={labels?.addNewVoucher}
        headerText={labels?.vouchers}
        onSort={() => {
          setGridInfo((prevState) => ({
            ...prevState,
            sort: {
              ...prevState.sort,
              createdAt: !prevState.sort.createdAt,
            },
          }))
        }}
        setGridInfo={setGridInfo}
        gridInfo={gridInfo}
        handleOpen={() => {
          // handleOpen('_new')
          addNewVocuher()
        }}
        passedData={voucherData}
        deleteSelected={() => {}}
        rowsPerPage={labels?.rowsPerPage}
        setIsSearching={setIsSearching}
        showLanguageButton={true}
        language={language}
        languageTitle={labels?.language}
        arrLanguages={['de', 'it', 'en']}
        languageHandler={(e) => {
          setLanguage(e.target.value)
          window.localStorage.setItem('mts-language', e.target.value)
        }}
      >
        {isNewVoucher && (
          <PopUp openModal={isNewVoucher}>
            <div className="h-full p-6 mx-auto my-auto mt-32 overflow-hidden bg-white border border-gray-300 rounded-lg md:mt-6 lg:w-2/5">
              <div className="flex items-center justify-between pb-2 border-b border-black border-solid">
                <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">
                  {labels?.newVoucher}
                </h1>
                <div className="flex items-center gap-2">
                  <svg
                    onClick={() => {
                      setIsNewVoucher(false)
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
              </div>
              <div className="text-left">
                <NewVoucher
                  setLoading={setLoading}
                  labels={labels}
                  client={clientId}
                  clients={clients}
                  domains={domains}
                ></NewVoucher>
              </div>
            </div>
          </PopUp>
        )}
        {voucherData.length > 0 ? (
          <div className="mt-5 table-responsive ">
            <table className="relative rounded-lg" width="100%">
              <thead>
                <tr className="text-left text-black bg-white">
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.name}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['voucherItems.recipientMessage.name'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="name"
                        onClick={handleSort('name')}
                      />
                    </div>
                  </td>
                  {/* <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.firstName}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['voucherItems.buyer.firstname'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="firstname"
                        onClick={handleSort('firstname')}
                      />
                    </div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.lastName}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['voucherItems.buyer.lastname'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="lastname"
                        onClick={handleSort('lastname')}
                      />
                    </div>
                  </td> */}
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">{labels?.buyerName}</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">{labels?.voucherCode}</div>
                  </td>
                  <td width="15%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.email}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['voucherItems.buyer.email'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="email"
                        onClick={handleSort('email')}
                      />
                    </div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">{labels?.initialValue}</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">{labels?.currentValue}</div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">{labels?.transactions}</div>
                  </td>
                  <td width="15%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.transactionsTime}
                      <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['transactions.createdAt'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="email"
                        onClick={handleSort('transactionsTime')}
                      />
                    </div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.paymentStatus}
                      {/* <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['transactions.type'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="email"
                        onClick={handleSort('paymentStatus')}
                      /> */}
                    </div>
                  </td>
                  <td width="10%" className="py-4 pl-4">
                    <div className="relative flex text-sm">
                      {labels?.voucherStatus}
                      {/* <img
                        className={`inline-block px-2 cursor-pointer ${
                          sort['transactions.type'] === 1 && 'transform rotate-180'
                        }`}
                        src="/images/sorting.svg"
                        alt="email"
                        onClick={handleSort('voucherStatus')}
                      /> */}
                    </div>
                  </td>
                  <td width="10%" className="p-4">
                    <div className="relative flex invisible text-sm">Edit</div>
                  </td>
                </tr>
              </thead>
              <caption className="absolute mx-4 border-b border-black border-dashed w-[calc(100%-30px)]" />
              <tbody className="text-[color:rgba(0, 0, 0, 0.65)]">
                {voucherData.map((voucher, voucherIndex) => {
                  return (
                    <React.Fragment key={voucherIndex}>
                      {voucher.voucherItems.map((voucherItem, voucherItemIndex) => {
                        // console.log({ voucherItem })
                        return (
                          <tr
                            key={voucherIndex + voucherItemIndex + 'voucher'}
                            className={`rounded-lg ${
                              voucherIndex % 2 === 0
                                ? 'bg-[color:#e2e2e210] border border-l-4 border-l-[color:#e2e2e2]'
                                : 'bg-[color:#97979720] border border-l-4 border-l-[color:#979797]'
                            }`}
                          >
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.recipientMessage?.name || '-'}</div>
                            </td>

                            {/* <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.buyer?.firstname || '-'}</div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.buyer?.lastname || '-'}</div>
                            </td> */}
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">
                                {voucherItem?.buyer?.firstname} {voucherItem?.buyer?.lastname}
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.code}</div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.buyer?.email || '-'}</div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.initialValue}</div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">{voucherItem?.currentValue}</div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm ">
                                <img
                                  onClick={() => {
                                    setId(voucher?._id)
                                    setClient(
                                      clients &&
                                        clients.length > 0 &&
                                        clients.find((client) => client.clientNumber === voucher?.clientId),
                                    )
                                    setDomain(
                                      domains &&
                                        domains.length > 0 &&
                                        domains.find((domain) => domain._id === voucher?.domainId),
                                    )
                                    setCode(voucherItem?.code)
                                    setOpenModal(true)
                                  }}
                                  className="inline-block px-2 cursor-pointer"
                                  src="/images/Edit.svg"
                                />
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">
                                {voucherItem?.transactions && Object.keys(voucherItem?.transactions[0]).length > 0
                                  ? new Date(voucherItem?.transactions[0].createdAt).toLocaleDateString()
                                  : '-'}
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div className="relative flex text-sm">
                                {voucher?.paymentStatus && voucher?.paymentStatus === 'success'
                                  ? labels['success']
                                  : voucher?.paymentStatus === 'failed'
                                  ? labels['failed']
                                  : voucher?.paymentStatus === 'pending'
                                  ? labels['pending']
                                  : voucher?.paymentStatus}
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-left">
                              <div
                                className={`relative flex text-sm ${
                                  voucherItem?.status && voucherItem?.status === 'REDEEMED'
                                    ? 'text-green-700 uppercase'
                                    : voucherItem?.status === 'cancelled'
                                    ? 'text-red-700'
                                    : ''
                                }`}
                              >
                                {voucherItem?.status && voucherItem?.status === 'REDEEMED'
                                  ? labels['redeemed']
                                  : voucherItem?.status === 'registered'
                                  ? labels['registered']
                                  : voucherItem?.status === 'redeemable'
                                  ? labels['redeemable']
                                  : voucherItem?.status === 'cancelled'
                                  ? labels['cancelled']
                                  : voucherItem?.status}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-left">
                              <OutsideAlerter
                                closeMe={(event) => {
                                  if (event.target.parentElement.id != 'parent') {
                                    setShow(() => {
                                      return { [voucherItem?.code]: false }
                                    })
                                    // setSelectedVoucher({})
                                    // setSelectedVoucherItem({})
                                    // setPdfLayout({})
                                    // setTemplate('')
                                    // setImgCreated('')
                                  }
                                }}
                              >
                                <div className={`relative text-sm hidden lg:flex`}>
                                  <img
                                    onClick={() => {
                                      setShow((prev) => ({
                                        ...prev,
                                        [voucherItem?.code]: !prev[voucherItem?.code],
                                      }))
                                      setSelectedVoucher(voucher)
                                      setSelectedVoucherItem(voucherItem)
                                    }}
                                    className="inline-block px-2 cursor-pointer"
                                    src="/images/Group.svg"
                                  />
                                  {pdfLayout &&
                                    Object.keys(pdfLayout).length > 0 &&
                                    imgCreated.length > 0 &&
                                    productPageData && (
                                      <div
                                        id="parent"
                                        className={`py-3 px-4 absolute bg-white z-10 voucher-popup  ${
                                          !show[voucherItem?.code] && `hidden`
                                        }`}
                                      >
                                        <p
                                          className="my-1 text-sm cursor-pointer"
                                          onClick={() => {
                                            setShowTemplate(true)
                                          }}
                                        >
                                          {labels?.viewVoucher}
                                        </p>
                                        <p
                                          className="my-1 text-sm cursor-pointer"
                                          onClick={() => {
                                            setLoading(true)
                                            const newTemplate = template.replace(
                                              voucherItem?.voucher?.templates?.labels?.defaultCode ||
                                                'XXXXXXXXXXXXXXXX',
                                              voucherItem?.code,
                                            )
                                            if (selectedVoucherItem?.selectedDesign?.layout === 'one') {
                                              printDocument({
                                                html: newTemplate,
                                                filename: `voucher-${voucherItem?.code}.pdf`,
                                                landscape: false,
                                                width: 794,
                                                height: 1123,
                                                setLoading: setLoading,
                                              })
                                            } else {
                                              printDocument({
                                                html: newTemplate,
                                                filename: `voucher-${voucherItem?.code}.pdf`,
                                                landscape: true,
                                                width: 1123,
                                                height: 794,
                                                setLoading: setLoading,
                                              })
                                            }
                                            setShow(() => {
                                              return { [voucherItem?.code]: false }
                                            })
                                            // setLoading(false)
                                          }}
                                        >
                                          {labels?.downloadVoucher}
                                        </p>
                                        <p
                                          className="my-1 text-sm cursor-pointer"
                                          onClick={() =>
                                            handleCancel(voucher?.clientId, voucher?.domainId, voucherItem?.code)
                                          }
                                        >
                                          {' '}
                                          {labels?.cancelVoucher}
                                        </p>
                                        <div className="absolute mx-auto cursor-pointer caret top-2"></div>
                                      </div>
                                    )}
                                </div>
                              </OutsideAlerter>
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 mb-5 text-center table-responsive">
            {!contextData.isLoading && labels?.noRecordsFound}
          </div>
        )}
      </GridMaster>
      <iframe className="absolute invisible" ref={setContentRef} style={styles}>
        {mountNode &&
          pdfLayout &&
          productPageData &&
          Object.keys(pdfLayout).length > 0 &&
          Object.keys(productPageData).length > 0 &&
          createPortal(
            pdfLayout.layout === 'one' ? (
              <One
                {...{
                  pdfLayout,
                  hotelId: productPageData.content[0].blockProps?.hotelId,
                  width: 'auto',
                  loader: productPageData.content[0].blockProps?.loader,
                  recipient: selectedVoucherItem?.recipientMessage,
                  styles: productPageData.content[0].styles,
                  fontFiles: productPageData.content[0].blockProps?.fontFiles,
                  type: selectedVoucherItem?.voucher?.serviceGroups?.length ? 'servicesVoucher' : 'valueVoucher',
                  language,
                  restrictServicePrice: productPageData.content[0].blockProps?.restrictServicePrice,
                }}
              />
            ) : pdfLayout.layout === 'second' ? (
              <Second
                {...{
                  pdfLayout,
                  hotelId: productPageData.content[0].blockProps?.hotelId,
                  width: 'auto',
                  loader: productPageData.content[0].blockProps?.loader,
                  recipient: selectedVoucherItem?.recipientMessage,
                  styles: productPageData.content[0].styles,
                  fontFiles: productPageData.content[0].blockProps?.fontFiles,
                  type: selectedVoucherItem?.voucher?.serviceGroups?.length ? 'servicesVoucher' : 'valueVoucher',
                  language,
                  restrictServicePrice: productPageData.content[0].blockProps?.restrictServicePrice,
                }}
              />
            ) : (
              ''
            ),
            mountNode,
          )}
      </iframe>

      {showTemplate && (
        <PopUp openModal={showTemplate}>
          <div
            className={`max-h-[90vh] p-6 mx-auto my-auto overflow-y-auto overflow-x-hidden bg-white border border-gray-300 rounded-lg mt-6 w-[90vw] ${
              selectedVoucherItem?.selectedDesign?.layout === 'one' ? 'xl:w-[50vw]' : 'xl:w-[70vw] 2xl:w-[60vw]'
            }`}
          >
            <div className="flex items-center justify-between h-full pb-2 border-b border-black border-solid">
              <h1 className="text-xl sm:text-[22px] text-heading font-bold w-10/12 text-left">{labels?.voucher}</h1>
              <div className="flex items-center gap-2">
                <svg
                  onClick={() => {
                    setShowTemplate(false)
                    setShow(() => {
                      return { [selectedVoucherItem?.code]: false }
                    })
                    setSelectedVoucher({})
                    setSelectedVoucherItem({})
                    setPdfLayout({})
                    setTemplate('')
                    setImgCreated('')
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
            </div>
            {imgCreated.length > 0 && template.length > 0 ? (
              <div className="p-4">
                <PdfImage {...{ imgDataUrl: imgCreated }} />
                {/* <div dangerouslySetInnerHTML={{ __html: template }}></div> */}
              </div>
            ) : (
              <div className="mt-4 text-center">{labels?.voucherNotAvailble}</div>
            )}
          </div>
        </PopUp>
      )}

      {openModal && (
        <PopUp openModal={openModal}>
          <Transactions
            _id={_id}
            code={code}
            handleClose={() => {
              getVouchers(clientId)
              setId('')
              setCode('')
              setClient({})
              setDomain({})
              setOpenModal(false)
            }}
            labels={labels}
            language={language}
            client={client}
            domain={domain}
          />
        </PopUp>
      )}
    </div>
  )
}

export default Vouchers

export async function getServerSideProps(context) {
  return Authenticate(context)
}
