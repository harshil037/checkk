import React, { useState, useEffect, useContext } from 'react'
import { Input } from '../components/componentLibrary'
import Button from '../components/common/Button'
import QRCode from 'qrcode.react'
import { AppContext } from '../context/appContext'

const Qrcode = () => {
  const [url, setUrl] = useState('')
  const [page, , setLoading] = useContext(AppContext)
  const [captcha, setCaptcha] = useState('')
  const [isHuman, setIsHuman] = useState(false)
  const [userCaptchaInput, setUserCaptchaInput] = useState('')
  const [falseCaptcha, setFalseCaptcha] = useState(false)
  const [size, setSize] = useState(256)
  const [buttonHover, setButtonHover] = useState(false)

  function makeCaptcha(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  const downloadQR = () => {
    const canvas = document.getElementById('qrcode')
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = 'qrcode.png'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  useEffect(() => {
    setLoading(false)
    setCaptcha(makeCaptcha(6))
  }, [page.isLoading])

  return (
    <div className="my-24 max-w-7xl mx-auto bg-white border border-gray-300 p-8 rounded-md">
      <h1 className="md:text-3xl text-xl text-center font-bold mb-4">Generate QR Code</h1>
      <div className="flex justify-center">
        <div className="w-2/3">
          <Input
            type="text"
            placeholder="Enter url"
            className="text-lg"
            variant="primary"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>
      {isHuman ? (
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center">
            <span className="text-lg mr-4">Size : </span>
            <input type="range" min={56} max={1028} value={size} onChange={(e) => setSize(parseInt(e.target.value))} />
            <span className="text-lg ml-5">{size}</span>
          </div>
          <div className="w-full flex justify-center m-4 p-2 items-center">
            <div>
              <QRCode
                value={url}
                size={size}
                className="border border-black mb-2"
                id="qrcode"
                level={'M'}
                includeMargin={true}
              />
              <button
                type="button"
                className="mx-auto mt-4 border flex items-center justify-center rounded border-black px-4 py-2 hover:border-blue-400 hover:img:block"
                onClick={downloadQR}
                onMouseOver={() => setButtonHover(true)}
                onMouseLeave={() => setButtonHover(false)}
              >
                <span className="text-lg">Download</span>{' '}
                <img
                  src="images/download-qr.svg"
                  className={`ml-4${buttonHover ? ' hidden' : ''}`}
                  width="25"
                  height="25"
                />
                <img
                  src="images/download-qr-hover.svg"
                  className={`ml-4${buttonHover ? '' : ' hidden'}`}
                  width="25"
                  height="25"
                />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex justify-center">
            <div className="bg-green-100 text-xl rounded-sm border select-none text-green-600 border-green-400 relative p-4 inline-block italic">
              <span className="text-xl relative mx-1 italic inline-block top-2">{captcha[0]}</span>
              <span className="text-xl relative mx-1 italic  inline-block -top-2">{captcha[1]}</span>
              <span className="text-xl relative mx-1 italic inline-block -top-1">{captcha[2]}</span>
              <span className="text-xl relative mx-1 italic  inline-block-top-0">{captcha[3]}</span>
              <span className="text-xl relative mx-1 italic inline-block -top-2">{captcha[4]}</span>
              <span className="text-xl relative mx-1 italic  inline-block top-2">{captcha[5]}</span>
              <span
                className="rounded-full text-lg absolute bottom-4 -right-6 text-black cursor-pointer select-none"
                onClick={() => setCaptcha(makeCaptcha(6))}
              >
                ↺
              </span>
            </div>
          </div>
          <div className="mt-6 max-w-md flex mx-auto">
            <Input
              variant={falseCaptcha ? 'danger' : 'primary'}
              placeholder="Enter captcha"
              onChange={(e) => {
                if (e.target.value.toString().length < 7) setUserCaptchaInput(e.target.value)
              }}
              value={userCaptchaInput}
            />
            <Button
              variant="primary"
              className="ml-2 px-4 w-1/2"
              type="button"
              onClick={() => {
                if (userCaptchaInput.length === 6) {
                  if (captcha === userCaptchaInput) {
                    setIsHuman(true)
                  } else {
                    setFalseCaptcha(true)
                    setCaptcha(makeCaptcha(6))
                    setUserCaptchaInput('')
                  }
                }
              }}
            >
              I am a human
            </Button>
          </div>
          {falseCaptcha && <p className="text-red-600 text-center mt-4">Entered captcha is wrong</p>}
        </div>
      )}
    </div>
  )
}

export default Qrcode
