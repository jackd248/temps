function getWeather (city) {
    jQuery.get("http://api.openweathermap.org/data/2.5/weather?q=" + city + "&mode=json&units=" + getFormat() +  "&appid=" + getApiKey(), function(weatherdata){
        wdata = weatherdata;
        console.log(weatherdata);
    }).done(function() {
        loading[0] = false;
        checkLoading();
        if (wdata.cod != 404) {
            setCity(city);
            showWeatherData();
        } else {
            showErrorMessage(wdata.message);
        }
    }).fail(function(xhr, statusText) {
        showErrorMessage('Failure during data fetching');
        console.log(xhr);
        console.log(statusText);
    });
}

function getForecast (city) {
    jQuery.get("http://api.openweathermap.org/data/2.5/forecast/daily?q=" + city + "&mode=json&units=" + getFormat() +  "&cnt=7&appid=" + getApiKey(), function(weatherdata){
        fdata = weatherdata;
        console.log(weatherdata);
    }).done(function() {
        loading[1] = false;
        checkLoading();
        if (fdata.cod != 404) {
            setCity(city);
            showForecastWeatherData();
        } else {
            showErrorMessage(fdata.message);
        }
    }).fail(function(xhr, statusText) {
        showErrorMessage('Failure during data fetching');
        console.log(xhr);
        console.log(statusText);
    });
}
function getForecastHourly (city) {
    jQuery.get("http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&mode=json&units=" + getFormat() +  "&cnt=10&appid=" + getApiKey(), function(weatherdata){
        hdata = weatherdata;
        console.log(weatherdata);
    }).done(function() {
        loading[2] = false;
        checkLoading();
        if (hdata.cod != 404) {
            setCity(city);
            showHourlyWeatherData();
        } else {
            showErrorMessage(hdata.message);
        }
    }).fail(function(xhr, statusText) {
        showErrorMessage('Failure during data fetching');
        console.log(xhr);
        console.log(statusText);
    });
}

var refreshInfo = function() {
    var info = setInterval(function()
    {
        refreshWeather();
        console.log('refresh info');
    }, 300000);
};

var refreshWeather = function () {
    jQuery('.spinner').fadeIn();
    startLoading();
    reset();
    getWeather(getCity());
    getForecast(getCity());
    getForecastHourly(getCity());
    window.setTimeout(function() {
        if (getMbInfo() & wdata.cod != 404) {
            ipcRenderer.send('set-title', {
                temperature: roundTemp(wdata.main.temp),
                location: getCity(),
                icon: wdata.weather[0].icon
            });
        }
        if (wdata.cod != 404) {
            getTimezone();
        }

    }, 500);


    window.setTimeout( colorPalette, 500 );
};

var showWeatherData = function() {
    jQuery('#main .temp').html(roundTemp(wdata.main.temp) + '°');
    jQuery('#main .temp-note').html(wdata.weather[0].description);
    jQuery('#details .location').html(wdata.name.toLowerCase() + ', ' + wdata.sys.country.toLowerCase());
    jQuery('#main .actual-icon svg').html('<image xlink:href="assets/icons/' + wdata.weather[0].icon + '.svg" src="assets/icons/' + wdata.weather[0].icon + '.svg" width="80" height="80"/>');

    if (wdata.weather[0].main == 'Rain') {
        showRain();
    }

    if (wdata.weather[0].main == 'Snow') {
        showSnow();
    }

    if (wdata.weather[0].icon == '11d' || wdata.weather[0].icon == '11n') {
        showThunder();
    }
};

var showForecastWeatherData = function() {
    jQuery('#details .forecast').html('');
    var html = '';
    for (var i = 0; i < 4; i++) {
        html += '<div class="forecast-item" >';
        html += '<div class="date">' + getStyledDate(i) + '</div>';
        // html += '<div class="icon"><img src="assets/icons/' + fdata.list[i].weather[0].icon + '-1.png" widtH="60" alt="' + fdata.list[i].weather[0].description + '"/></div>';
        html += '<div class="icon" name="' + fdata.list[i].weather[0].icon + '"><img src="assets/icons/' + fdata.list[i].weather[0].icon + '-1.png" width="60" alt="' + fdata.list[i].weather[0].description + '"/></div>';
        html += '<div class="temp">' + roundTemp(fdata.list[i].temp.day) + '°</div>';
        html += '</div>';
    }
    jQuery('#details .forecast').html(html);

    jQuery('.forecast-item .icon').each(function (el) {
        jQuery(this).html('');
        jQuery(this).load('assets/icons/' + jQuery(this).attr('name') + '.svg');
    });
};

var showHourlyWeatherData = function () {
    var wrap = jQuery('#details .hourly');
    wrap.html('<canvas id="chart" width="280" height="100"></canvas>');
    var c = jQuery('#details .hourly #chart');;
    var d = [];
    var max = 0;
    var min = 50;
    for (var i = 0; i < 10; i++) {
        var date = hdata.list[i].dt_txt;
        var temp = roundTemp(hdata.list[i].main.temp);
        var obj = {
            x: date,
            y: temp
        };
        // usability data
        if (i == 0) {
            var nd = new Date(date);
            nd.setTime(nd.getTime() - (1*60*60*1000));
            var nt = temp;
            var ob = {
                x: nd.getFullYear() + '-' + (nd.getMonth()+1) + '-' + nd.getDate() + ' ' + nd.getHours() + ':0' + nd.getMinutes() + ':0' + nd.getSeconds(),
                y: nt
            };
            d[0] = ob;
        }
        d[i+1] = obj;
        if (temp < min) {
            min = temp;
        }
        if (temp > max) {
            max = temp;
        }
        if (i == 9) {
            var nd = new Date(date);
            nd.setTime(nd.getTime() + (1*60*60*1000));
            var nt = temp;
            var ob = {
                x: nd.getFullYear() + '-' + (nd.getMonth()+1) + '-' + nd.getDate() + ' ' + nd.getHours() + ':0' + nd.getMinutes() + ':0' + nd.getSeconds(),
                y: nt
            };
            d[11] = ob;
        }
    }

    var format = (getFormat() == 'metric') ? '°C' : '°F';

    max += 5;
    min -= 5;

    var chart = new Chart(c, {
        type: 'line',
        data: {
            datasets: [{
                data: d,
                fill: false,
                lineTension: 0.5,
                backgroundColor: "rgba(75,192,192,0.4)",
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
                pointHitRadius: 10,
                label: format
            }],
            fill: false,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,1)',
            responsive: true,
        },
        options: {
            legend: {
                display: false,
                labels: {
                    hidden: true
                }
            },
            tooltips: {
                backgroundColor: 'rgba(255,255,255,0.8)',
                titleFontFamily: 'Rubik, sans-serif',
                titleFontColor: '#CCC',
                titleFontSize: 14,
                bodyFontFamily: 'Rubik, sans-serif',
                bodyFontColor: '#000',
                bodyFontSize: 18,
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
                    },
                }]
            }
        }
    });
};
