'use strict';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var globalShortcut = electron.globalShortcut;
var AutoLaunch = require('auto-launch');
var menubar = require('menubar');
// var ipc = require('ipc');
var ipcMain = electron.ipcMain;
// var Tray = require('tray');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var mb = menubar({
  index: 'file://' + __dirname + '/index.html',
  icon: __dirname + '/assets/IconTemplate@2x.png',
  width: 280,
  height: 480,
  resizable: false,
  'show-dock-icon': false,
  'preload-window': true,
  'transparent': true
});

mb.on('ready', function ready () {

    // mb.window.openDevTools();

    ipcMain.on('no-title', function(event, args) {
        mb.tray.setToolTip('temps');
        mb.tray.setTitle('');
        mb.tray.setImage(__dirname + '/assets/IconTemplate@2x.png')
    });

    ipcMain.on('set-title', function(event, args) {
        var temperature = Math.round(args.temperature) + '°';
        mb.tray.setToolTip(args.location + ' - ' + temperature);
        mb.tray.setTitle(temperature);
        mb.tray.setImage(__dirname + '/assets/icons/' + args.icon + '@2x.png')
    });

    ipcMain.on('close', function(event, args) {
        app.quit();
    });

    mb.window.on('will-navigate', function(e, url) {
        e.preventDefault();
        electron.shell.openExternal(url);
    });
});

mb.on('show', function show () {
    mb.window.webContents.send('show');
});

var appLauncher = new AutoLaunch({
    name: 'temps'
});

appLauncher.isEnabled().then(function(enabled){
    if(enabled) return;
    return appLauncher.enable()
}).then(function(err){

});

appLauncher.enable();