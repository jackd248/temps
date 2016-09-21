'use strict';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var globalShortcut = electron.globalShortcut;
var AutoLaunch = require('auto-launch');
var menubar = require('menubar');
var Menu = electron.Menu;
// var ipc = require('ipc');
var ipcMain = electron.ipcMain;
var Tray = electron.Tray;

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

app.on('will-quit', function() {

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
});

var mb = menubar({
  index: 'file://' + __dirname + '/index.html',
  icon: __dirname + '/assets/IconTemplate.png',
  width: 280,
  height: 480,
  resizable: false,
  'show-dock-icon': false,
  'preload-window': true,
  'transparent': true
});

mb.on('ready', function ready () {

    // mb.window.openDevTools();

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    // Register a shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+Shift+W', function() {
        if (mb.window.isVisible()) {
            mb.window.hide();
        } else {
            mb.window.show();
        }
    });

    if (!ret) {
        console.log('registration failed')
    }

    // Check whether a shortcut is registered.
    console.log(globalShortcut.isRegistered('CommandOrControl+Shift+W'));

    ipcMain.on('no-title', function(event, args) {
        mb.tray.setToolTip('temps');
        mb.tray.setTitle('');
        mb.tray.setImage(__dirname + '/assets/IconTemplate.png')
    });

    ipcMain.on('set-title', function(event, args) {
        var temperature = Math.round(args.temperature) + '°';
        mb.tray.setToolTip(args.location + ' - ' + temperature);
        mb.tray.setTitle(temperature);
        if (process.platform === 'darwin') {
            mb.tray.setImage(__dirname + '/assets/icons/' + args.icon + 'Template.png')
        } else {
            mb.tray.setImage(__dirname + '/assets/icons/' + args.icon + '.png')
        }
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

var template = [{
    label: "Temps",
    submenu: [
        { label: "About Temps", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
        { type: "separator" },
        {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click (item, focusedWindow) {
                if (focusedWindow) focusedWindow.reload()
            }
        },
        {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click (item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.toggleDevTools()
            }
        }
    ]},
];