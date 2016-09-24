function getWeather (url, city, option, callback) {
  jQuery.get(url + '&q=' + city + '&units=' + getFormat() + '&appid=' + getApiKey(), function (weatherdata) {
    console.log(weatherdata)
    wdata[option] = weatherdata
  }).done(function () {
    loading[option] = false
    checkLoading()
    if (wdata[option].cod != 404) {
      setCity(city)
      if (callback && typeof (callback) === 'function') {
        callback()
      }
    } else {
      showErrorMessage(wdata[option].message)
    }
  }).fail(function (xhr, statusText) {
    showErrorMessage('Failure during data fetching')
    console.log(xhr)
    console.log(statusText)
  })
}

var refreshInfo = function () {
  var info = setInterval(function ()
    {
    refreshWeather()
    console.log('refresh info')
  }, 300000)
}

var refreshWeather = function () {
  jQuery('.spinner').fadeIn()
  startLoading()
  reset()
  getWeather(config.weather.url.actual, getCity(), 0, showWeatherData)
  getWeather(config.weather.url.daily, getCity(), 1, showForecastWeatherData)
  getWeather(config.weather.url.hourly, getCity(), 2)
  window.setTimeout(function () {
    if (getMbInfo() & wdata[0].cod != 404) {
      ipcRenderer.send('set-title', {
        temperature: roundTemp(wdata[0].main.temp),
        location: getCity(),
        icon: wdata[0].weather[0].icon
      })
    }
    if (wdata[0].cod != 404) {
      getTimezone()
    }
  }, 500)


  window.setTimeout(colorPalette, 600)
}

var showWeatherData = function () {
  jQuery('#main .temp').html(roundTemp(wdata[0].main.temp) + '°')
  jQuery('#main .temp-note').html(wdata[0].weather[0].description)
  jQuery('#details .location').html(wdata[0].name.toLowerCase() + ', ' + wdata[0].sys.country.toLowerCase())
  jQuery('#main .actual-icon svg').html('<image xlink:href="assets/icons/' + wdata[0].weather[0].icon + '.svg" src="assets/icons/' + wdata[0].weather[0].icon + '.svg" width="80" height="80"/>')

  if (wdata[0].weather[0].main == 'Rain') {
    showRain()
  }

  if (wdata[0].weather[0].main == 'Snow') {
    showSnow()
  }

  if (wdata[0].weather[0].icon == '11d' || wdata[0].weather[0].icon == '11n') {
    showThunder()
  }

  colorPalette()
}

var showForecastWeatherData = function () {
  jQuery('#details .forecast').html('')
  var html = ''
  for (var i = 0; i < 4; i++) {
    html += '<div class="forecast-item" >'
    html += '<div class="date">' + getStyledDate(i) + '</div>'
        // html += '<div class="icon"><img src="assets/icons/' + wdata[1].list[i].weather[0].icon + '-1.png" width="60" alt="' + wdata[1].list[i].weather[0].description + '"/></div>';
    html += '<div class="icon" name="' + wdata[1].list[i].weather[0].icon + '"><img src="assets/icons/' + wdata[1].list[i].weather[0].icon + '-1.png" width="60" alt="' + wdata[1].list[i].weather[0].description + '"/></div>'
    html += '<div class="temp">' + roundTemp(wdata[1].list[i].temp.day) + '°</div>'
    html += '</div>'
  }
  jQuery('#details .forecast').html(html)

  jQuery('.forecast-item .icon').each(function (el) {
    jQuery(this).html('')
    jQuery(this).load('assets/icons/' + jQuery(this).attr('name') + '.svg', null, function () {
      jQuery('#details .forecast-item svg path').css('fill', color)
      jQuery('#details .forecast-item svg circle').css('fill', color)
    })
  })
}

