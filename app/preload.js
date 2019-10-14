const { ipcRenderer,remote } = require('electron');
const spawn = require('child_process').spawn;
const {dialog} = remote;
const path = require('path');
const os = require('os');
const fs = require('fs');
const accesscmd = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'),'accesscmd/AccessExport.exe');
const convertcmd = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'),'accesscmd/Convert.exe');
const tmpDir = path.join(os.tmpdir(),'actojs/');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

window.remote = {
    process : remote.process,
    openFile : (cb)=>{
        // let win  = ipcRenderer.sendSync('getMainWindow','');
        console.log(dialog.showOpenDialog(remote.getCurrentWindow(),{
            title:'Choose file', properties: ['openFile'],
            filters:[
                { name: 'Access', extensions: ['mdb', 'acdb'] }
            ]
        },cb));
    },
    openDirectory: (cb)=>{
        // let win  = ipcRenderer.sendSync('getMainWindow','');
        // console.log(dialog.showSaveDialog(win,{title:'choose directory'},cb));
        console.log(dialog.showOpenDialog(remote.getCurrentWindow(),{title:'Choose directory', properties: ['openDirectory']},cb));
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
    exportAccess: (file,wfile,exportDir,cb)=>{
        window.remote.clearTmpDir();
        let AccessExport = spawn(accesscmd,['-f',file,'-w',wfile,'-d',tmpDir]);
        AccessExport.stdout.on('data', (data) => {
            cb(data.toString());
        });
        AccessExport.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        AccessExport.on('exit',()=>{
            // cb('done',true);
            AccessExport.kill();
            setTimeout(()=>{window.remote.convert(exportDir,cb);},1000);
        });
    },
    exportSelected: (file,wfile,exportDir,filter,cb)=>{
        window.remote.clearTmpDir();

        let AccessExport = spawn(accesscmd,['-f',file,'-w',wfile,'-d',tmpDir,'--filter',filter.join(',')]);
        AccessExport.stdout.on('data', (data) => {
            cb(data.toString());
        });
        AccessExport.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        AccessExport.on('error', (data) => {
            console.log(`error: ${data}`);
        });
        AccessExport.on('close',()=>{
            console.log('export close');

            // cb('done',true);
        });
        AccessExport.on('exit',()=>{
            console.log('export exit');
            AccessExport.kill();
            setTimeout(()=>{window.remote.convert(exportDir,cb);},1000);
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