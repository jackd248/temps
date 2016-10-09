const getTimezone = function () {
  superagent
      .get(config.timezone.url)
      .query({location: wdata[0].coord.lat + ',' + wdata[0].coord.lon})
      .query({timestamp: Math.floor(Date.now() / 1000)})
      .query({key: config.timezone.apikey})
      .end(function (err, res) {
        loading[3] = false
        if (err || !res.ok) {
          showErrorMessage('Failure during data fetching')
        } else {
          timeoffset = res.body.rawOffset + res.body.dstOffset
          jQuery('#details .header .date').html(getTodayDate())
          refreshClock()
          checkLoading()
          showHourlyWeatherData()
        }
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
