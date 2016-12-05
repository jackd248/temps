const store = require('./store')
const color = require('./color')
const weather = require('./../components/weather')
const timezone = require('./../components/timezone')
const config = require('./../main/config.json')

const ipcRenderer = require('electron').ipcRenderer
const jQuery = require('jquery')
const moment = require('moment')

let loading = [false, false, false, false]

const getTodayDate = function () {
  var date = moment(timezone.getDate(new Date()))
  return date.format('dddd, MMM D');
}

const getTime = function () {
  var dt = moment(timezone.getDate(new Date()))
  return dt.format(store.getTimeFormat())
}

const getStyledDate = function (num) {
  return moment().add(num+1, 'days').format('ddd')
}

const roundTemp = function (temp) {
  return Math.round(temp)
}

const toggleSettings = function () {
  if (jQuery('#settings .content').is(':visible')) {
    jQuery('#main').height('300px')
    jQuery('#main .content').delay(500).fadeIn()
    jQuery('#main .actual-icon').delay(500).fadeIn()
    jQuery('#details').delay(500).fadeIn()
    jQuery('#settings').height('0px')
    jQuery('#settings .content').fadeOut()
    jQuery('#nav-icon').removeClass('open')
  } else {
    jQuery('#main').height('100px')
    jQuery('#main .content').fadeOut()
    jQuery('#main .actual-icon').fadeOut()
    jQuery('#details').fadeOut()
    jQuery('#settings').height('360px')
    jQuery('#settings .content').delay(500).fadeIn()
    jQuery('#nav-icon').addClass('open')
  }
}

const addZero = function (i) {
  if (i < 10) {
    i = '0' + i
  }
  return i
}

const toggleDetails = function () {
  if (jQuery('#details .hourly').is(':visible')) {
    jQuery('#details .hourly').fadeOut()
    jQuery('#details .forecast').delay(500).fadeIn()
  } else {
    jQuery('#details .forecast').fadeOut()
    jQuery('#details .hourly').delay(500).fadeIn()
    weather.showHourlyWeatherData()
  }
}

const showDate = function () {
  jQuery('#details .header .date').html(getTodayDate())
  jQuery('#main .clock').html(getTime())
  setInterval(function () {
    refreshClock()
  }, 60000)
}

const refreshClock = function () {
  jQuery('#details .header .date').html(getTodayDate())
  jQuery('#main .clock').html(getTime())
}

const showErrorMessage = function (message) {
  color.errorColor()
  ipcRenderer.send('no-title')
  hideAll()
  jQuery('#main .content .temp-note').html(message)
  jQuery('#main .actual-icon svg').html('<image xlink:href="../../assets/icons/11d.svg" src="../../assets/icons/11d.svg" width="80" height="80"/>')
  timezone.setTimezoneOffset(config.timezone.offset)
  refreshClock()
}

const reset = function () {
  jQuery('.drop').remove()
  jQuery('.thunder').remove()
  jQuery('.snow').remove()
  jQuery('#chartjs-tooltip').css('opacity', 0)
}

const startLoading = function () {
  loading[0] = true
  loading[1] = true
  loading[2] = true
  loading[3] = true
}

const getLoading = function () {
  return loading
}

const setLoading = function (l) {
  loading = l
}

const checkLoading = function () {
  if (!loading[0] && !loading[1] && !loading[2] && !loading[3]) {
    jQuery('.spinner').fadeOut()
  }
}

// function to generate a random number range.
const randRange = function (minNum, maxNum) {
  return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum)
}

const randomCity = function () {
  var cities = config.random.cities
  store.setCity(cities[randRange(0, cities.length - 1)])
  weather.refreshWeather()
}

const favoriteCity = function () {
  if (store.getFavoriteCity() && store.getFavoriteCity() !== '') {
    store.setCity(store.getFavoriteCity())
    weather.refreshWeather()
  }
}

const hideAll = function () {
  jQuery('#main .actual-icon svg').html('')
  jQuery('#details .content').hide()
  jQuery('#details .location').html('')
  jQuery('#details .hourly #canvas-holder').html('')
  jQuery('#main .content #temp').html('=( ')
  jQuery('#main .content .temp .unit').html('')
  jQuery('.clock').hide()
  weather.setNumAnimTemp(null)
  jQuery('.spinner').fadeOut()
}

const showAll = function () {
  jQuery('.clock').show()
  jQuery('#details .content').show()
}

exports.toggleSettings = toggleSettings
exports.toggleDetails = toggleDetails
exports.roundTemp = roundTemp
exports.showDate = showDate
exports.getStyledDate = getStyledDate
exports.getTodayDate = getTodayDate
exports.refreshClock = refreshClock
exports.showErrorMessage = showErrorMessage
exports.reset = reset
exports.startLoading = startLoading
exports.checkLoading = checkLoading
exports.randomCity = randomCity
exports.favoriteCity = favoriteCity
exports.getLoading = getLoading
exports.setLoading = setLoading
exports.randRange = randRange
exports.hideAll = hideAll
exports.showAll = showAll
