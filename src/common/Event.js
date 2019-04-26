let eventList = {};

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
}

const MoEvent = {
    on:_on,
    off:_off,
    emit:_emit
};

export default MoEvent;