var showHourlyWeatherData = function () {
  var wrap = jQuery('#details .hourly #canvas-holder')
  wrap.html('<canvas id="chart" width="280" height="100"></canvas>')
  var c = jQuery('#details .hourly #chart')
  var d = []
  var e = []
  var max = 0
  var min = 50
  for (var i = 0; i < 10; i++) {
    var date = getDate(new Date(wdata[2].list[i].dt_txt))
    var temp = roundTemp(wdata[2].list[i].main.temp)
    var icon = wdata[2].list[i].weather[0].icon
    var obj = {
      x: date,
      y: temp
    }
        // usability data
    if (i == 0) {
      var nd = new Date(date)
      nd.setTime(nd.getTime() - (1 * 60 * 60 * 1000))
      var nt = temp
      var ob = {
        x: nd.getFullYear() + '-' + (nd.getMonth() + 1) + '-' + nd.getDate() + ' ' + nd.getHours() + ':0' + nd.getMinutes() + ':0' + nd.getSeconds(),
        y: nt
      }
      d[0] = ob
      e.push(icon)
    }
    d[i + 1] = obj
    e.push(icon)
    if (temp < min) {
      min = temp
    }
    if (temp > max) {
      max = temp
    }
    if (i == 9) {
      var nd = new Date(date)
      nd.setTime(nd.getTime() + (1 * 60 * 60 * 1000))
      var nt = temp
      var ob = {
        x: nd.getFullYear() + '-' + (nd.getMonth() + 1) + '-' + nd.getDate() + ' ' + nd.getHours() + ':0' + nd.getMinutes() + ':0' + nd.getSeconds(),
        y: nt
      }
      d[11] = ob
      e.push(icon)
    }
  }

  var format = (getFormat() == 'metric') ? '°C' : '°F'

  max += 5
  min -= 5

  var previousTooltip = null

  var chart = new Chart(c, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        data: d,
        label: format,
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: color,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: color,
        pointBackgroundColor: color,
        pointBorderWidth: 1,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10
      }],
      fill: false,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,1)',
      responsive: true
    },
    options: {
      legend: {
        display: false,
        labels: {
          hidden: false
        }
      },
      tooltips: {
        enabled: false,
        mode: 'x-axis',
        backgroundColor: 'rgba(255,255,255,0.8)',
        titleFontFamily: 'Rubik, sans-serif',
        titleFontColor: '#CCC',
        titleFontSize: 14,
        bodyFontFamily: 'Rubik, sans-serif',
        bodyFontColor: '#000',
        bodyFontSize: 18,
        callbacks: {
          footer: function (data) {
            var text = e[data[0].index]
            return text
          }
        },
        custom: function (tooltip) {
          var tooltipEl = jQuery('#chartjs-tooltip')

          if (!tooltip) {
            tooltipEl.css({
              opacity: 0
            })
            return
          }

          if (tooltip.body) {
            if (previousTooltip != tooltip.title[0]) {
              tooltipEl.removeClass('above below')
              tooltipEl.addClass(tooltip.yAlign)
              var parts = tooltip.body[0].lines[0].split(':')
              var dates = tooltip.title[0].split(' - ')
              var innerHtml = '<div class="icon"></div> <span><b>' + parts[1].trim() + '</span></b> <span>' + parts[0].trim() + '</span><br/><small>' + dates[0].toLowerCase() + ', ' + dates[1] + '</small>'
              tooltipEl.html(innerHtml)

              jQuery('#chartjs-tooltip .icon').load('assets/icons/' + tooltip.footer[0] + '.svg', null, function () {
                jQuery(this).find('svg path').css('fill', color)
              })
              tooltipEl.css({
                opacity: 1,
                left: tooltip.x + 40 + 'px',
                // top: tooltip.y + 350 +'px',
                top: 430 + 'px' // always on bottom
              })
              previousTooltip = tooltip.title[0]
            }

          }
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          position: 'bottom',
          time: {
            unit: 'hour',
            tooltipFormat: 'ddd - HH:mm',
            displayFormats: {
              hour: 'MMM D, hA'
            }
          },
          display: false
        }],
        yAxes: [{
          display: false,
          ticks: {
            max: max,
            min: min
          }
        }]
      },
      hover: {
        mode: 'x-axis'
      }
    }
  })
}
