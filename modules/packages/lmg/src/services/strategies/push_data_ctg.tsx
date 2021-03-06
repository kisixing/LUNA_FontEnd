import { WsService } from "../WsService";
import { ICacheItem } from "../types";
// import { event } from "@lianmed/utils";

interface ICtgData {
    fhr: number
    fhr2: number
    fhr3: number
    toco: number
    fm: number
    fmp: number
    index: number
}
interface IData {
    bed_no: number
    data: ICtgData[]
    device_no: number
    name: "push_data_ctg"
}



export function pushData(target: ICacheItem, data: ICtgData) {

    const { index, toco, fm, fmp } = data
    for (let fetal = 0; fetal < target.fetal_num; fetal++) {
        if (!target.fhr[fetal]) {
            continue;
        }
        const fhrKey = `fhr${fetal > 0 ? fetal + 1 : ''}`
        const value = data[fhrKey]
        if (value == 0) continue;
 
        target.fhr[fetal][data.index] = value
    }
    target.toco[index] = toco;
    target.fm[index] = fm;
    target.fmp[index] = fmp
}

export function push_data_ctg(this: WsService, received_msg: IData) {
    const { datacache } = this




    //    // alarm
    //    const { alarm_high = 160, alarm_low = 110, alarm_delay = 0 } = this.settingData

    //    const delayCount = alarm_delay * 4

    //    const alarmKey = `${fhrKey}_alarm_count`
    //    target[alarmKey] = target[alarmKey] || []
    //    // 荣总：胎心率最大的计算范围是29~241
    //    if (value <= 241 && value > alarm_high) {
    //        target[alarmKey].push(1)
    //    } else if (value < alarm_low && value >= 29) {
    //        target[alarmKey].push(-1)
    //    } else {
    //        target[alarmKey] = []
    //    }
    //    const isHight = target[alarmKey].filter(_ => _ === 1).length > delayCount
    //    const isLow = target[alarmKey].filter(_ => _ === -1).length > delayCount

    //    if (isHight) {
    //        event.emit('item:alarm', target.id, 2, '心率过高')
    //    }
    //    if (isLow) {
    //        event.emit('item:alarm', target.id, 2, '心率过低')
    //    }

    //    // alarm



    //TODO 解析应用层数据包
    var data = received_msg.data;
    var id = received_msg.device_no;
    var bi = received_msg.bed_no;
    var cachbi = id + '-' + bi;
    var target = datacache.get(cachbi);

    if (!target) return


    if (isNaN(target.csspan)) {
        target.csspan = this.span;
    }
    for (let key in data) {
        pushData.call(this, target, data[key])
        if (target.start == -1) {
            target.start = data[key].index;
            target.past = data[key].index - 4800 > 0 ? data[key].index - 4800 : 0;
            // if (tmpcache.past > 0) {
            //     this.offQueue.EnQueue({"docid":datacache.get(cachbi).docid,"length":tmpcache.past})
            //     //this.getoffline(datacache.get(cachbi).docid, tmpcache.past);
            //     if(!this.offstart){
            //         starttask(this.offQueue,this.offstart);
            //     }
            // }
            target.last = target.start;
        }
        this.setcur(cachbi, data[key].index);
        for (let i = datacache.get(cachbi).start; i > datacache.get(cachbi).past; i--) {
            if (target.fhr[0] && !target.fhr[0][i]) {
                var curstamp = new Date().getTime();
                if (this.offrequest < 8 && (target.orflag || curstamp - target.timestamp > this.interval)) {
                    target.orflag = false;
                    this.offrequest += 1;
                    var dis = target.start - target.past;
                    var length = dis > 800 ? 800 : dis;
                    var startpoint = target.start - length;
                    var endpoint = target.start;
                    //反向取值
                    this.send(JSON.stringify(
                        {
                            name: "get_data_ctg",
                            data: {
                                start_index: startpoint,
                                end_index: endpoint,
                                device_no: id,
                                bed_no: bi
                            }
                        }
                    ))


                    target.timestamp = new Date().getTime();
                    break;
                }
            }
        }
        // 更新last index
        if (data[key].index - target.last < 2) {
            target.last = data[key].index;
        } else {
            //判断 是否有缺失
            //kisi 2019-10-19 不再请求离线
            //kisi 2019-12-02 静默重连后数据恢复处理启用                                   
            console.log('reconnect request last:', target.last, target.index, data[key].index);
            var flag = 0;
            var sflag = 0;
            var eflag = 0;
            for (let il = target.last; il < target.index; il++) {
                if (target.fhr[0] && !target.fhr[0][il] && flag == 0) {
                    if (flag == 0) {
                        sflag = il;
                        flag = 1;
                    }
                } else {
                    if (flag > 0) {
                        eflag = target.index;
                        var curstamp = new Date().getTime();
                        if (this.offrequest < 8 && (target.orflag || curstamp - target.timestamp > this.interval)) {
                            target.orflag = false;
                            this.offrequest += 1;
                            this.send(
                                JSON.stringify({
                                    "name": "get_data_ctg",
                                    data: {
                                        start_index: sflag,
                                        end_index: eflag,
                                        device_no: id,
                                        bed_no: bi
                                    }
                                })
                            );


                            console.log('reconnect request', sflag, eflag);
                            target.timestamp = new Date().getTime();
                        }
                        break;
                    } else {
                        target.last = il;
                    }
                }
            }
            target.last = data[key].index;
        }
    }
}

