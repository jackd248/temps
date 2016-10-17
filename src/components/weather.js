'use strict'

const superagent = require('superagent')
const jQuery = require('jquery')
const Chart = require('chart.js')
const CountUp = require('countup.js')
const ipcRenderer = require('electron').ipcRenderer

const store = require('./../utilities/store')
const color = require('./../utilities/color')
const utils = require('./../utilities/utils')
const timezone = require('./timezone')
const config = require('./../main/config.json')

let NumAnimTemp = null
let NumAnimF = []
let chartjs = null

const getWeatherByCity = function (url, city, option, callback) {
  superagent
      .get(url)
      .query({q: city})
      .query({units: store.getFormat()})
      .query({appid: store.getApiKey()})
      .end(function (err, res) {
        let loading = utils.getLoading
        loading[option] = false
        utils.setLoading(loading)
        if (err || !res.ok) {
          utils.showErrorMessage('Failure during data fetching')
          console.log(err)
        } else {
          const wdata = store.getWdata()
          wdata[option] = res.body
          store.setWdata(wdata)
          utils.checkLoading()
          if (wdata[option].cod !== 404) {
            store.setCity(city)
            if (callback && typeof (callback) === 'function') {
              callback()
            }
          } else {
            utils.showErrorMessage(wdata[option].message)
          }
        }
      })
}

const getWeatherByCoord = function (url, lat, lon, option, callback) {
  superagent
      .get(url)
      .query({lat: lat})
      .query({lon: lon})
      .query({units: store.getFormat()})
      .query({appid: store.getApiKey()})
      .end(function (err, res) {
        let loading = utils.getLoading
        loading[option] = false
        utils.setLoading(loading)
        if (err || !res.ok) {
          utils.showErrorMessage('Failure during data fetching')
        } else {
          const wdata = store.getWdata()
          wdata[option] = res.body
          store.setWdata(wdata)
          utils.checkLoading()
          if (wdata[option].cod !== 404) {
            if (option === 0) store.setCity(wdata[option].name + ', ' + wdata[option].sys.country.toUpperCase())
            if (callback && typeof (callback) === 'function') {
              callback()
            }
          } else {
            utils.showErrorMessage(wdata[option].message)
          }
        }
      })
}

const refreshInfo = function () {
  setInterval(function () {
    refreshWeather()
    console.log('refresh info')
  }, config.start.interval)
}

const refreshWeather = function () {
  jQuery('.spinner').fadeIn()
  utils.showAll()
  const wdata = store.getWdata()
  utils.startLoading()
  utils.reset()
  getWeatherByCity(config.weather.url.actual, store.getCity(), 0, showWeatherData)
  getWeatherByCity(config.weather.url.daily, store.getCity(), 1, showForecastWeatherData)
  getWeatherByCity(config.weather.url.hourly, store.getCity(), 2)

  window.setTimeout(function () {
    if (store.getMbInfo() && wdata[0].cod !== 404) {
      ipcRenderer.send('set-title', {
        temperature: utils.roundTemp(wdata[0].main.temp),
        location: store.getCity(),
        icon: wdata[0].weather[0].icon
      })
    }
    if (wdata[0].cod !== 404) {
      timezone.getTimezone()
    }
  }, 500)

  window.setTimeout(color.colorPalette, 1000)
}

const showWeatherData = function () {
  const wdata = store.getWdata()
  if (NumAnimTemp === null) {
    NumAnimTemp = new CountUp('temp', 0, utils.roundTemp(wdata[0].main.temp), 0, 2)
    NumAnimTemp.start()
  } else {
    NumAnimTemp.update(utils.roundTemp(wdata[0].main.temp))
  }
  jQuery('#main .temp .unit').html('°')
  jQuery('#main .temp-note').html(wdata[0].weather[0].description)
  jQuery('#details .location').html(wdata[0].name.toLowerCase() + ', ' + wdata[0].sys.country.toLowerCase())
  jQuery('#main .actual-icon svg').html('<image xlink:href="../../assets/icons/' + wdata[0].weather[0].icon + '.svg" src="../../assets/icons/' + wdata[0].weather[0].icon + '.svg" width="80" height="80"/>')

  if (wdata[0].weather[0].main === 'Rain') {
    if (wdata[0].weather[0].description.indexOf('light') !== -1) {
      showRain(50)
    } else if (wdata[0].weather[0].description.indexOf('heavy') !== -1) {
      showRain(200)
    } else {
      showRain(100)
    }
  }

  if (wdata[0].weather[0].main === 'Snow') {
    showSnow()
  }

  if (wdata[0].weather[0].icon === '11d' || wdata[0].weather[0].icon === '11n') {
    showThunder()
  }

  color.colorPalette()
}

