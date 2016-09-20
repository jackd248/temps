var apikey = 'AIzaSyD7CnHeMDQV_XCXlimoPwiPSB_83Wfq7LE';

function getTimezone() {
    jQuery.get("https://maps.googleapis.com/maps/api/timezone/json?location=" + wdata.coord.lat + "," + wdata.coord.lon + "&timestamp=1331161200&key=" + apikey, function(data){
        console.log(data);
        timeoffset = data.rawOffset + 3600;
        console.log(addSeconds(convertDateToUTC(new Date()), data.rawOffset));
    }).done(function() {
        jQuery('#details .header .date').html(getTodayDate());
        refreshClock();
    }).fail(function() {
        // showErrorMessage('Failure during data fetching');
    });
}

function convertDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds*1000);
}

function getDate() {
    return addSeconds(convertDateToUTC(new Date()), timeoffset);
}
