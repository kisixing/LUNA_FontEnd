import request from "@lianmed/request";
import { event, EventEmitter } from "@lianmed/utils";
import Queue from "../Ecg/Queue";
import { handleMessage } from "./strategies";
import { BedStatus, EWsEvents, EWsStatus, ICache, TWsReqeustType } from './types';
import { convertstarttime, getEmptyCacheItem } from "./utils";
export * from './types';
export * from './useCheckNetwork';
export * from './utils';
// import pingpong from "./pingpong";

// const ANNOUNCE_INTERVAL = 1000
const SECOND = 1000
export const LIMIT_LENGTH = 4 * 3600 * 0.7




export class WsService extends EventEmitter {
    static wsStatus: typeof EWsStatus = EWsStatus
    static _this: WsService
    static EWsEvents = EWsEvents
    test_ple = false
    eventNamespace = "ws"
    isReady = false
    dirty = false
    interval: number = 10000
    RECONNECT_INTERVAL: number = 3000
    span: number = NaN
    offQueue: Queue = new Queue()
    offstart: boolean = false
    pongTimeoutId: NodeJS.Timeout = null
    log = console.log.bind(console, 'websocket')
    datacache: ICache = new Map()
    settingData: { [x: string]: string }
    socket: WebSocket
    offrequest: number
    strategies: { [x: string]: Function }
    BedStatus = BedStatus
    PENDDING_INTERVAL = SECOND * 30
    requests: { [x in TWsReqeustType]?: (value: unknown) => void } = {}
    handleMessage = handleMessage
    private _current: string[] = [];
    public get current(): string[] {
        return this._current;
    }
    public set current(value: string[]) {
        console.log('current', value)
        this._current = value;
    }
    // store = (window as any).g_app._store
    constructor(settingData?) {
        super();
        console.log('wsService', this)
        const { datacache } = this
        datacache.clean = function (key: string) {
            const target = datacache.get(key)
            datacache.set(key, Object.assign(target, getEmptyCacheItem({ id: key })))
        }
        settingData = settingData || {
            ws_url: "192.168.0.227:8084",
            area_devices: ''
        }
        if (WsService._this) {
            return WsService._this;
        }
        WsService._this = this;
        this.settingData = settingData
        this.dataLimit()
        event.on('suit:keepData', this.dataLimit.bind(this))
    }

