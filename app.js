'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
//app.on('ready', function() {
  // Create the browser window.

  // mainWindow = new BrowserWindow({width: 280, height: 500, resizable: false, titleBarStyle: 'hidden'});

  // and load the index.html of the app.
  // mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
//   mainWindow.on('closed', function() {
//     // Dereference the window object, usually you would store windows
//     // in an array if your app supports multi windows, this is the time
//     // when you should delete the corresponding element.
//     mainWindow = null;
//   });
// });


var menubar = require('menubar');

var mb = menubar({
  index: 'file://' + __dirname + '/index.html',
  icon: __dirname + '/IconTemplate.png',
  width: 280,
  height: 465,
  resizable: false,
  'show-dock-icon': false,
  'preload-window': true,
  'transparent': true
});

mb.on('ready', function ready () {
  console.log('app is ready');
  // your app code here
});

var AutoLaunch = require('auto-launch');

var appLauncher = new AutoLaunch({
    name: 'My NW.js or Electron app'
});

appLauncher.isEnabled().then(function(enabled){
    if(enabled) return;
    return appLauncher.enable()
}).then(function(err){

});

appLauncher.enable();