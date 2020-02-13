"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function push_data_ctg(received_msg) {
    var datacache = this.datacache;
    var data = received_msg.data;
    var id = received_msg.device_no;
    var bi = received_msg.bed_no;
    var cachbi = id + '-' + bi;
    var target = datacache.get(cachbi);
    if (!target)
        return;
    if (isNaN(target.csspan)) {
        target.csspan = this.span;
    }
    for (var key in data) {
        for (var fetal = 0; fetal < target.fetal_num; fetal++) {
            if (!target.fhr[fetal]) {
                continue;
            }
            if (fetal == 0) {
                if (data[key].fhr == 0) {
                    continue;
                }
                if (target.fhr[fetal])
                    target.fhr[fetal][data[key].index] = data[key].fhr;
            }
            else if (fetal == 1) {
                if (data[key].fhr2 == 0) {
                    continue;
                }
                if (target.fhr[fetal])
                    target.fhr[fetal][data[key].index] = data[key].fhr2;
            }
            else if (fetal == 2) {
                if (data[key].fhr3 == 0) {
                    continue;
                }
                if (target.fhr[fetal])
                    target.fhr[fetal][data[key].index] = data[key].fhr3;
            }
        }
        target.toco[data[key].index] = data[key].toco;
        target.fm[data[key].index] = data[key].fm;
        if (target.start == -1) {
            target.start = data[key].index;
            target.past = data[key].index - 4800 > 0 ? data[key].index - 4800 : 0;
            target.last = target.start;
        }
        this.setcur(cachbi, data[key].index);
        for (var i = datacache.get(cachbi).start; i > datacache.get(cachbi).past; i--) {
            if (target.fhr[0] && !target.fhr[0][i]) {
                var curstamp = new Date().getTime();
                if (this.offrequest < 8 && (target.orflag || curstamp - target.timestamp > this.interval)) {
                    target.orflag = false;
                    this.offrequest += 1;
                    var dis = target.start - target.past;
                    var length = dis > 800 ? 800 : dis;
                    var startpoint = target.start - length;
                    var endpoint = target.start;
                    this.send(JSON.stringify({
                        name: "get_data_ctg",
                        data: {
                            start_index: startpoint,
                            end_index: endpoint,
                            device_no: id,
                            bed_no: bi
                        }
                    }));
                    target.timestamp = new Date().getTime();
                    break;
                }
            }
        }
        if (data[key].index - target.last < 2) {
            target.last = data[key].index;
        }
        else {
            console.log('reconnect request last:', target.last, target.index, data[key].index);
            var flag = 0;
            var sflag = 0;
            var eflag = 0;
            for (var il = target.last; il < target.index; il++) {
                if (target.fhr[0] && !target.fhr[0][il] && flag == 0) {
                    if (flag == 0) {
                        sflag = il;
                        flag = 1;
                    }
                }
                else {
                    if (flag > 0) {
                        eflag = target.index;
                        var curstamp = new Date().getTime();
                        if (this.offrequest < 8 && (target.orflag || curstamp - target.timestamp > this.interval)) {
                            target.orflag = false;
                            this.offrequest += 1;
                            this.send(JSON.stringify({
                                "name": "get_data_ctg",
                                data: {
                                    start_index: sflag,
                                    end_index: eflag,
                                    device_no: id,
                                    bed_no: bi
                                }
                            }));
                            console.log('reconnect request', sflag, eflag);
                            target.timestamp = new Date().getTime();
                        }
                        break;
                    }
                    else {
                        target.last = il;
                    }
                }
            }
            target.last = data[key].index;
        }
    }
}
exports.push_data_ctg = push_data_ctg;