const showForecastWeatherData = function () {
  const wdata = store.getWdata()
  let items = jQuery('#details .forecast .forecast-item')
  items.each(function (i, item) {
    jQuery('.item-' + i + ' .date').html(utils.getStyledDate(i))
    jQuery('.item-' + i + ' .icon').html('<img src="../../assets/icons/' + wdata[1].list[i].weather[0].icon + '.png" width="60" alt="' + wdata[1].list[i].weather[0].description + '"/>')
    jQuery('.item-' + i + ' .icon').attr('name', wdata[1].list[i].weather[0].icon)
    if (NumAnimF[i] === null || NumAnimF[i] === undefined) {
      NumAnimF[i] = new CountUp('temp-' + i, 0, utils.roundTemp(wdata[1].list[i].temp.day), 0, 2)
      NumAnimF[i].start()
    } else {
      NumAnimF[i].update(utils.roundTemp(wdata[1].list[i].temp.day))
    }
    jQuery('.item-' + i + ' .temp .unit').html('°')
  })

  jQuery('.forecast-item .icon').each(function (el) {
    jQuery(this).html('')
    jQuery(this).load('../../assets/icons/' + jQuery(this).attr('name') + '.svg', null, function () {
      jQuery('#details .forecast-item svg path').css('fill', color.getColor())
      jQuery('#details .forecast-item svg circle').css('fill', color.getColor())
    })
  })
}

const showHourlyWeatherData = function () {
  const wdata = store.getWdata()
  const wrap = jQuery('#details .hourly #canvas-holder')
  wrap.html('<canvas id="chart" width="280" height="100"></canvas>')
  const c = jQuery('#details .hourly #canvas-holder #chart')
  jQuery('#details .hourly #chartjs-tooltip').html()
  let d = []
  let e = []
  let max = 0
  let min = 50
  for (let i = 0; i < 10; i++) {
    const date = timezone.getDate(new Date(wdata[2].list[i].dt_txt))
    const temp = utils.roundTemp(wdata[2].list[i].main.temp)
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

  const format = (store.getFormat() === 'metric') ? '°C' : '°F'

  max += 5
  min -= 5

  let previousTooltip = null

  chartjs = new Chart(c, {
    type: 'line',
    data: {
      datasets: [{
        data: d,
        label: format,
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: color.getColor(),
        borderCapStyle: 'butt',
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: color.getColor(),
        pointBackgroundColor: color.getColor(),
        pointBorderWidth: 1,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color.getColor(),
        pointHoverBorderColor: color.getColor(),
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
            if (previousTooltip !== tooltip.title[0]) {
              tooltipEl.removeClass('above below')
              tooltipEl.addClass(tooltip.yAlign)
              const parts = tooltip.body[0].lines[0].split(':')
              const dates = tooltip.title[0].split(' - ')
              const innerHtml = '<div class="icon"></div> <span><b>' + parts[1].trim() + '</span></b> <span>' + parts[0].trim() + '</span><br/><small>' + dates[0].toLowerCase() + ', ' + dates[1] + '</small>'
              tooltipEl.html(innerHtml)

              jQuery('#chartjs-tooltip .icon').load('../../assets/icons/' + tooltip.footer[0] + '.svg', null, function () {
                jQuery(this).find('svg path').css('fill', color.getColor())
              })
              let x = tooltip.x
              if (x < 0) {
                x = 0
              } else if (x > 210) {
                x = 210
              }
              tooltipEl.css({
                opacity: 1,
                left: x + 35 + 'px',
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
  }, chartjs)
}

const getGeolocation = function () {
  jQuery('.spinner').fadeIn()
  utils.startLoading()

  superagent
      .get(config.location.url)
      .query({browser: 'chromium'})
      .query({sensor: true})
      .end(function (err, res) {
        if (err || !res.ok) {
          console.log(err)
          utils.showErrorMessage('Failure during location fetching')
        } else {
          const lat = res.body.location.lat
          const lon = res.body.location.lng

          utils.reset()
          getWeatherByCoord(config.weather.url.actual, lat, lon, 0, showWeatherData)
          getWeatherByCoord(config.weather.url.daily, lat, lon, 1, showForecastWeatherData)
          getWeatherByCoord(config.weather.url.hourly, lat, lon, 2)

          const wdata = store.getWdata()

          window.setTimeout(function () {
            if (store.getMbInfo() & wdata[0].cod !== 404) {
              ipcRenderer.send('set-title', {
                temperature: utils.roundTemp(wdata[0].main.temp),
                location: store.getCity(),
                icon: wdata[0].weather[0].icon
              })
            }
            if (wdata[0].cod !== 404) {
              timezone.getTimezone()
            }
          }, 500)

          window.setTimeout(color.colorPalette, 1000)
        }
      })
}

const showRain = function (nbDrop = 100) {
  for (var i = 1; i < nbDrop; i++) {
    var dropLeft = utils.randRange(0, 400)
    var dropTop = utils.randRange(-1000, 1400)

    jQuery('#main').append('<div class="drop" id="drop' + i + '"></div>')
    jQuery('#drop' + i).css('left', dropLeft)
    jQuery('#drop' + i).css('top', dropTop)
  }
}

const showThunder = function () {
  jQuery('#main').prepend('<div class="thunder"></div>')
}

const showSnow = function () {
  jQuery('#main').prepend('<div class="snow"></div>')
}

const getNumAnimTemp = function () {
  return NumAnimTemp
}

const setNumAnimTemp = function (na) {
  NumAnimTemp = na
}

exports.getWeatherByCity = getWeatherByCity
exports.getWeatherByCoord = getWeatherByCoord
exports.refreshInfo = refreshInfo
exports.refreshWeather = refreshWeather
exports.showWeatherData = showWeatherData
exports.showForecastWeatherData = showForecastWeatherData
exports.showHourlyWeatherData = showHourlyWeatherData
exports.getGeolocation = getGeolocation
exports.getNumAnimTemp = getNumAnimTemp
exports.setNumAnimTemp = setNumAnimTemp
