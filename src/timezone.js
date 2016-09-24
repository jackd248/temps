function getTimezone () {
  jQuery.get(config.timezone.url + '?location=' + wdata[0].coord.lat + ',' + wdata[0].coord.lon + '&timestamp=1331161200&key=' + config.timezone.apikey, function (data) {
    timeoffset = data.rawOffset + 3600
  }).done(function () {
    jQuery('#details .header .date').html(getTodayDate())
    refreshClock()
    loading[3] = false
    checkLoading()
    showHourlyWeatherData()
  }).fail(function () {
        // showErrorMessage('Failure during data fetching');
  })
}

function convertDateToUTC (date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}

function addSeconds (date, seconds) {
  return new Date(date.getTime() + seconds * 1000)
}

function getDate (date) {
  return addSeconds(convertDateToUTC(date), timeoffset)
}
