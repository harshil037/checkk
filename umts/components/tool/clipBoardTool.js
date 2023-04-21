const ClipBoardTool = ({
  clipBoard,
  setClipBoard,
  handleCopy,
  handleCut,
  handlePaste,
  inputType,
  objectKey,
  objectPath,
  remove,
  fieldProps,
}) => {
  return (
    <>
      <ul className="flex">
        {!clipBoard.method && (
          <>
            <li className="pl-4 cursor-pointer" onClick={() => handleCopy(objectKey, objectPath, inputType)}>
              <div className="px-2 py-1 inline-block">
                Copy
                <img className="inline-block px-2" src="/images/copy.svg" alt="Status" />
              </div>
            </li>
            <li
              className="pl-4 cursor-pointer"
              onClick={() => handleCut(objectKey, objectPath, inputType, remove, objectPath, fieldProps)}
            >
              <div className="px-2 py-1 inline-block">
                Cut
                <img className="inline-block px-2" src="/images/cut-categories.svg" alt="Status" />
              </div>
            </li>
          </>
        )}
        {clipBoard.method && clipBoard.path === objectPath && (
          <li
            className="pl-4 cursor-pointer"
            onClick={(e) => {
              setClipBoard({
                method: '',
                key: '',
                value: null,
                path: '',
                message: '',
                type: '',
                remove: '',
                index: '',
                fieldProps: '',
              })
            }}
          >
            <div className="px-2 py-1 inline-block">
              Cancel
              <img className="inline-block px-2" src="/images/cancel.svg" alt="Status" />
            </div>
          </li>
        )}
        {clipBoard.type === inputType && clipBoard.key === objectKey && clipBoard.path !== objectPath && (
          <li
            className="pl-4 cursor-pointer"
            onClick={(e) => {
              handlePaste(objectPath)
            }}
          >
            <div className="px-2 py-1 inline-block">
              Paste
              <img className="inline-block px-2" src="/images/paste.svg" alt="Status" />
            </div>
          </li>
        )}
        {clipBoard.path === objectPath && <p className="text-green-400 pt-1 mr-1">{clipBoard.message}</p>}
      </ul>
    </>
  )
}

export default ClipBoardTool
