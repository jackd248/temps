const store = require('./store')
const utils = require('./utils')
const config = require('./../main/config.json')

const jQuery = require('jquery')

let color = null

const setColor = function (c) {
  color = c
  jQuery('#main').css('background-color', c)
  jQuery('.spinner > div').css('background-color', c)
}

const getColor = function () {
  return color
}

const errorColor = function () {
  setColor(config.color.error)
}

const colorPalette = function () {
  const wdata = store.getWdata()
  if (wdata[0].cod !== 200) {
    errorColor()
    return
  }
  var temp = utils.roundTemp(wdata[0].main.temp)
  var colors = config.color.list

  if (store.getFormat() === 'metric') {
    if (temp > 30) {
      setColor(colors[0])
    } else if (temp > 26) {
      setColor(colors[1])
    } else if (temp > 22) {
      setColor(colors[2])
    } else if (temp > 18) {
      setColor(colors[3])
    } else if (temp > 14) {
      setColor(colors[4])
    } else if (temp > 10) {
      setColor(colors[5])
    } else if (temp > 6) {
      setColor(colors[6])
    } else if (temp > 2) {
      setColor(colors[7])
    } else {
      setColor(colors[8])
    }
  } else {
    if (temp > 86) {
      setColor(colors[0])
    } else if (temp > 78) {
      setColor(colors[1])
    } else if (temp > 71) {
      setColor(colors[2])
    } else if (temp > 64) {
      setColor(colors[3])
    } else if (temp > 57) {
      setColor(colors[4])
    } else if (temp > 50) {
      setColor(colors[5])
    } else if (temp > 42) {
      setColor(colors[6])
    } else if (temp > 35) {
      setColor(colors[7])
    } else {
      setColor(colors[8])
    }
  }
}

exports.setColor = setColor
exports.getColor = getColor
exports.colorPalette = colorPalette
exports.errorColor = errorColor
