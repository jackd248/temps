var localStorage = require('localStorage')
let JsonStorage = require('json-storage').JsonStorage
let localStore = JsonStorage.create(localStorage, 'temps', { stringify: true })

const jQuery = require('jquery')
const config = require('./../main/config.json')

let wdata = {}

const setCity = function (city) {
  localStore.set('actual-city', city)
  jQuery('#settings input#city').val(city)

  if (localStore.get('favorite-city') != null) {
    if (city === localStore.get('favorite-city')) {
      jQuery('input[type="checkbox"][name="favorite-city"]').prop('checked', true)
    } else {
      jQuery('input[type="checkbox"][name="favorite-city"]').prop('checked', false)
    }
  }
}

const setFormat = function (format) {
  localStore.set('format', format)
  jQuery('input:radio[value=' + format + ']')[0].checked = true
}

const setApiKey = function (key) {
  localStore.set('apikey', key)
  jQuery('#settings input#apikey').val(key)
}

const setMbInfo = function (bool) {
  localStore.set('mb-info', bool)
  jQuery('input[type="checkbox"][name="mb-info"]').prop('checked', bool)
}

const setAutoLaunch = function (bool) {
  localStore.set('auto-launch', bool)
  jQuery('input[type="checkbox"][name="auto-launch"]').prop('checked', bool)
}

const setFavoriteCity = function (city) {
  localStore.set('favorite-city', city)
}

const getMbInfo = function () {
  if (localStore.get('mb-info') != null) {
    return localStore.get('mb-info')
  } else {
    return true
  }
}

const getAutoLaunch = function () {
  if (localStore.get('auto-launch') != null) {
    return localStore.get('auto-launch')
  } else {
    return true
  }
}

const getApiKey = function () {
  if (localStore.get('apikey')) {
    return localStore.get('apikey')
  } else {
    return null
  }
}

const getFormat = function () {
  if (localStore.get('format')) {
    return localStore.get('format')
  } else {
    return config.start.format
  }
}

const getCity = function () {
  return localStore.get('actual-city')
}

const getFavoriteCity = function () {
  if (localStore.get('favorite-city')) {
    return localStore.get('favorite-city')
  } else {
    return ''
  }
}

const getWdata = function () {
  return wdata
}

const setWdata = function (data) {
  wdata = data
}

const getTimeFormat = function () {
  return localStore.get('time-format')
}

const setTimeFormat = function (format) {
  localStore.set('time-format', format)
  if (format === 'HH:mm')
    jQuery('input:radio[name="time"]')[0].checked = true
  else
    jQuery('input:radio[name="time"]')[1].checked = true
}

const getIconSetting = function () {
  return localStore.get('icon-setting')
}

const setIconSetting = function (setting) {
  localStore.set('icon-setting', setting)
  jQuery('.menubar-icon select').val(setting)
}

exports.getWdata = getWdata
exports.setWdata = setWdata
exports.setCity = setCity
exports.getCity = getCity
exports.setApiKey = setApiKey
exports.getApiKey = getApiKey
exports.getFormat = getFormat
exports.setFormat = setFormat
exports.getMbInfo = getMbInfo
exports.setMbInfo = setMbInfo
exports.getFavoriteCity = getFavoriteCity
exports.setFavoriteCity = setFavoriteCity
exports.getAutoLaunch = getAutoLaunch
exports.setAutoLaunch = setAutoLaunch
exports.getTimeFormat = getTimeFormat
exports.setTimeFormat = setTimeFormat
exports.getIconSetting = getIconSetting
exports.setIconSetting = setIconSetting
