var apikey = 'AIzaSyD7CnHeMDQV_XCXlimoPwiPSB_83Wfq7LE';

function getTimezone () {
    jQuery.get("https://maps.googleapis.com/maps/api/timezone/json?location=" + wdata.coord.lat + "," + wdata.coord.lon + "&timestamp=1331161200&key=" + apikey, function(data){
        console.log(data);
    }).done(function() {

    }).fail(function() {
        showErrorMessage('Failure during data fetching');
    });
}