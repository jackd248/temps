'use strict'

const electron = require('electron')
const app = electron.app
const globalShortcut = electron.globalShortcut
const AutoLaunch = require('auto-launch')
const menubar = require('menubar')
const Menu = electron.Menu
const dialog = electron.dialog
const ipcMain = electron.ipcMain
const shell = electron.shell
const superagent = require('superagent')
const semver = require('semver')
const config = require('./../package.json')
const path = require('path')

let autoLaunch = true

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', function () {
    // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

const mb = menubar({
  index: path.join('file://', __dirname, '/../index.html'),
  icon: path.join(__dirname, '/../assets/IconTemplate.png'),
  width: 580,
  height: 480,
  resizable: false,
  'show-dock-icon': false,
  'preload-window': true,
  'transparent': true
})

mb.on('ready', function ready () {
  autoUpdater()

    // ToDo: Not working anymore with electron 1.4
    // mb.window.openDevTools();

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    // Register a shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+Shift+W', function () {
    if (mb.window.isVisible()) {
      mb.window.hide()
    } else {
      mb.window.show()
    }
  })

  if (!ret) {
    console.log('registration failed')
  }

  ipcMain.on('no-title', function (event, args) {
    mb.tray.setToolTip('temps')
    mb.tray.setTitle('')
    if (process.platform === 'darwin') {
      mb.tray.setImage(path.join(__dirname, '/../assets/IconTemplate.png'))
    } else {
      mb.tray.setImage(path.join(__dirname, '/../assets/icons/01dW.png'))
    }
  })

  ipcMain.on('set-title', function (event, args) {
    const temperature = Math.round(args.temperature) + '°'
    mb.tray.setToolTip(args.location + ' - ' + temperature)
    mb.tray.setTitle(temperature)
    if (process.platform === 'darwin') {
      mb.tray.setImage(path.join(__dirname, '/../assets/icons', args.icon + 'Template.png'))
    } else {
      mb.tray.setImage(path.join(__dirname, '/../assets/icons', args.icon + 'W.png'))
    }
  })

  ipcMain.on('close', function (event, args) {
    app.quit()
  })

  ipcMain.on('will-navigate', function (event, args) {
    const url = args.url
    electron.shell.openExternal(url)
  })

  ipcMain.on('auto-launch', function (event, args) {
    // ToDo: appLauncher.isEnabled() not working for now
    // console.log(appLauncher.isEnabled());
    if (autoLaunch) {
      appLauncher.disable()
      autoLaunch = false
      console.log('disable auto-launch')
    } else {
      appLauncher.enable()
      autoLaunch = true
      console.log('enable auto-launch')
    }
  })

    // ToDo: open links in external browser
    // mb.on('will-navigate', function(e, url) {
    //     console.log('navigate');
    //     e.preventDefault();
    //     electron.shell.openExternal(url);
    // });
})

mb.on('show', function show () {
  mb.window.webContents.send('show')
})

const appLauncher = new AutoLaunch({
  name: 'temps'
})

appLauncher.isEnabled().then(function (enabled) {
  if (enabled) return
  return appLauncher.enable()
}).then(function (err) {
  console.log(err)
})

appLauncher.enable()

// Menu template and shortcuts
const template = [{
  label: 'Temps',
  submenu: [
    { label: 'About Temps', selector: 'orderFrontStandardAboutPanel:' },
    { type: 'separator' },
    { label: 'Quit', accelerator: 'Command+Q', click: function () { app.quit() } }
  ]},
  {
    label: 'Edit',
    submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
        { type: 'separator' },
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
    ]}, {
      label: 'Actions',
      submenu: [
        { label: 'Details', accelerator: 'CmdOrCtrl+D', click: function (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.send('toggle-details') } },
        { label: 'Settings', accelerator: 'CmdOrCtrl+S', click: function (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.send('toggle-settings') } },
        { type: 'separator' },
        { label: 'Reload Data', accelerator: 'CmdOrCtrl+E', click: function (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.send('reload-data') } },
        { label: 'Favorite City', accelerator: 'CmdOrCtrl+F', click: function (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.send('favorite-city') } },
        { label: 'Randomn City', accelerator: 'CmdOrCtrl+W', click: function (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.send('random-city') } },
        { label: 'Geolocation', accelerator: 'CmdOrCtrl+G', click: function (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.send('geolocation') } }
      ]
    }
]

const autoUpdater = function () {
  superagent
      .get('https://raw.githubusercontent.com/jackd248/temps/master/package.json')
      .end(function (err, res) {
        if (err || !res.ok) {
          console.log(err)
        } else {
          try {
            const newVersion = JSON.parse(res.text).version
            const oldVersion = config.version
            if (semver.gt(newVersion, oldVersion)) {
              const confirm = dialog.showMessageBox({
                type: 'info',
                message: 'A new version ' + newVersion + ' of Temps is available.',
                detail: 'Do you want to download it now?',
                buttons: ['Yes', 'No']
              })
              if (confirm === 0) {
                shell.openExternal('https://jackd248.github.io/temps/#download')
              }
            }
          } catch (err) {
            console.log(err)
          }
        }
      })
}
