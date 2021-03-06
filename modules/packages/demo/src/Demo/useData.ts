const datacache: Map<any, any> = new Map();
const interval: number = 30000;
export default datacache;
//export default ecgqcache;
const defaultUrl =
  'ws://localhost:8084/websocket/?request=e2lkOjE7cmlkOjI2O3Rva2VuOiI0MzYwNjgxMWM3MzA1Y2NjNmFiYjJiZTExNjU3OWJmZCJ9';
export class Queue {
  B: any = [];
  capacity = 512;

  EnQueue(C: any) {
    if (C == null) {
      return -1;
    }
    if (this.B.length >= this.capacity) {
      this.B.shift();
    }
    this.B.push(C);
  }
  DeQueue() {
    if (this.B.length == 0) {
      return null;
    } else {
      return this.B.shift();
    }
  }
  GetSize() {
    return this.B.length;
  }
  GetHead() {
    if (this.B.length == 0) {
      return null;
    } else {
      return this.B[0];
    }
  }
  MakeEmpty() {
    this.B.length = 0;
  }
  IsEmpty() {
    if (this.B.length == 0) {
      return true;
    } else {
      return false;
    }
  }
}
export const useData = (setDevice: any, url = defaultUrl): Promise<Map<any, any>> => {
  // event.emit
  var socket: WebSocket;
  var offrequest: number;
  socket = new WebSocket(url);

  return new Promise(res => {
    socket.onerror = () => {
      res(datacache);
    };
    socket.onopen = function (event) {
      offrequest = 0;
    };
    socket.onclose = function (event) {
      console.log('websocket 关闭了');
    };
    // 接收服务端数据时触发事件
    socket.onmessage = function (msg) {
      var received_msg = JSON.parse(msg.data);
      if (received_msg) {
        //showMessage(received_msg);
        if (received_msg.name == 'push_devices') {
          var devlist = received_msg.data;
          for (var i in devlist) {
            var devdata = devlist[i];
            if (!devdata) continue;
            for (let bi in devdata.beds) {
              var cachebi = Number(devdata['device_no']) + '-' + Number(devdata.beds[bi].bed_no);
              if (!datacache.has(cachebi)) {
                datacache.set(cachebi, {
                  fhr: [],
                  toco: [],
                  fm: [],
                  index: 0,
                  length: 0,
                  start: -1,
                  last: 0,
                  past: 0,
                  timestamp: 0,
                  docid: '',
                  starttime: '',
                  orflag: true,
                  status: 0,
                  fetalcount: 1,
                  ecg: new Queue()
                });
                if (devdata.beds[bi].is_working) {
                  datacache.get(cachebi).status = 1;
                } else {
                  datacache.get(cachebi).status = 2;
                }
                convertdocid(cachebi, devdata.beds[bi].doc_id);
                for (var fetal = 0; fetal < 3; fetal++) {
                  datacache.get(cachebi).fhr[fetal] = [];
                }
                datacache.get(cachebi).fetal_num = devdata.beds[bi].fetal_num;
                console.log(datacache.get(cachebi), devdata.beds[bi].fetal_num);
              }
            }
            setDevice(devlist);
          }
          res(datacache);
        } else if (received_msg.name == 'push_data_ctg') {
          //TODO 解析胎监应用层数据包
          var ctgdata = received_msg.data;
          var id = received_msg.device_no;
          var bi = received_msg.bed_no;
          var cachbi = id + '-' + bi;
          if (datacache.has(cachbi)) {
            var tmpcache = datacache.get(cachbi);
            for (let key in ctgdata) {
              tmpcache.fhr[0][ctgdata[key].index] = ctgdata[key].fhr;
              tmpcache.fhr[1][ctgdata[key].index] = ctgdata[key].fhr2;
              tmpcache.toco[ctgdata[key].index] = ctgdata[key].toco;
              if (tmpcache.start == -1) {
                tmpcache.start = ctgdata[key].index;
                tmpcache.past = ctgdata[key].index - 4800 > 0 ? ctgdata[key].index - 4800 : 0;
              }
              setcur(cachbi, ctgdata[key].index);
              for (let i = datacache.get(cachbi).start; i > datacache.get(cachbi).past; i--) {
                if (!tmpcache.fhr[0][i]) {
                  var curstamp = new Date().getTime();
                  if (offrequest < 8 && (tmpcache.orflag || curstamp - tmpcache.timestamp > interval)) {
                    tmpcache.orflag = false;
                    offrequest += 1;
                    var dis = tmpcache.start - tmpcache.past;
                    var length = dis > 800 ? 800 : dis;
                    var startpoint = tmpcache.start - length;
                    var endpoint = tmpcache.start;
                    //反向取值
                    send(
                      '{"name":"get_data_ctg","data":{"start_index":' +
                      startpoint +
                      ',"end_index":' +
                      endpoint +
                      ',"device_no":' +
                      id +
                      ',"bed_no":' +
                      bi +
                      '}}'
                    );
                    tmpcache.timestamp = new Date().getTime();
                    break;
                  }
                }
              }
              // 更新last index
              if (ctgdata[key].index - tmpcache.last < 2) {
                tmpcache.last = ctgdata[key].index;
              }
            }
          }
        } else if (received_msg.name == 'get_data_ctg') {
          //TODO 解析应用层数据包
          var ctgdata = received_msg.data;
          //console.log(ctgdata);
          var id = received_msg.device_no;
          var bi = received_msg.bed_no;
          var cachbi = id + '-' + bi;
          if (datacache.has(cachbi)) {
            var tmpcache = datacache.get(cachbi);
            for (var key in ctgdata) {
              tmpcache.fhr[0][ctgdata[key].index] = ctgdata[key].fhr;
              tmpcache.fhr[1][ctgdata[key].index] = ctgdata[key].fhr2;
              tmpcache.toco[ctgdata[key].index] = ctgdata[key].toco;
              setcur(cachbi, ctgdata[key].index);
            }
            tmpcache.orflag = true;
            if (offrequest > 0) {
              offrequest -= 1;
            }
            //判断 是否有缺失
            var flag = 0;
            var sflag = 0;
            var eflag = 0;
            for (let il = tmpcache.last; il < tmpcache.index; il++) {
              if (!tmpcache.fhr[0][il]) {
                if (flag == 0) {
                  sflag = il;
                }
              } else {
                if (flag > 0) {
                  eflag = il;
                  var curstamp = new Date().getTime();
                  //console.log(il +"--"+ datacache[cachbi].last);
                  if (offrequest < 8 && (tmpcache.orflag || curstamp - tmpcache.timestamp > interval)) {
                    tmpcache.orflag = false;
                    offrequest += 1;
                    send(
                      '{"name":"get_data_ctg","data":{"start_index":' +
                      sflag +
                      ',"end_index":' +
                      eflag +
                      ',"device_no":' +
                      id +
                      ',"bed_no":' +
                      bi +
                      '}}'
                    );
                    tmpcache.timestamp = new Date().getTime();
                    break;
                  }
                } else {
                  tmpcache.last = il;
                }
              }
            }
          }
        } else if (received_msg.name == 'push_data_ecg') {
          //TODO 解析母亲应用层数据包
          var ecgData = received_msg.data;
          var id = received_msg.device_no;
          var bi = received_msg.bed_no;
          var cachbi = id + '-' + bi;
          datacache.get(cachbi).ecg.EnQueue(ecgData[0].ecg_arr);
          console.log(datacache.get(cachbi).ecg);
        } else if (received_msg.name == 'get_devices') {
          console.log(received_msg.data);
          var devlist = received_msg.data;
          for (var i in devlist) {
            var devdata = devlist[i];
            if (!devdata) continue;
          }
        }
        //开启监护页
        else if (received_msg.name == 'start_work') {
          let devdata = received_msg.data;
          let curid = Number(devdata['device_no']) + '-' + Number(devdata['bed_no']);
          //TODO : 更新设备状态
          convertdocid(curid, devdata.doc_id);
          console.log(devdata.is_working);
        }
      }
    };
    return [datacache];
  });

  function convertdocid(id: any, doc_id: string) {
    datacache.get(id).docid = doc_id;
    if (doc_id != '') {
      let vt = doc_id.split('_');
      if (vt.length > 2) {
        datacache.get(id).starttime =
          '20' +
          vt[2].substring(0, 2) +
          '-' +
          vt[2].substring(2, 4) +
          '-' +
          vt[2].substring(4, 6) +
          ' ' +
          vt[2].substring(6, 8) +
          ':' +
          vt[2].substring(8, 10) +
          ':' +
          vt[2].substring(10, 12);
      }
    }
  }
  function setcur(id: any, value: number) {
    /*
        if(!datacache.get(id).index){
			datacache.get(id).index = value;
		}*/
    if (value < datacache.get(id).start) {
      datacache.get(id).start = value;
    } else if (value >= datacache.get(id).index) {
      datacache.get(id).index = value;
    }
  }

  function startwork() {
    //var message = '{"name":"start_work","data":{"device_no":'+Number(adid[0])+',"bed_no":'+Number(adid[1])+'}}';
  }

  function endwork() {
    //var message = '{"name":"start_work","data":{"device_no":'+Number(adid[0])+',"bed_no":'+Number(adid[1])+'}}';
  }

  function send(message: string) {
    if (socket.readyState == WebSocket.OPEN) {
      socket.send(message);
    } else {
      // alert('The socket is not open.');
    }
  }
};