    getUnitId(device_no: number | string, bed_no: number | string) {
        return `${device_no}-${bed_no}`
    }
    getCacheItem(data: { device_no?: any, bed_no?: any, [x: string]: any } | string) {
        const { datacache } = this
        let device_no, bed_no
        if (typeof data === 'string') {
            const arr = data.split('-')
            device_no = Number(arr[0]) || null
            bed_no = Number(arr[1]) || null
        } else {
            device_no = data.device_no
            bed_no = data.bed_no
        }
        const key = this.getUnitId(device_no, bed_no)
        const target = datacache.get(key)
        return target || null
    }
    pongIndex = 0
    sendHeard() {
        this.send(JSON.stringify({
            data: { index: this.pongIndex, time: +new Date() },
            name: "heard"
        }))
        this.pongIndex++
    }
    t = +new Date()
    pong() {
        const t = +new Date()
        t - this.t > this.PENDDING_INTERVAL && this.pongFailed()

        this.t = t

        let count = 0
        const MS = 3000
        this.pongTimeoutId ? clearInterval(this.pongTimeoutId) : this.sendHeard()
        this.emit(EWsEvents.pong, true)
        this.pongTimeoutId = setInterval(() => {
            (count > 2) && this.pongFailed()
            this.sendHeard()
            count++
        }, MS)
    }
    pongFailed() {
        // Array.from(this.datacache.values()).forEach(_=>{
        //     _.status = null
        // })
        this.emit(EWsEvents.pong, false)

        this.socket.close()
    }
    refreshInterval = 100
    refreshTimeout = null
    refresh(name = 'default') {
        if (this.refreshTimeout) {
            return
        }
        this.refreshTimeout = setTimeout(() => {
            this.emit('explode', new Map(this.datacache))
            this.refreshTimeout = null
        }, this.refreshInterval);
    }
    getDatacache(): Promise<ICache> {
        if (this.isReady) {
            return Promise.resolve(this.datacache)
        } else {
            return new Promise((resolve) => {
                this.once('read', data => {
                    resolve(data)
                })
            })
        }
    }
    send(message: string) {
        const { log, socket } = this
        if (socket.readyState == WebSocket.OPEN) {
            socket.send(message);
        } else {
            log('The socket is not open.');
        }
    }
    sendAsync(type: TWsReqeustType, message: string) {
        return new Promise<{ res: number, [x: string]: any }>((res, rej) => {
            this.send(message)
            this.requests[type] = res
            setTimeout(() => {
                this.requests[type] = null
            }, 5000);
        })
    }
    startwork(device_no: string, bed_no: string) {
        const message = `{"name":"start_work","data":{"device_no":${device_no},"bed_no":${bed_no}}}`;
        event.emit('start_work', this.getUnitId(device_no, bed_no))
        this.send(message);
    }
    endwork(device_no: string, bed_no: string) {
        const message = `{"name":"end_work","data":{"device_no":${device_no},"bed_no":${bed_no}}}`;
        this.send(message);
    }
    /**分配探头**/
    alloc(device_no, bed_no) {
        const command = `{"name": "allot_probe","device_no": ${device_no},"bed_no": ${bed_no}}`
        return this.sendAsync('allot_probe', command);
    }
    /**取消探头分配**/
    cancelalloc(device_no, bed_no) {
        const command = `{"name": "release_probe","device_no": ${device_no},"bed_no": ${bed_no}}`
        return this.sendAsync('release_probe', command);
    }
    //申请多胞胎
    add_fhr(device_no, bed_no, fetal_num) {
        const command = `{"name": "add_more_fhr_probe","device_no": ${device_no},"bed_no": ${bed_no},"data":{"fetal_num": ${fetal_num}}}`
        return this.sendAsync('add_more_fhr_probe', command);
    }
    //添加宫缩
    add_toco(device_no, bed_no) {
        const command = `{"name": "add_toco_probe","device_no": ${device_no},"bed_no": ${bed_no}}`
        return this.sendAsync('add_toco_probe', command);
    }
    setTocozero(device_no: number, bed_no: number) {
        const msg = JSON.stringify({
            name: "toco_zero",
            device_no,
            bed_no
        })
        this.send(msg)
    }
    replace_probe(device_no: number, bed_no: number,) {
        const target = this.getCacheItem({ device_no, bed_no })
        const command = JSON.stringify({
            name: "replace_probe",
            device_no,
            bed_no,
            data: target.replaceProbeTipData
        })
        target.replaceProbeTipData = null
        return this.sendAsync('replace_probe', command);
    }
    add_probe(device_no: number, bed_no: number,) {
        const target = this.getCacheItem({ device_no, bed_no })
        const command = JSON.stringify({
            name: "add_probe",
            device_no,
            bed_no,
            data: target.addProbeTipData
        })
        target.addProbeTipData = null
        return this.send(command);
    }
    delay_endwork(device_no: number, bed_no: number, delay_time: number) {
        const target = this.getCacheItem({ device_no, bed_no })
        const command = JSON.stringify({
            name: "delay_endwork",
            device_no,
            bed_no,
            data: { delay_time }
        })
        target.addProbeTipData = null
        return this.send(command);
    }
    sendFocus(id: string) {
        if (!this.settingData.f0pro) return
        const target = this.getCacheItem(id)
        const message = {
            "name": "focus_on_bed",
            "device_no": target && target.device_no,
            "bed_no": target && target.bed_no
        }

        this.send(JSON.stringify(message))
    }
    //0单次测量开始，1 单次测量停止，2 定时测量，3 关闭定时测量
    sendBloodPressure(id: string, isAuto: 0 | 1 | 2 | 3, time = 0) {
        const target = this.getCacheItem(id)
        const message = {
            name: "blood_pressure",
            device_no: target && target.device_no,
            bed_no: target && target.bed_no,
            time,
            isAuto
        }

        this.send(JSON.stringify(message))
    }
    _emit(name: string, ...value: any[]) {
        event.emit(`WsService:${name}`, ...value)
    }
    subscribeList: string[] = []
    subscribe(str: string[]) {
        if (this.subscribeList && str.every(_ => this.subscribeList.includes(_)) && this.subscribeList.every(_ => str.includes(_))) {
            return
        }
        // this.subscribeList = str
        // this.send(JSON.stringify(
        //     {
        //         name: "area_devices",
        //         data: str.join(',')
        //     }
        // ))
    }

