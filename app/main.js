// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let debug = process.argv[2] === 'debug';
let appDebug = process.argv[2] === 'appdebug';

let appPkg = require("../package.json");
//子进程
let sub_process;

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
                    { role: 'about',label:'关于' },
                    { type: 'separator' },
                    { role: 'services' ,label:'服务' },
                    { type: 'separator' },
                    { role: 'hide' ,label:'隐藏' },
                    { role: 'hideothers',label:'隐藏其它' },
                    { role: 'unhide' ,label:'显示所有' },
                    { type: 'separator' },
                    { role: 'quit',label:'退出 '+ app.getName() }
                ]
            }] : []),
            // { role: 'fileMenu' }
            {
                label: '文件',
                submenu: [
                    isMac ? { label:'关闭窗口',role: 'close' } : { label:'关闭窗口',role: 'quit' }
                ]
            },
            // { role: 'editMenu' }
            {
                label: '编辑',
                submenu: [
                    { role: 'undo' ,label:'撤销'},
                    { role: 'redo' ,label:'复原'},
                    { type: 'separator' },
                    { role: 'cut' ,label:'剪切'},
                    { role: 'copy' ,label:'复制'},
                    { role: 'paste',label:'粘贴' }
                ]
            },
            ...(debug || appDebug ? [{
                label: '视图',
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
                label: '窗口',
                submenu: [
                    { role: 'minimize' ,label:'最小化'},
                    { role: 'zoom' ,label:'缩放'},
                    ...(isMac ? [
                        { type: 'separator' },
                        { role: 'front' ,label:'前置所有窗口'},
                        { type: 'separator' },
                        { role: 'window' ,label:'窗口'}
                    ] : [
                        { role: 'close' ,label:'关闭窗口'}
                    ])
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu)
    } else {
        Menu.setApplicationMenu(null)
    }

    !debug && runCmd((text)=>{
        console.log(text);
    });
}
function runCmd(cb) {
    const spawn = require('child_process').spawn;
    const path = require('path');
    const programName = process.platform === 'win32' ? 'moogo.exe':'moogo_'+process.platform;

    const program = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'),'cmd/'+programName);
    let argv = ['--cross','--config','./main.conf'];
    debug && argv.push('--debug');
    sub_process = spawn(program,argv,{
        cwd:path.dirname(program),
    });
    sub_process.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    sub_process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
    sub_process.on('error', (data) => {
        console.log(`error: ${data}`);
    });
    sub_process.on('close',(code)=>{
        console.log('export close',code);
        // cb('done',true);
    });
    sub_process.on('exit',()=>{
        // cb('done',true);
        sub_process.kill();
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

app.on('quit',function () {
    sub_process.kill();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
