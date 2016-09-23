var localStorage = require('localStorage');
var JsonStorage = require('json-storage').JsonStorage;
var store = JsonStorage.create(localStorage, 'temps', { stringify: true });

var $, jQuery = require('jquery');
var chart = require("chart.js");
var ipcRenderer = require('electron').ipcRenderer;

const config = require('./src/config.json');

var wdata = {};

var color = null;
var loading = [false, false ,false, false];
var timeoffset = config.timezone.offset;

window.onload = function ()
{
    init();
    
    refreshWeather();

    loadEventListener();
};

var loadEventListener = function() {

    jQuery('#details .content').click(toggleDetails);

    showDate();
    refreshInfo();

    jQuery('input#city').keypress(function (e) {
        if (e.which == 13) {
            setCity(jQuery('input#city').val());
            refreshWeather();
            toggleSettings();
            return false;
        }
    });

    jQuery('input#apikey').keypress(function (e) {
        if (e.which == 13) {
            setApiKey(jQuery('input#apikey').val());
            refreshWeather();
            toggleSettings();
            return false;
        }
    });
    
    jQuery('input[type="radio"][name="format"]').change(function () {
         setFormat(jQuery(this).val());
        refreshWeather();
    });

    jQuery('input[type="checkbox"][name="mb-info"]').change(function () {
        var bool =jQuery('input[type="checkbox"][name="mb-info"]:checked').length > 0;
        setMbInfo(bool);
        if (getMbInfo()) {
            refreshWeather();
        } else {
            ipcRenderer.send('no-title');
        }
    });

    jQuery('input[type="checkbox"][name="auto-launch"]').change(function () {
        var bool =jQuery('input[type="checkbox"][name="auto-launch"]:checked').length > 0;
        setAutoLaunch(bool);
        ipcRenderer.send('auto-launch');
    });

    jQuery('.location').click(function () {
        toggleSettings();
        jQuery('input#city').delay(600).focus().select();
    });

    jQuery('#main').click(function () {
        if (jQuery('#settings .content').is(":visible")) {
            toggleSettings();
        }
    });

    jQuery('#main .content').click(function () {
        refreshWeather();
    });

    jQuery('#main .settings img').click(function() {
        toggleSettings();
    });
    
    jQuery('#settings .close').click(function() {
        ipcRenderer.send('close');
    });

    ipcRenderer.on('show', function() {
        refreshWeather();
    });
};

var init = function() {
    if (store.get('actual-city')) {
        setCity(store.get('actual-city'));
    }  else {
        setCity('Dresden, DE');
    }

    if (store.get('format')) {
        setFormat(store.get('format'));
    }  else {
        setFormat('metric');
    }

    if (store.get('apikey')) {
        setApiKey(store.get('apikey'));
    }  else {
        showErrorMessage('No api key.')
    }

    if (store.get('mb-info') != null) {
        setMbInfo(store.get('mb-info'));
    }  else {
        setMbInfo(true);
    }

    if (store.get('auto-launch') != null) {
        setAutoLaunch(store.get('auto-launch'));
    }  else {
        setAutoLaunch(true);
    }
};