    sendCommon(name: string, device_no: number, bed_no: number) {
        const msg = JSON.stringify({
            name,
            device_no,
            bed_no
        })
        this.send(msg)
    }
    getVolume(device_no: number, bed_no: number) {
        const msg = JSON.stringify({
            name: "getVolume",
            device_no,
            bed_no
        })
        this.send(msg)
    }
    change_volume(device_no: number, bed_no: number, vol: number) {
        const msg = JSON.stringify({
            name: "change_volume",
            device_no,
            bed_no,
            data: {
                vol,
            }
        })
        this.send(msg)
    }
    mute_volume(device_no: number, bed_no: number, fetel_no: number, isMute: number) {
        const msg = JSON.stringify({
            name: "mute_volume",
            device_no,
            bed_no,
            data: {
                fetel_no,
                isMute,
            }

        })
        this.send(msg)
    }
    connectResolve: (value: any) => void
    convertdocid(unitId: string, doc_id: string) {
        const target = this.datacache.get(unitId)
        target.docid = doc_id;
        if (doc_id != '') {
            let vt = doc_id.split('_');
            if (vt.length > 2) {
                target.starttime = convertstarttime(vt[2]);
            }
        }
    }
    setcur(id: string, value: number) {
        const { datacache } = this

        if (value < datacache.get(id).start) {
            datacache.get(id).start = value;
        } else if (value >= datacache.get(id).index) {

            datacache.get(id).index = value;
            // if (value > 20 * 240) {
            //     announce(id)
            // }
        }
        if (value > datacache.get(id).last) {
            //datacache.get(id).last = value;
        }
    }
    getoffline(queue: Queue, doc_id: string, offlineend: number, offstart: boolean) {
        const { datacache } = this

        request.get(`/ctg-exams-data/${doc_id}`).then(responseData => {
            let vt = doc_id.split('_');
            let dbid = vt[0] + '-' + vt[1];
            console.log(doc_id, offlineend, responseData, datacache.get(dbid).past);
            if (responseData) {
                this.initfhrdata(responseData, datacache.get(dbid), offlineend, queue, offstart);
            }
            // datacache.get(dbid).start = 0;
        })
    }



    initfhrdata(data, datacache, offindex, queue, offstart) {
        Object.keys(data).forEach(key => {
            let oridata = data[key] as string;
            if (!oridata) {
                return;
            }
            for (let i = 0; i < offindex; i++) {
                let hexBits = oridata.substring(0, 2);
                let data_to_push = parseInt(hexBits, 16);
                if (key === 'fhr1') {
                    datacache.fhr[0][i] = data_to_push;
                } else if (key === 'fhr2') {
                    if (datacache.fhr[1])
                        datacache.fhr[1][i] = data_to_push;
                } else if (key === 'fhr3') {
                    if (datacache.fhr[2])
                        datacache.fhr[2][i] = data_to_push;
                } else if (key === 'toco') {
                    datacache.toco[i] = data_to_push;
                } else if (key === "fm") {
                    datacache.fm[i] = data_to_push;
                }
                oridata = oridata.substring(2, oridata.length);
            }
        });
        this.starttask(queue, offstart);
    }

