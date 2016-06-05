var app = angular.module('temps', ['ngMaterial', 'md.data.table', 'ngMdIcons', 'ngMessages', 'ngMap', 'angularCharts']);

app.service('weatherService', ['$http', function ($http) {

    return {
        getWeather: function (ct, cb) {
            // Simple GET request example
            $http({
                url: 'http://api.openweathermap.org/data/2.5/weather?q=' + ct + '&mode=json&units=metric&appid=3262d5cec239ea0fc97e9b9ebddf9a10'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log(response);
                cb(response);
            }, function errorCallback(response) {
                console.log(response);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        },
        getForecast: function (ct, cb) {
            // Simple GET request example
            $http({
                url: 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + ct + '&mode=json&units=metric&cnt=7&appid=3262d5cec239ea0fc97e9b9ebddf9a10'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log(response);
                cb(response);
            }, function errorCallback(response) {
                console.log(response);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }, getForecastHourly: function (ct, cb) {
            // Simple GET request example
            $http({
                url: 'http://api.openweathermap.org/data/2.5/forecast?q=' + ct + '&mode=json&units=metric&appid=3262d5cec239ea0fc97e9b9ebddf9a10&cnt=7'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log(response);
                cb(response);
            }, function errorCallback(response) {
                console.log(response);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }

    }

}]);

app.controller('AppCtrl', ['$scope', '$http', 'weatherService', '$mdBottomSheet', '$mdSidenav', '$mdDialog', function ($scope, $http, weatherService, $mdBottomSheet, $mdSidenav, $mdDialog) {


    $scope.isLoading = true;
    $scope.showSearchPanel = false;
    $scope.isDisabled = false;
    $scope.num = 1;
    $scope.actCity = "Dresden";
    $scope.cityName;

    $scope.config = {
        title: '', // chart title. If this is false, no title element will be created.
        tooltips: true,
        labels: false, // labels on data points
        // exposed events
        mouseover: function() {},
        mouseout: function() {},
        click: function() {},
        // legend config
        legend: {
            display: true, // can be either 'left' or 'right'.
            position: 'left',
            // you can have html in series name
            htmlEnabled: false
        },
        // override this array if you're not happy with default colors
        colors: [],
        innerRadius: 0, // Only on pie Charts
        lineLegend: 'lineEnd', // Only on line Charts
        lineCurveType: 'cardinal', // change this as per d3 guidelines to avoid smoothline
        isAnimate: true, // run animations while rendering chart
        yAxisTickFormat: 's', //refer tickFormats in d3 to edit this value
        xAxisMaxTicks: 7, // Optional: maximum number of X axis ticks to show if data points exceed this number
        yAxisTickFormat: 's', // refer tickFormats in d3 to edit this value
        waitForHeightAndWidth: true // if true, it will not throw an error when the height or width are not defined (e.g. while creating a modal form), and it will be keep watching for valid height and width values
    };

    $scope.data = {
        x: "Computers",
        y: [54, 0, 879],
        tooltip: "This is a tooltip"
    }

    weatherService.getWeather($scope.actCity, showData);
    weatherService.getForecast($scope.actCity, showForecast);
    weatherService.getForecastHourly($scope.actCity, showForecastHourly);


    function showData(cityData) {
        $scope.isLoading = false;
        $scope.cityData = [];
        $scope.cityData = cityData.data;
        $scope.cityName = cityData.data;
    }

    function showForecast(cityForecast) {
        $scope.isLoading = false;
        $scope.cityForecast = [];
        $scope.cityForecast = cityForecast.data;
    }

    function showForecastHourly(cityForecastHourly) {
        $scope.isLoading = false;
        $scope.cityForecastHourly = [];
        $scope.cityForecastHourly = cityForecastHourly.data;
    }

    function between(x, min, max) {
        return x >= min && x <= max;
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }
    function showPosition(position) {
        console.log("Latitude: " + position.coords.latitude +
            "<br>Longitude: " + position.coords.longitude);
    }

    $scope.roundTemp = function (temp) {
        return Math.round(temp);
    };

    $scope.getDirection = function (dir) {
        var directions = [
            "N", "NE", "E", "SE", "S", "SW", "W", "NW"
        ];
        var deg = 0;
        if (between(dir, 0, 22) || between(dir, 338, 360)) {
            return directions[0];
        } else if (between(dir, 23, 67)) {
            return directions[1];
        } else if (between(dir, 68, 112)) {
            return directions[2];
        } else if (between(dir, 113, 157)) {
            return directions[3];
        } else if (between(dir, 158, 202)) {
            return directions[4];
        } else if (between(dir, 203, 247)) {
            return directions[5];
        } else if (between(dir, 248, 292)) {
            return directions[6];
        } else if (between(dir, 293, 337)) {
            return directions[7];
        }
    };

    $scope.getTodayDay = function () {
        var days = [
            "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
        ];
        var date = new Date();
        return days[(date.getDay() - 1 )];
    };

    $scope.getTodayDate = function () {
        var date = new Date();
        return date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
    };

    $scope.getStyledDate = function (num) {
        var days = [
            "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
        ];
        var date = new Date();
        return days[(date.getDay() + num) % 7];
    };

    $scope.getCuttedTime = function (time) {
        return time.substring(11, 16);
    };

    $scope.getStyledTime = function (time) {
        var date = new Date(time * 1000);
        return date.getHours() + ":" + date.getMinutes();
    }

    $scope.countNumber = function (i) {
        return ((i % 4) + 1);
    };

    $scope.getWeather = function (ct) {
        if (ct) {
            $scope.isLoading = true;
            $scope.actCity = ct;
            $scope.switch = false;
            weatherService.getWeather(ct, showData);
            weatherService.getForecast(ct, showForecast);
            weatherService.getForecastHourly(ct, showForecastHourly);
        }
    };

    $scope.getForecast = function (ct) {
        if (ct) {
            $scope.actCity = ct;
            $scope.isLoading = true;
            weatherService.getWeather(ct, showData);
            weatherService.getForecast(ct, showForecast);
            weatherService.getForecastHourly(ct, showForecastHourly);
        }
    };
}]);

app.controller('MapCtrl', function(NgMap) {
    NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
    });
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});



app.config(function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('amazingPaletteName', {
        '50': 'E4BC85',
        '100': 'DD985F',
        '200': 'B26958',
        '300': '654749',
        '400': 'B26958',
        '500': 'B26958',
        '600': 'B26958',
        '700': 'B26958',
        '800': 'B26958',
        '900': 'B26958',
        'A100': 'B26958',
        'A200': 'B26958',
        'A400': 'B26958',
        'A700': 'B26958',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                            // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });
    $mdThemingProvider.theme('default')
        .primaryPalette('amazingPaletteName')
});