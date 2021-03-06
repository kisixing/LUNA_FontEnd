"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maps = ['', '2', '3'];
function get_data_ctg(received_msg) {
    var datacache = this.datacache;
    var ctgdata = received_msg.data;
    var id = received_msg.device_no;
    var bi = received_msg.bed_no;
    var cachbi = id + '-' + bi;
    if (datacache.has(cachbi)) {
        var tmpcache = datacache.get(cachbi);
        for (var key in ctgdata) {
            for (var fetal = 0; fetal < tmpcache.fetal_num; fetal++) {
                tmpcache.fhr[fetal][ctgdata[key].index] = ctgdata[key]["fhr" + maps[fetal]];
            }
            tmpcache.toco[ctgdata[key].index] = ctgdata[key].toco;
            tmpcache.fm[ctgdata[key].index] = ctgdata[key].fm;
            tmpcache.fmp[ctgdata[key].index] = ctgdata[key].fmp;
            this.setcur(cachbi, ctgdata[key].index);
        }
        tmpcache.orflag = true;
        if (this.offrequest > 0) {
            this.offrequest -= 1;
        }
    }
}
exports.get_data_ctg = get_data_ctg;
//# sourceMappingURL=get_data_ctg.js.map