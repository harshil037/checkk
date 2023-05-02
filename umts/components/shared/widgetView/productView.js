import * as Components from '@mts-online/library'
import ErrorBoundary from '../../shared/errorBoundary'
import { useMemo, memo } from 'react'
import '@mts-online/library/dist/esm/index.css'

const ProductView = ({
  productName,
  language,
  domainId,
  version,
  data,
  module,
  attributes,
  isIpadView,
  isMobileView,
  clientId,
  domainUrl,
  domainName,
}) => {
  const Widget = Components[module + (parseInt(version) > 1 ? version : '')]

  const extraAttributes = useMemo(() => {
    const tempAttributes = { ...attributes }
    Object.keys(tempAttributes).forEach((key) => {
      if (tempAttributes[key] === '') {
        delete tempAttributes[key]
      }
    })
    return tempAttributes
  }, [attributes])

  return (
    <div>
      <ErrorBoundary>
        <div
          id="__MTS"
          data-mts-view={productName}
          data-mts-language={language}
          data-mts-user={clientId}
          data-mts-id="0"
          data-mts-version={version}
          {...extraAttributes}
        >
          <Components.ThemeProvider styles={data?.styles}>
            {isIpadView && (
              <Widget
                pageData={{
                  clientId: clientId,
                  domainId: domainId,
                  view: productName,
                  version: version,
                  domainName: domainName,
                  domainUrl: domainUrl,
                  language: language,
                  module: module,
                  user: clientId,
                }}
                blockProps={data}
              />
            )}
            {isMobileView && (
              <Widget
                pageData={{
                  clientId: clientId,
                  domainId: domainId,
                  view: productName,
                  version: version,
                  domainName: domainName,
                  domainUrl: domainUrl,
                  language: language,
                  module: module,
                  user: clientId,
                }}
                blockProps={data}
              />
            )}
            {!isIpadView && !isMobileView && (
              <Widget
                pageData={{
                  clientId: clientId,
                  domainId: domainId,
                  view: productName,
                  version: version,
                  domainName: domainName,
                  domainUrl: domainUrl,
                  language: language,
                  module: module,
                  user: clientId,
                }}
                blockProps={data}
              />
            )}
          </Components.ThemeProvider>
        </div>
      </ErrorBoundary>
    </div>
  )
}

export default memo(ProductView)
