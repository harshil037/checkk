import React from 'react'

const AvailabilityCalendar = ({ month, year, availabilityInfo, ratesInfo, currency = 'EUR' }) => {
  /**
   * to gate days in particular
   * @param {number} month month is number from 1(Jan) to 12(Dec)
   * @param {number} year year is full year eg: 2022
   * @returns {number} number of days eg: 30
   */
  function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
  }

  const currencySymbol = {
    EUR: '€',
    USD: '$',
    CHF: 'CHf',
    INR: '₹',
  }

  const startingWeekDay = new Date(year + '-' + month + '-01').getDay()

  const days = new Array(startingWeekDay).fill('empty')
  const daysAvailInfo = new Array(startingWeekDay).fill('empty')
  const daysRateInfo = new Array(startingWeekDay).fill('empty')

  for (let i = 1; i <= daysInMonth(month, year); i++) {
    days.push(i)
  }

  for (let i = 0; i < daysInMonth(month, year); i++) {
    daysAvailInfo.push(availabilityInfo[i] ?? '-')
    daysRateInfo.push(ratesInfo[i] ?? '-')
  }

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  return (
    <div className="bg-gray-50  mx-1">
      <div className="grid grid-cols-7 gap-1 p-1">
        <div className="col-span-7 border-b-2 text-center border-gray-300 p-2 ">
          <span className="text-2xl opacity-80 font-bold">{months[month - 1]}</span>{' '}
          <span className="text-2xl opacity-80">{year}</span>
        </div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">SUN</div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">MON</div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">TUE</div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">WED</div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">THU</div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">FRI</div>
        <div className=" text-center py-1 text-sm opacity-50 tracking-wide">SAT</div>
      </div>
      <div className="grid grid-cols-7 bg-white gap-1 p-1 border border-gray-300">
        {days.map((day, index) => (
          <div
            className={
              day === 'empty'
                ? 'text-center'
                : daysAvailInfo[index] === '-'
                ? 'calendar-gray text-center p-1 sm:p-2 min-h-16 '
                : daysAvailInfo[index] === null || daysAvailInfo[index] === 0
                ? 'calendar-red text-center p-1 sm:p-2 min-h-16 '
                : 'calendar-green text-center p-1 sm:p-2 min-h-16 '
            }
            key={day + '/' + month + '/' + year + '=' + index}
          >
            <div className="text-sm">{day === 'empty' ? '' : day}</div>

            <div className="text-xs">
              {daysAvailInfo[index] === 'empty' ? (
                ''
              ) : (
                <>
                  <p className="text-xs">{daysAvailInfo[index]}</p>
                  <p className="text-xs">
                    {daysAvailInfo[index] !== '-' && daysRateInfo[index] !== '-'
                      ? `${currencySymbol[currency]} ${daysRateInfo[index]}`
                      : ''}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AvailabilityCalendar
