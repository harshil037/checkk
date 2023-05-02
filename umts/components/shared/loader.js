const Loader = () => {
  return (
    <div id="modal-spinner" className="flex justify-center items-center z-[100] ">
      <div className="inline-block w-8 h-8 border-4 rounded-full spinner-border animate-spin" role="status">
        <span className="visually-hidden"></span>
      </div>
    </div>
  )
}
export default Loader
