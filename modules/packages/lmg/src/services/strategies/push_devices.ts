import { WsService } from "../WsService";
import { getEmptyCacheItem, convertstarttime } from "../utils";
import { IDevice } from "../types";

interface IData {
    name: "push_devices"
    data: IDevice[]
}

export function push_devices(this: WsService, received_msg: IData) {
    const { Working, Stopped, Offline, OfflineStopped } = this.BedStatus

    const { datacache } = this
    var devlist = received_msg.data;
    for (var i in devlist) {
        var devdata = devlist[i];
        if (!devdata) continue;
        for (let bi in devdata.beds) {
            const bedData = devdata.beds[bi]
            const { is_include_tocozero, is_include_volume, doc_id } = bedData
            var unitId = this.getUnitId(devdata.device_no, bedData.bed_no);
            const old = datacache.get(unitId)

            if (!old || (old.docid !== doc_id)) {
                const item = getEmptyCacheItem({ is_include_tocozero, is_include_volume })

                item.deviceType = devdata.device_type

                datacache.set(unitId, item);
                item.docid = doc_id;
                this.convertdocid(unitId, doc_id)
                // if (doc_id) {
                //     let vt = doc_id.split('_');
                //     if (vt.length > 2) {
                //         item.starttime = convertstarttime(vt[2]);
                //     }
                // }


                if (devdata.beds[bi].is_working == 0) {
                    datacache.get(unitId).status = Working;
                } else if (devdata.beds[bi].is_working == 1) {
                    datacache.get(unitId).status = Stopped;
                } else if (devdata.beds[bi].is_working == 2) {
                    datacache.get(unitId).status = Offline;
                } else {
                    datacache.get(unitId).status = OfflineStopped;
                }
                //debugger
                if (devdata.beds[bi].pregnancy) {
                    datacache.get(unitId).pregnancy = JSON.parse(devdata.beds[bi].pregnancy);
                }
                if (devdata.beds[bi].fetalposition) {
                    datacache.get(unitId).fetalposition = JSON.parse(devdata.beds[bi].fetalposition);
                }
                datacache.get(unitId).fetal_num = devdata.beds[bi].fetal_num;
                for (let fetal = 0; fetal < devdata.beds[bi].fetal_num; fetal++) {
                    datacache.get(unitId).fhr[fetal] = [];
                }
                if (devdata.beds[bi].is_include_mother)
                    datacache.get(unitId).ismulti = true;
            }
        }
    }
    this.isReady && this.refresh()
    this.connectResolve(datacache)
    this.emit('read', datacache)
    this.isReady = true
}