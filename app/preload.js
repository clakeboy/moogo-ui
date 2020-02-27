const { ipcRenderer,remote } = require('electron');
const spawn = require('child_process').spawn;
const {dialog,Menu} = remote;
const path = require('path');
const os = require('os');
const fs = require('fs');

const tmpDir = path.join(os.tmpdir(),'actojs/');

const programName = remote.process.platform === 'windows' ? 'moogo.exe':'moogo_'+remote.process.platform;

const program = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'),'cmd/'+programName);

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

window.remote = {
    process : remote.process,
    openFile : (extList)=>{
        let extensions = extList || ['tgz'];
        // let win  = ipcRenderer.sendSync('getMainWindow','');
        return dialog.showOpenDialogSync(remote.getCurrentWindow(),{
            title:'选择文件', properties: ['openFile'],
            filters:[
                { name: 'compress', extensions: extensions }
            ]
        })
    },
    openDirectory: ()=>{
        // let win  = ipcRenderer.sendSync('getMainWindow','');
        // console.log(dialog.showSaveDialog(win,{title:'choose directory'},cb));
        return dialog.showOpenDialogSync(remote.getCurrentWindow(),{
            title:'选择目录',
            properties: ['openDirectory']
        })
    },
    getWindowList: (file,cb)=>{
        let AccessExport = spawn(accesscmd,['-f',file,'--windows']);
        let listData = [];
        AccessExport.stdout.on('data', (data) => {
            console.log(data.toString());
            listData.push(data.toString());
        });
        AccessExport.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        AccessExport.on('error', (data) => {
            console.log(`error: ${data}`);
        });
        AccessExport.on('close',(code)=>{
            console.log('export close',code);

            // cb('done',true);
        });
        AccessExport.on('exit',()=>{
            try {
                let window_list = JSON.parse(listData.join());
                cb(window_list);
            } catch(e) {
                cb(`${e.toString()}:${listData.join()}`);
            }

            AccessExport.kill();
        });
    },
    runCmd: (cb)=>{
        let AccessExport = spawn(program,[]);
        AccessExport.on('exit',()=>{
            // cb('done',true);
            AccessExport.kill();
            setTimeout(()=>{cb('exit')},1000);
        });
    },
    convert: (exportDir,cb) => {
        let AccessExport = spawn(convertcmd,['-dir',tmpDir,'-output',exportDir],{cwd:path.join(__dirname.replace('app.asar', 'app.asar.unpacked'),'accesscmd')});
        AccessExport.stdout.on('data', (data) => {
            cb(data.toString());
        });
        AccessExport.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        AccessExport.on('error', (data) => {
            console.log(`error: ${data}`);
            cb(data.toString(),true);
        });
        AccessExport.on('close',()=>{
            cb('done',true);
        });
    },
    clearTmpDir: ()=>{
        let files = [];
        if(fs.existsSync(tmpDir)){
            files = fs.readdirSync(tmpDir);
            files.forEach((file, index) => {
                let curPath = tmpDir + file;
                if(fs.statSync(curPath).isDirectory()){
                    window.remote.clearTmpDir(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            });
        }
    }
};

//global context menu

const contextMenu = Menu.buildFromTemplate([
    { role: 'cut' ,label:'剪切'},
    { role: 'copy' ,label:'复制'},
    { role: 'paste',label:'粘贴' },
]);

window.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
    contextMenu.popup({window:remote.getCurrentWindow()})
});