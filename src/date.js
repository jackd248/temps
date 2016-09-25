const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const getTodayDay = function () {
  var days = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]
  var date = getDate(new Date())
  return days[(date.getDay())]
}

const getTodayDate = function () {
  var date = getDate(new Date())
  return getTodayDay() + ', ' + months[date.getMonth()] + ' ' + date.getDate()
}

const addZero = function (i) {
  if (i < 10) {
    i = '0' + i
  }
  return i
}

const getTime = function () {
  var dt = getDate(new Date())
  return dt.getHours() + ':' + addZero(dt.getMinutes())
}

const getStyledDate = function (num) {
  var days = [
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
  ]
  var date = new Date()
  return days[(date.getDay() + num) % 7]
}

const showDate = function () {
  jQuery('#details .header .date').html(getTodayDate())
  jQuery('#main .clock').html(getTime())
  var clock = setInterval(function ()
    {
    refreshClock()
  }, 60000)
}

