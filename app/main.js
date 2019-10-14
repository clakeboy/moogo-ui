// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let debug = process.argv[2] === 'debug';

let appPkg = require("../package.json");

function createWindow() {
    const path = require('path');
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280, height: 800,
        title:'Moogo v'+appPkg.version,
        center:true,
        resizable:true,
        fullscreen:false,
        webPreferences:{
            nodeIntegration:false,
            preload:path.join(__dirname, './preload.js')
        }
    });

    // and load the index.html of the app.
    if (debug) {
        mainWindow.loadURL('http://127.0.0.1:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));
    }

    // Open the DevTools.
    debug && mainWindow.webContents.openDevTools();
    // mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
    mainWindow.setMenu(null);
}

ipcMain.on('getMainWindow',(evt,arg)=>{
    evt.returnValue = mainWindow;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
