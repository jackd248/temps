var setCity = function (city) {
  store.set('actual-city', city)
  jQuery('#settings input#city').val(city)

  if (store.get('favorite-city') != null) {
    if (city == store.get('favorite-city')) {
      jQuery('input[type="checkbox"][name="favorite-city"]').prop('checked', true)
    } else {
      jQuery('input[type="checkbox"][name="favorite-city"]').prop('checked', false)
    }
  }
}

var setFormat = function (format) {
  store.set('format', format)
  jQuery('input:radio[value=' + format + ']')[0].checked = true
}

var setApiKey = function (key) {
  store.set('apikey', key)
  jQuery('#settings input#apikey').val(key)
}

var setMbInfo = function (bool) {
  store.set('mb-info', bool)
  jQuery('input[type="checkbox"][name="mb-info"]').prop('checked', bool)
}

var setAutoLaunch = function (bool) {
  store.set('auto-launch', bool)
  jQuery('input[type="checkbox"][name="auto-launch"]').prop('checked', bool)
}

var setFavoriteCity = function (city) {
  store.set('favorite-city', city)
}

var getMbInfo = function () {
  if (store.get('mb-info') != null) {
    return store.get('mb-info')
  } else {
    return true
  }
}

var getAutoLaunch = function () {
  if (store.get('auto-launch') != null) {
    return store.get('auto-launch')
  } else {
    return true
  }
}

var getApiKey = function () {
  if (store.get('apikey')) {
    return store.get('apikey')
  } else {
    showErrorMessage('No API Key')
  }
}

var getFormat = function () {
  if (store.get('format')) {
    return store.get('format')
  } else {
    return 'metric'
  }
}

var getCity = function () {
  return store.get('actual-city')
}

var getFavoriteCity = function () {
  if (store.get('favorite-city')) {
    return store.get('favorite-city')
  } else {
    return ''
  }
}
