const jQuery = require('jquery')
const ipcRenderer = require('electron').ipcRenderer

const config = require('./src/config.json')
const store = require('./src/store')
const weather = require('./src/weather')
const utils = require('./src/utils')

window.onload = function () {
  init()

  weather.refreshWeather()

  loadEventListener()
}

const loadEventListener = function () {
  jQuery('#details .content').click(utils.toggleDetails)

  utils.showDate()
  weather.refreshInfo()

  jQuery('input#city').keypress(function (e) {
    if (e.which === 13) {
      store.setCity(jQuery('input#city').val())
      weather.refreshWeather()
      utils.toggleSettings()
      return false
    }
  })

  jQuery('input#apikey').keypress(function (e) {
    if (e.which === 13) {
      store.setApiKey(jQuery('input#apikey').val())
      weather.refreshWeather()
      utils.toggleSettings()
      return false
    }
  })

  jQuery('input[type="radio"][name="format"]').change(function () {
    store.setFormat(jQuery(this).val())
    weather.refreshWeather()
  })

  jQuery('input[type="checkbox"][name="favorite-city"]').change(function () {
    const bool = jQuery('input[type="checkbox"][name="favorite-city"]:checked').length > 0
    if (bool) {
      store.setFavoriteCity(jQuery('input#city').val())
    } else {
      store.setFavoriteCity('')
    }
  })

  jQuery('input[type="checkbox"][name="mb-info"]').change(function () {
    const bool = jQuery('input[type="checkbox"][name="mb-info"]:checked').length > 0
    store.setMbInfo(bool)
    if (store.getMbInfo()) {
      weather.refreshWeather()
    } else {
      ipcRenderer.send('no-title')
    }
  })

  jQuery('input[type="checkbox"][name="auto-launch"]').change(function () {
    const bool = jQuery('input[type="checkbox"][name="auto-launch"]:checked').length > 0
    store.setAutoLaunch(bool)
    ipcRenderer.send('auto-launch')
  })

  jQuery('.location').click(function () {
    utils.toggleSettings()
    jQuery('input#city').delay(600).focus().select()
  })

  jQuery('#main').click(function () {
    if (jQuery('#settings .content').is(':visible')) {
      utils.toggleSettings()
    }
  })

  jQuery('#main .content').click(function () {
    weather.refreshWeather()
  })

  jQuery('#nav-icon').click(function () {
    utils.toggleSettings()
  })

  jQuery('#settings .geolocation').click(function () {
    weather.getGeolocation()
    utils.toggleSettings()
  })

  jQuery('a').click(function (e) {
    e.preventDefault()
    const target = jQuery(this).attr('href')
    ipcRenderer.send('will-navigate', {
      url: target
    })
  })

  jQuery('#settings .apply').click(function () {
    store.setCity(jQuery('input#city').val())
    store.setApiKey(jQuery('input#apikey').val())
    weather.refreshWeather()
    utils.toggleSettings()
  })

  jQuery('#settings .quit').click(function () {
    ipcRenderer.send('close')
  })

  ipcRenderer.on('show', weather.refreshWeather)

  ipcRenderer.on('toggle-details', utils.toggleDetails)

  ipcRenderer.on('toggle-settings', utils.toggleSettings)

  ipcRenderer.on('reload-data', weather.refreshWeather)

  ipcRenderer.on('favorite-city', utils.favoriteCity)

  ipcRenderer.on('random-city', utils.randomCity)

  ipcRenderer.on('geolocation', weather.getGeolocation)
}

const init = function () {
  if (store.getCity()) {
    store.setCity(store.getCity())
  } else {
    store.setCity('Berlin, DE')
  }

  if (store.getFormat()) {
    store.setFormat(store.getFormat())
  } else {
    store.setFormat('metric')
  }

  if (store.getApiKey()) {
    store.setApiKey(store.getApiKey())
  } else {
    // utils.showErrorMessage('No api key.')
    store.setApiKey(config.apikey)
  }

  if (store.getMbInfo()) {
    store.setMbInfo(store.getMbInfo())
  } else {
    store.setMbInfo(true)
  }

  if (store.getAutoLaunch()) {
    store.setAutoLaunch(store.getAutoLaunch())
  } else {
    store.setAutoLaunch(true)
  }

  if (store.getFavoriteCity()) {
    if (store.getCity() === store.getFavoriteCity()) {
      jQuery('input[type="checkbox"][name="favorite-city"]').prop('checked', true)
    } else {
      jQuery('input[type="checkbox"][name="favorite-city"]').prop('checked', false)
    }
  }
}
