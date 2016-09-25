const setColor = function (c) {
  color = c
  jQuery('#main').css('background-color', c)
  jQuery('.spinner > div').css('background-color', c)
}

const colorPalette = function (data) {
  if (data[0].cod == 404) {
    setColor('#444444')
    return
  }
  var temp = roundTemp(data[0].main.temp)
  var colors = config.colors

  if (Store.getFormat() == 'metric') {
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
