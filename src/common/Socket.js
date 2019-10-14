import {CKSocket} from '@clake/ckio';

let _socket;

let eventList = {};

let evt_types = {
    CLONE_COLLECTION:'clone_coll',
    BACKUP_DATABASE:'backup',
};

function _init(url,opt) {
    _socket = new CKSocket(url||window.__URL__,opt||{});
    _socket.open();
}

function _emit(evt_type, args, cb) {
    let evt_list = eventList[evt_type];
    if (evt_list instanceof Array) {
        evt_list.forEach((item)=>{
            item(evt_type, args, cb);
        })
    }
}

function _on(evt_type, fn) {
    if (!(eventList[evt_type] instanceof Array)) {
        eventList[evt_type] = [];
    }
    eventList[evt_type].push(fn);

    if (eventList[evt_type].length === 1) {
        _socket.on(evt_type,_on_socket(evt_type));
    }
}

function _off(evt_type, fn) {
    if (!(eventList[evt_type] instanceof Array)) {
        return
    }

    let evt_list = eventList[evt_type];
    let idx = evt_list.indexOf(fn);

    if (idx !== -1) {
        evt_list.splice(idx,1);
    }

    if (evt_list.length <= 0) {
        _socket.off(evt_type);
    }
}
//生成一个socket监听方法
function _on_socket(evt_type) {
    return (data) => {
        _emit(evt_type,data)
    }
}

const Socket = {
    init:_init,
    on:_on,
    off:_off,
    emit:(evt_name,data,cb)=>{
        _socket.emit(evt_name,JSON.stringify(data),cb);
    },
    evtTypes:evt_types,
};

export default Socket;