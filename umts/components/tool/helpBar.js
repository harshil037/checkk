const HelpBar = ({ value, isToggle = false }) => {
  return value ? (
    <div className={`tooltip helpBar-tooltip flex items-center ${isToggle ? `` : `ml-2`}`}>
      <img src="/images/help_icon.svg" />
      <span
        className={`tooltiptext  left-[-6px] w-[180px] ml-0 py-1 px-3 transform top-full  ${
          isToggle ? `translate-y-[0]` : `translate-y-[10px]`
        }`}
      >
        {value}
      </span>
    </div>
  ) : null
}
export default HelpBar
