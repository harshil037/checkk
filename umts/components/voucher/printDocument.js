export const printDocument = async ({
  html,
  path,
  filename,
  width,
  height,
  landscape,
  format,
  pageRanges,
  printBackground,
  setLoading,
}) => {
  // const URL = `/api/vouchers/printDocument`
  const URL = `https://worker.mts-online.com/api/vouchers/printDocument`
  const res = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify({
      html,
      path,
      filename,
      width,
      height,
      landscape,
      format,
      pageRanges,
      printBackground,
      setLoading,
    }),
  })
  const data = await res.json()

  const url = window.URL.createObjectURL(new Blob([new Uint8Array(data?.pdf?.data).buffer]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  setLoading(false)
}
