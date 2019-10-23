// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let debug = process.argv[2] === 'debug';
let appDebug = process.argv[2] === 'appdebug';

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
    (debug || appDebug) && mainWindow.webContents.openDevTools();
    // mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
    if (process.platform === 'darwin') {
        let isMac = true;
        const template = [
            // { role: 'appMenu' }
            ...(isMac ? [{
                label: app.getName(),
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            }] : []),
            // { role: 'fileMenu' }
            {
                label: 'File',
                submenu: [
                    isMac ? { role: 'close' } : { role: 'quit' }
                ]
            },
            // { role: 'editMenu' }
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' }
                ]
            },
            ...(debug || appDebug ? [{
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                    { type: 'separator' },
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            }] : []),
            // { role: 'windowMenu' }
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    ...(isMac ? [
                        { type: 'separator' },
                        { role: 'front' },
                        { type: 'separator' },
                        { role: 'window' }
                    ] : [
                        { role: 'close' }
                    ])
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu)
    } else {
        Menu.setApplicationMenu(null)
    }
    runCmd(()=>{

    });
}
function runCmd(cb) {
    const spawn = require('child_process').spawn;
    const path = require('path');
    const programName = process.platform === 'windows' ? 'moogo.exe':'moogo_'+process.platform;

    const program = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'),'cmd/'+programName);

    let AccessExport = spawn(program,['--debug','--config','main.conf']);
    AccessExport.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    AccessExport.on('exit',()=>{
        // cb('done',true);
        AccessExport.kill();
        setTimeout(()=>{cb('exit')},1000);
    });
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
