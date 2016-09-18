var apikey = 'AIzaSyD7CnHeMDQV_XCXlimoPwiPSB_83Wfq7LE';

function getTimezone () {
    jQuery.get("https://maps.googleapis.com/maps/api/timezone/json?location=" + wdata.coord.lat + "," + wdata.coord.lon + "&timestamp=1331161200&key=" + apikey, function(data){
        console.log(data);
        var d = new Date();
        console.log(Date.UTC(d.getFullYear(),(d.getMonth()+1),d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()));
        console.log(d.getTimezoneOffset()*60);
    }).done(function() {

    }).fail(function() {
        showErrorMessage('Failure during data fetching');
    });
}