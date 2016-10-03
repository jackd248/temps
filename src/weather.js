const superagent = require('superagent')

const getWeather = function (url, city, option, callback) {
  superagent
      .get(url)
      .query({q: city})
      .query({units: getFormat()})
      .query({appid: getApiKey()})
      .end(function (err, res) {
        loading[option] = false
        if (err || !res.ok) {
          showErrorMessage('Failure during data fetching')
        } else {
          wdata[option] = res.body
          checkLoading()
          if (wdata[option].cod != 404) {
            setCity(city)
            if (callback && typeof (callback) === 'function') {
              callback()
            }
          } else {
            showErrorMessage(wdata[option].message)
          }
        }
      })
}

const refreshInfo = function () {
  const info = setInterval(function ()
    {
    refreshWeather()
    console.log('refresh info')
  }, 300000)
}

const refreshWeather = function () {
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


  window.setTimeout(colorPalette, 1000)
}

const showWeatherData = function () {
  if (numAnim == null) {
    numAnim = new CountUp("temp", 0, roundTemp(wdata[0].main.temp), 0, 2);
    numAnim.start();
  } else {
    numAnim.update(roundTemp(wdata[0].main.temp))
  }
  jQuery('#main .temp .unit').html('°')
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

const showForecastWeatherData = function () {
  jQuery('#details .forecast').html('')
  let html = ''
  for (let i = 0; i < 4; i++) {
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

const showHourlyWeatherData = function () {
  const wrap = jQuery('#details .hourly #canvas-holder')
  wrap.html('<canvas id="chart" width="280" height="100"></canvas>')
  const c = jQuery('#details .hourly #canvas-holder #chart')
  jQuery('#details .hourly #chartjs-tooltip').html()
  let d = []
  let e = []
  let max = 0
  let min = 50
  for (let i = 0; i < 10; i++) {
    const date = getDate(new Date(wdata[2].list[i].dt_txt))
    const temp = roundTemp(wdata[2].list[i].main.temp)
    const icon = wdata[2].list[i].weather[0].icon
    const obj = {
      x: date,
      y: temp
    }
    d[i] = obj
    e.push(icon)
    if (temp < min) {
      min = temp
    }
    if (temp > max) {
      max = temp
    }
  }

  const format = (getFormat() == 'metric') ? '°C' : '°F'

  max += 5
  min -= 5

  let previousTooltip = null

  const chart = new Chart(c, {
    type: 'line',
    data: {
      datasets: [{
        data: d,
        label: format,
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: color,
        borderCapStyle: 'butt',
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
      responsive: false
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
        callbacks: {
          footer: function (data) {
            const text = e[data[0].index]
            return text
          }
        },
        custom: function (tooltip) {
          const tooltipEl = jQuery('#chartjs-tooltip')

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
              const parts = tooltip.body[0].lines[0].split(':')
              const dates = tooltip.title[0].split(' - ')
              const innerHtml = '<div class="icon"></div> <span><b>' + parts[1].trim() + '</span></b> <span>' + parts[0].trim() + '</span><br/><small>' + dates[0].toLowerCase() + ', ' + dates[1] + '</small>'
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
