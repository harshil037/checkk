import React, { useState, useEffect } from 'react'
import { Input, Select } from '../../components/componentLibrary'
import { getApi } from '../../lib/hooks'
import Button from '../../components/common/Button'
import { useRouter } from 'next/router'

const NewVoucher = ({ setLoading, labels, clients, client = '', domains }) => {
  const [clientNo, setClientNo] = useState('')
  const [clinetDomains, setClientDomains] = useState([])
  const [clientInfo, setClientInfo] = useState({})
  const [selectedDomain, setSelectedDomain] = useState({})
  const [selectedProduct, setSelectedProduct] = useState({})
  const [vmtsClients, setVmtsClients] = useState([])
  const router = useRouter()

  const getClientInfo = async (clientNo, clientList) => {
    try {
      setLoading(true)
      if (clientNo.length > 0) {
        setClientNo(clientNo)
        const client = clientList.find((x) => x.clientNumber == clientNo)
        const res = await fetch(`/api/clients?id=${client._id}`, {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        })
        const result = await res.json()
        setClientInfo(result.data ? result.data : {})
        if (result.data) {
          const selectedDomains = domains.filter((domain) => result.data.domains.includes(domain._id))
          setClientDomains(selectedDomains)
          if (selectedDomains && selectedDomains.length === 1) {
            setSelectedDomain(selectedDomains[0])
            const vmtsProducts = selectedDomains[0]?.products?.filter(
              (product) => product?.module === 'WidgetVmts' && product?.version === '2',
            )
            if (vmtsProducts && vmtsProducts.length === 1) setSelectedProduct(vmtsProducts[0])
          }
        }
      } else {
        setClientNo('')
        setClientInfo({})
        setClientDomains([])
      }
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const fetchVMTSClients = async () => {
    setLoading(true)

    const widget = 'WidgetVmts'
    const version = '2'
    const res = await fetch(`/api/vouchers/getVMTSClients?name=${widget}&version=${version}`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })
    const VMTSClients = await res.json()
    const newClients = clients.filter((client) => VMTSClients.clients.includes(client?.clientNumber))

    if (client) {
      setVmtsClients(newClients.filter((item) => item.clientNumber === client))
    } else {
      setVmtsClients(newClients)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchVMTSClients()
  }, [])

  useEffect(() => {
    if (client && vmtsClients && vmtsClients.length) getClientInfo(client, vmtsClients)
  }, [client, vmtsClients])

  return (
    <div>
      <div className="flex flex-wrap w-full mt-4">
        <div className="text-lg font-[500] text-heading">{labels?.selectClient}</div>
        <Select
          name={`client`}
          // value={clientNo}
          variant="primary"
          onChange={async (e) => {
            setSelectedDomain({})
            setSelectedProduct({})
            await getClientInfo(e.target.value, vmtsClients)
          }}
          id="type"
        >
          {vmtsClients?.length > 0 && (
            <>
              <option value="">{labels?.selectClient}</option>
              {vmtsClients?.map((item) => (
                <option className="bg-gray-50" key={item.clientNumber} value={item.clientNumber}>
                  {`${item.clientNumber} - ${item.name}`}
                </option>
              ))}
            </>
          )}
        </Select>
      </div>

      {clientNo.length > 0 && clinetDomains && clinetDomains.length > 0 && (
        <>
          {clinetDomains && clinetDomains.length > 0 ? (
            <div className="flex flex-wrap w-full mt-4">
              <div className="text-lg font-[500] text-heading">{labels?.selectDomain}</div>
              <Select
                name={`domain`}
                // value={selectedDomain?._id || ''}
                variant="primary"
                onChange={async (e) => {
                  const domain = clinetDomains?.find((domain) => domain._id === e.target.value)
                  setSelectedProduct({})
                  setSelectedDomain(domain || {})
                  const vmtsProducts = domain?.products?.filter(
                    (product) => product?.module === 'WidgetVmts' && product?.version === '2',
                  )
                  if (vmtsProducts && vmtsProducts.length === 1) setSelectedProduct(vmtsProducts[0])
                }}
                id="type"
              >
                <>
                  <option value="">{labels?.selectDomain}</option>
                  {clinetDomains?.map((domain, index) => (
                    <option className="bg-gray-50" key={index} value={domain._id} selected={
                      clinetDomains.length === 1
                        ? true
                        : false
                    }>
                      {domain?.url}
                    </option>
                  ))}
                </>
              </Select>
            </div>
          ) : (
            <div className="flex flex-wrap w-full mt-4">{labels?.noDomainFound}</div>
          )}
        </>
      )}

      {selectedDomain && Object.keys(selectedDomain).length > 0 && (
        <>
          {selectedDomain?.products?.filter((product) => product?.module === 'WidgetVmts' && product?.version === '2')
            .length > 0 ? (
            <div className="flex flex-wrap w-full mt-4">
              <div className="text-lg font-[500] text-heading">{labels?.selectProduct}</div>
              <Select
                name={`product`}
                // value={selectedProduct?._id || ''}
                variant="primary"
                onChange={async (e) => {
                  const product = selectedDomain?.products?.find((product) => product._id === e.target.value)
                  setSelectedProduct(product || {})
                }}
                id="type"
              >
                <>
                  <option value="">{labels?.selectProduct}</option>
                  {selectedDomain?.products
                    ?.filter((product) => product?.module === 'WidgetVmts' && product?.version === '2')
                    ?.map((product, index) => (
                      <option
                        className="bg-gray-50"
                        key={index}
                        value={product._id}
                        selected={
                          selectedDomain?.products?.filter(
                            (product) => product?.module === 'WidgetVmts' && product?.version === '2',
                          ).length === 1
                            ? true
                            : false
                        }
                      >
                        {product?.name}
                      </option>
                    ))}
                </>
              </Select>
            </div>
          ) : (
            <div className="flex flex-wrap w-full mt-4">{labels?.noProductFound}</div>
          )}
        </>
      )}

      {selectedProduct && Object.keys(selectedProduct).length > 0 && (
        <Button
          onClick={() => {
            router.push(`/admin/vouchers/${clientNo}/${selectedDomain?._id}/${selectedProduct?.name}`)
          }}
          variant="primary"
          className="flex mt-4 ml-auto"
        >
          {labels?.create}
          <img className="inline-block px-2" src="/images/plus-bar.svg" alt="Products" />
        </Button>
      )}
      {/* <div className="mt-4">
        <div className="text-lg font-[500] text-heading">Select product</div>
        <div
          className="grid justify-center grid-cols-3 gap-4 mx-auto my-1 text-center lg:w-full"
          // style={{ width: '70vw' }}
        >
          {selectedDomain?.products
            // ?.filter((product) => product?.module === 'WidgetVmts')
            ?.map((product, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedProduct(product)
                }}
                className={`relative px-8 py-4 my-0 border rounded-md shadow-md cursor-pointer hover:border-primary-400 ${
                  product?._id == selectedProduct?._id ? 'border-primary-400' : 'border-heading'
                }`}
              >
                <span className={`absolute`}></span>
                <span className="text-base lg:text-lg">{product?.name}</span>
              </div>
            ))}
        </div>
      </div> */}

      {/* {clientNo.length > 0 && (
        <div className="flex flex-col my-4">
          <div className="mb-2 text-lg font-[500] text-heading">Select product:</div>
          {clinetDomains?.map((domain, index) => (
            <div key={index}>
              <div className="text-lg underline text-primary-400">{domain?.url}</div>
              <div>
                {domain?.products?.length > 0 ? (
                  domain?.products
                    ?.filter((product) => product?.module === 'WidgetVmts')
                    ?.map((product, index) => (
                      <div key={index}>
                        <div className="text-base">{product?.name}</div>
                        <div></div>
                      </div>
                    ))
                ) : (
                  <div>Sorry, we couldn't find any voucher product for this domain.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )} */}
    </div>
  )
}

export default NewVoucher