    starttask(queue, offstart) {
        if (!queue.IsEmpty()) {
            offstart = true;
            let obj = queue.DeQueue();
            this.getoffline(queue, obj.docid, obj.length, offstart);
        }
        else {
            offstart = false;
        }
    }
    connect = () => {


        return new Promise<ICache>(res => {
            const { datacache, settingData } = this
            const { ws_url } = settingData
            if (!ws_url) return Promise.reject('错误的ws_url')
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                return
            }
            this.socket = new WebSocket(
                `ws://${ws_url}/?clientType=ctg-suit&token=eyJ1c2VybmFtZSI6ICJhZG1pbiIsInBhc3N3b3JkIjogImFkbWluIn0=`,
            );
            const socket = this.socket;
            this.connectResolve = res
            socket.onerror = () => {
                console.log('错误')
            };

            socket.onopen = (event) => {
                this.offrequest = 0;
                // this.dirty && location.reload()
                this.pong()

                // this.settingData.area_devices && this.send(JSON.stringify({
                //     name: "area_devices",
                //     data: this.settingData.area_devices
                // }))
            };
            socket.onclose = (event) => {
                setTimeout(() => {
                    this.dirty = true
                    this.connect()
                }, this.RECONNECT_INTERVAL);
            };
            // 接收服务端数据时触发事件
            socket.onmessage = (msg) => {
                // if (!this.subscribeList && msg.data.includes('push_data_')) {
                //     return
                // }
                this.pong()
                let received_msg
                try {
                    received_msg = JSON.parse(msg.data);
                } catch (error) {
                    console.log('json parse error', error)
                }
                if (received_msg) {
                    const mesName = received_msg.name
                    this.handleMessage(mesName, received_msg)
                }
            };
            window['aa'] = (id = '1001-2') => {
                const target = WsService._this.getCacheItem(id)
                console.log('goit');
                var received_msg = {
                    "name": "update_status",


                    data: {
                        doc_id: "28_1_201013075145",
                        event_alarm_id: "3",
                        event_alarm_status: "2",
                        fetal_num: 1,
                        fetalposition: "{}",
                        is_include_mother: true,
                        is_include_tocozero: false,
                        is_include_volume: true,
                        is_working: 0,
                        pregnancy: "",
                        "device_no": target.device_no,
                        "bed_no": target.bed_no,
                    }

                }
                const mesName = received_msg.name
                this.handleMessage(mesName, received_msg)
            }
            return [datacache];
        });
    };
    dataLimitTimeoutId: NodeJS.Timeout
    dataLimit() {
        if (this.dataLimitTimeoutId) {
            clearTimeout(this.dataLimitTimeoutId)
        }
        this.dataLimitTimeoutId = setTimeout(() => {
            Array.from(this.datacache.values()).forEach(target => {
                const len = target.index - target.past
                const diff = len - LIMIT_LENGTH

                if (diff > 0) {
                    for (let fetal = 0; fetal < target.fetal_num; fetal++) {

                        if (target.fhr[fetal]) {
                            for (let i = 0; i < diff; i++) {
                                delete target.fhr[fetal][i]
                            }
                        };
                    }
                    for (let i = 0; i < diff; i++) {
                        delete target.toco[i]
                        delete target.fm[i]
                    }
                    target.past = target.index - LIMIT_LENGTH
                }
            });
            this.dataLimit()
        }, 60 * 1000 * 5)
    }
}
// const announce = throttle((text) => {
//     if (sp(text)) {
//         event.emit('bed:announcer', `${text}`)
//     }
// }, ANNOUNCE_INTERVAL)

// let timeoutKey = null
// let spObj = {}
// function sp(key: string) {
//     if (!timeoutKey) {
//         timeoutKey = setTimeout(() => {
//             spObj = {}
//             timeoutKey = null
//         }, SECOND * 60 * 20);
//     }
//     const old = spObj[key]
//     return old ? false : (spObj[key] = true)
// }

