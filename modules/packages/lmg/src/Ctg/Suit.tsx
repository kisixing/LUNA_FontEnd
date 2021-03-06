import request from '@lianmed/request';
import { event } from '@lianmed/utils';
import { throttle } from 'lodash';
import Draw from '../Draw';
import { PointType } from '../interface';
import ScrollEl from '../ScrollBar/ScrollEl';
//var rulercolor = 'rgb(67,205,128)';
import { IBarTool, TLineTool } from '../ScrollBar/useScroll';
import { convertstarttime } from '../services/utils';
import { BedStatus, ICacheItem } from '../services/WsService';
import bindEvents from './bindEvents';
import DrawCTG from './DrawCTG';
import { DrawAnalyse } from './drawTools/DrawAnalyse';
import { DrawSelect } from './drawTools/DrawSelect';
let sid = 0;
type Canvas = HTMLCanvasElement;
type Context = CanvasRenderingContext2D;

const defaultCtgConfig = {
  normalarea: 'rgb(224,255,255)',
  selectarea: 'rgba(192,192,192,0.5)',
  rule: 'rgba(0,51,102,1)',
  scale: 'rgba(0,0,0,1)',
  // primarygrid: 'rgba(144, 159, 180,1)',
  // secondarygrid: 'rgba(221, 230, 237,1)',
  primarygrid: 'red',
  secondarygrid: '#F59997',
  fhrcolor: ['green', 'blue', 'rgb(0,0,0)'],
  tococolor: 'rgb(0,0,0)',
  alarmcolor: 'rgb(255, 1, 1)',
  fmpcolor: 'darkgreen',
  alarm_enable: true,
  alarm_high: 160,
  alarm_low: 110,
  print_interval: 20,
  alarm_delay: 0,
  show_fetalmovement: true

}
type TCtgConfig = { [x in keyof typeof defaultCtgConfig]?: any }

const lightConfig: TCtgConfig = {


  rule: 'rgba(0,51,102,1)',
  primarygrid: 'rgba(100, 100, 100, 1)',
  secondarygrid: 'rgba(200, 200, 200, 1)',


  // primarygrid: '#6b6100',
  // secondarygrid: '#d6cd81',
  // rule: '#827717',
  scale: 'rgba(0,0,0,1)',

  normalarea: 'rgb(224,255,255)',

}
const darkConfig: TCtgConfig = {
  primarygrid: '#8F464D',
  secondarygrid: '#8F464D',
  rule: '#bbb',
  scale: '#bbb',
  normalarea: '#447865',

}
export class Suit extends Draw {
  drawAnalyse: DrawAnalyse
  drawSelect: DrawSelect
  get isTrueTime() {
    return this.type === 0
  }
  needScroll = false;
  isOn: boolean;
  static option: { [x: string]: any };
  option = Suit.option;
  initFlag = false;
  sid = sid++;
  log = (console && console.log) ? console.log.bind(console, 'suit', this.sid) : () => { };

  intervalIds: NodeJS.Timeout[] = [];
  data: ICacheItem;
  starttime = '2019-09-26';
  fetalcount = 1;
  type = 0; // 0 实时数据，1 历史数据
  currentdot = 10; //当前实时绘制点
  currentx = 10;
  viewposition = 0;
  lineTool: TLineTool;
  scollscale = 1;
  buffersize = 16;
  curr = -16;
  alarmStatus = 0; //报警状态
  private _ctgconfig: TCtgConfig = defaultCtgConfig;
  public get ctgconfig(): TCtgConfig {

    return Object.assign(this._ctgconfig, window['isDark'] ? darkConfig : lightConfig, !window['isFucked'] ? {} : {
      primarygrid: '#6b6100',
      secondarygrid: '#d6cd81',
      rule: '#827717',
    });
  }
  public set ctgconfig(value: TCtgConfig) {
    this._ctgconfig = value;
  }
  // ctgconfig = {
  //   normalarea: 'rgb(224,255,255)',
  //   selectarea: 'rgba(192,192,192,0.5)',
  //   rule: 'rgba(0,51,102,1)',
  //   scale: 'rgba(0,0,0,1)',
  //   // primarygrid: 'rgba(144, 159, 180,1)',
  //   // secondarygrid: 'rgba(221, 230, 237,1)',
  //   primarygrid: 'rgba(100, 100, 100, 1)',
  //   secondarygrid: 'rgba(200, 200, 200, 1)',
  //   fhrcolor: ['green', 'blue', 'rgb(0,0,0)'],
  //   tococolor: 'rgb(0,0,0)',
  //   alarmcolor: 'rgb(255, 1, 1)',
  //   fmpcolor: 'darkgreen',
  //   alarm_enable: true,
  //   alarm_high: 160,
  //   alarm_low: 110,
  //   print_interval: 20,
  //   alarm_delay: 0,
  //   show_fetalmovement: true
  // };
  fetalposition = {
    fhr1: '',
    fhr2: '',
    fhr3: '',
  };
  printlen = 4800;


  requestflag = false;
  canvasgrid: Canvas;
  contextgrid: Context;
  canvasdata: Canvas;
  contextdata: Context;
  canvasline: Canvas;
  contextline: Context;
  barTool: IBarTool;
  drawobj: DrawCTG;
  dragtimestamp = 0;
  interval = 5000;
  timeout: NodeJS.Timeout;
  rowline: ScrollEl;

  toolbarposition = 0; //滚动条位置，事件更新

  get leftViewposition() {
    return this.rightViewPosition >= this.width * 2 ? this.rightViewPosition - this.width * 2 : 0;
  }
  get rightViewPosition() {
    return this.viewposition;
  }
  getAnalyseEndTime(interval: number) {
    const len = this.data.fhr[0].length
    const startTime = this.drawSelect.selectingBarPoint
    const targetEndTime = startTime + interval * 240
    return len ? (Math.min(targetEndTime, len) || 0) : 0
  }
  set rightViewPosition(value: number) {
    this.viewposition = value;

    this.emit('change:selectPoint', this.drawSelect.selectingBarPoint)

    this.updateBarTool();
    this.drawobj.drawdot((this.type > 0 && this.viewposition < this.width * 2) ? this.width * 2 : this.viewposition, false,);
  }

  constructor(
    canvasgrid: Canvas,
    canvasdata: Canvas,
    canvasline: Canvas,
    canvasselect: Canvas,
    canvasanalyse: Canvas,
    wrap: HTMLElement,
    barTool: IBarTool,
    type: number,
    ctgconfig: TCtgConfig
  ) {
    super(wrap);
    console.log('suit', this)
    bindEvents.call(this);
    this.wrap = wrap;
    this.canvasgrid = canvasgrid;
    this.canvasdata = canvasdata;
    this.canvasline = canvasline;
    this.contextgrid = canvasgrid.getContext('2d');
    this.contextdata = canvasdata.getContext('2d');
    this.contextline = canvasline.getContext('2d');
    this.barTool = barTool;
    this.drawobj = new DrawCTG(this);
    this.type = type;
    this.drawAnalyse = new DrawAnalyse(wrap, canvasanalyse, this)
    this.drawSelect = new DrawSelect(wrap, canvasselect, this)
    if (this.option) {
      this.ctgconfig.tococolor = this.option.tococolor;
      this.ctgconfig.fhrcolor[0] = this.option.fhrcolor1;
      this.ctgconfig.fhrcolor[1] = this.option.fhrcolor2;
      this.ctgconfig.fhrcolor[2] = this.option.fhrcolor3;
      this.ctgconfig.show_fetalmovement = this.option.show_fetalmovement === undefined ? true : !!this.option.show_fetalmovement
      if (this.option.alarm_enable == '0') {
        this.ctgconfig.alarm_enable = false;
      } else {
        this.ctgconfig.alarm_enable = true;
      }
      this.ctgconfig.alarm_enable = true;
      this.ctgconfig.alarm_high = Number(this.option.alarm_high);
      this.ctgconfig.alarm_low = Number(this.option.alarm_low);
      this.ctgconfig.print_interval = Number(this.option.print_interval) || 20;
      this.ctgconfig.alarm_delay = Number(this.option.alarm_delay) || 0
    }
  }
  onMov() {
    this.getoffline();

  }
  init(data: ICacheItem) {

    if (!data || !(data.fhr || (data as any).fhr1)) {
      return;
    }

    // if (data.keepSelection && this.data && this.data.fhr[0].length > 0) {
    //   return
    // }
    const t = this.initFlag && data.keepSelection
    let defaultinterval = 500;
    this.data = data;
    this.currentdot = data.index;
    if (data.status) {
      this.type = 0;
    } else {
      this.type = 1;
      if (typeof data.index == 'undefined') {
        this.data = this.InitFileData(data) as any;
        if (this.data.index > this.width * 2) {
          this.needScroll = true;
        }
      }
    }
    this.drawAnalyse.init()
    this.drawSelect.init()

    t || this.drawSelect.clearselect();
    this.drawobj.showcur(t ? this.drawSelect.selectingBarPoint : 0, false);
    if (this.type > 0) {
      //kisi 2019-10-29 测试增加analyse属性
      // console.log(this.data);
      if (this.data.index > this.canvasline.width * 2) {
        this.curr = this.canvasline.width * 2;
        // console.log('type_check', this.canvasline.width, this.canvasline.width * 2, this.data.index);
        if (this.data.index < this.canvasline.width * 4) {
          let len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
          this.barTool.setBarWidth(len);
        } else {
          this.barTool.setBarWidth(100);
        }

      } else {
        this.barTool.setBarWidth(0);

        this.curr = this.data.index;
      }

      t || (this.rightViewPosition = this.curr);
      t || this.barTool.setBarLeft(0, false);
      this.drawobj.drawdot((t && this.data.index > this.width * 2) ? this.rightViewPosition : this.canvasline.width * 2, false);
    } else {
      this.timerCtg(defaultinterval);
    }
    this.barTool.watch(value => {
      this.onMov()

      //显示历史数据
      //kisi 优化拖动赋值
      this.toolbarposition = value;
      //console.log(this.curr,this.rightViewPosition,value,this.canvasline.width ,this.data.index);
      this.dragtimestamp = new Date().getTime();
      let len = 100;
      if (this.data.index < this.canvasline.width * 4) {
        len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
      }
      let _viewposition =
        this.canvasline.width * 2 +
        Math.floor(
          ((this.data.index - this.canvasline.width * 2) * value) / (this.canvasline.width - len)
        );
      if (this.viewposition < this.canvasline.width * 2) {
        _viewposition = this.canvasline.width * 2;
      }
      this.rightViewPosition = _viewposition;
      this.drawSelect.updateSelectCur();
      this.drawSelect.showselect();
      this.drawobj.drawdot(this.rightViewPosition, false);
    });
    this.barTool.watchGrab(value => {
      this.onMov()



      let _viewposition;
      value = ~~value * 2;



      if (this.data.index < this.canvasline.width * 2) {
        return;
      }
      this.dragtimestamp = new Date().getTime();
      //判断开始点
      if (this.rightViewPosition - value < this.canvasline.width * 2) {
        _viewposition = this.canvasline.width * 2;
        this.drawobj.drawdot(this.rightViewPosition, false);
        // if (this.selectflag) {
        if (this.drawSelect.selectend == 1) {
          this.drawSelect.endingBar.setLeft(
            this.canvasline.width - Math.floor((this.rightViewPosition - this.drawSelect.selectrpend) / 2)
          );
        }
        this.drawSelect.showselect();
        // }
        this.updateBarTool();
        return;
      }
      //方向确认
      // console.log('print_drag1', value, this.rightViewPosition, this.selectrpend);
      if (this.rightViewPosition - value < this.data.index) {
        _viewposition = this.rightViewPosition - value;
        //this.movescoller();
        this.drawobj.drawdot(this.rightViewPosition, false);
      } else {
        _viewposition = this.data.index;
        this.drawobj.drawdot(this.rightViewPosition, false);
        // console.log('print_drag--', this.rightViewPosition);
      }
      this.updateBarTool();
      this.rightViewPosition = _viewposition;
      // if (this.selectflag) {
      // console.log('print_drag2', value, this.rightViewPosition, this.selectrpend, Math.floor((this.rightViewPosition - this.selectrpend)) / 2);
      if (this.drawSelect.selectend == 1 && this.rightViewPosition - this.drawSelect.selectrpend > -2) {
        // this.endingBar.setVisibility(true);
        //this.endingBar.setOffset(this.selectrpend / 2);
        this.drawSelect.endingBar.setLeft(
          this.canvasline.width - Math.floor((this.rightViewPosition - this.drawSelect.selectrpend) / 2)
        );
      } else {
        // this.endingBar.setVisibility(false);
      }
      this.drawSelect.showselect();
      // }
      this.drawobj.drawdot(this.rightViewPosition, false);

    });

    event.emit('suit:afterInit', this)
    this.initFlag = true;

  }
  createLine() {
    if (this.rowline) return;
    const { barTool, } = this

    const lineTool = (this.lineTool = barTool.createHLine('blue'));
    const { rowline, addDot, setBase } = lineTool;
    // 横线监听y变化
    this.rowline = rowline.on('change:y', v => {
      console.log('rowline', v);
    });

    // 添加点
    const dot0 = addDot({ left: 10 });
    const dot1 = addDot({ left: 100 });

    rowline.setStyle('background', '#FFCC99');
    // dot0.setStyle('background', 'green')
    dot0.setStyle('border-right-color', '#AA33AA');
    dot0.setStyle('border-bottom-color', '#AA33AA');
    dot1.setStyle('border-left-color', '#FF2233');
    dot1.setStyle('border-bottom-color', '#FF2233');
    // 点监听x变化
    dot0.on('change:x', v => {
      console.log('dot0', v);
    });
    dot1.on('change:x', v => {
      console.log('dot1', v);
    });

    // 隐藏示例
    const dot2 = addDot({ left: 100 });
    dot2.setVisibility(false);

    // 最后设置位置
    setBase(200);
    lineTool.toggleVisibility();
  }
  updateBarTool() {
    this.drawSelect.updateSelectCur();
    let len = 100;
    if (this.data.index < this.canvasline.width * 4) {
      len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
    }
    this.toolbarposition = Math.floor(
      ((this.canvasline.width - len) * (this.rightViewPosition - this.canvasline.width * 2)) /
      (this.data.index - this.canvasline.width * 2)
    );
    this.barTool.setBarLeft(this.toolbarposition, false);
  }
  itemAlarm(text: string) {
    if (this.ctgconfig.alarm_enable && this.checkdragtimestamp()) {
      event.emit('item:alarm', this.data.id, 2, text)
    }
  }
  lazyEmit = throttle((type: string, ...args: any[]) => {
    // console.log(`Suit:${type}`)

    // this.emit(type, ...args);

    // console.log('alarmtype in',type,this)
    return true;
  }, 0);
  alarmHighCount = []
  alarmLowCount = []

  // 报警
  alarmLow(fetalIndex: number) {
    const key = 'alarmLowCount' + fetalIndex
    this[key] = this[key] || []
    const arr: number[] = this[key]
    arr.push(0)
    const text = `FHR${fetalIndex + 1}心率过低`

    if (arr.length >= 2 * this.ctgconfig.alarm_delay) {
      this.itemAlarm(text)
      this.lazyEmit('alarmOn', text);
      return true
    }
  }
  alarmHigh(fetalIndex: number) {
    const key = 'alarmHighCount' + fetalIndex
    this[key] = this[key] || []
    const arr: number[] = this[key]
    arr.push(0)
    if (arr.length >= 2 * this.ctgconfig.alarm_delay) {
      const text = `FHR${fetalIndex + 1}心率过高`
      this.itemAlarm(text)
      this.lazyEmit('alarmOn', text);
      return true
    }
  }
  alarmOff(fetalIndex?: number) {
    if (typeof fetalIndex === 'number') {
      this.lazyEmit('alarmOff', '');
      const key = 'alarmLowCount' + fetalIndex
      this[key] = []
    } else {
      this.data && Array(this.data.fetal_num).fill(0).forEach((_, i) => {
        const key = 'alarmLowCount' + i
        this[key] = []
      })
    }

  }
  checkAlarm(fetalIndex: number, cv: number) {
    if (this.data.isWorking) {
      // 荣总：胎心率最大的计算范围是29~241
      if (cv <= 241 && cv > this.ctgconfig.alarm_high) {
        this.alarmHigh(fetalIndex);
        return true
      } else if (cv < this.ctgconfig.alarm_low && cv >= 29) {
        this.alarmLow(fetalIndex);
        return true
      } else {
        this.alarmOff(fetalIndex)
        return false
      }
    }



  }

  destroy() {
    this.intervalIds.forEach(_ => clearInterval(_));
    this.canvasgrid = null;
    this.canvasdata = null;
    this.contextgrid = null;
    this.contextdata = null;
    this.canvasline = null;
    this.contextline = null;

    // this.p = null;
    this.wrap = null;
    this.drawobj = null;
    this.barTool = null;
  }
  _resize() {
    if (this.wrap) {
      const { width, height } = this.wrap.getBoundingClientRect()
      if (this.type > 0 && width < 200) {
        // setTimeout(() => {
        //   this._resize()
        //   event.emit('fuckedResize')
        // }, 1000);
        Object.values(this).forEach(_ => _ && _.resize && _.resize(width, height))
      } else {
        Object.values(this).forEach(_ => _ && _.resize && _.resize(width, height))
      }
    }


  }
  //kisi 2019-11-14 update fhr position
  setfetalposition(fhr1, fhr2, fhr3) {
    if (this.data && this.data.fetalposition) {
      this.data.fetalposition.fhr1 = fhr1;
      this.data.fetalposition.fhr2 = fhr2;
      this.data.fetalposition.fhr3 = fhr3;
    }
  }
  //kisi 2019-12-08 update fhr position
  // setfetalpositionbyobj(position) {
  //   if (typeof (position.fhr1) != 'undefined') {
  //     this.data.fetalposition.fhr1 = position.fhr1;
  //   }
  //   if (typeof (position.fhr2) != 'undefined') {
  //     this.data.fetalposition.fhr2 = position.fhr2;
  //   }
  //   if (typeof (position.fhr3) != 'undefined') {
  //     this.data.fetalposition.fhr3 = position.fhr3;
  //   }
  // }
  //kisi 2019-11-21 同步移动barTool

  movescoller() { }

  //胎心数据处理
  InitFileData(oriobj) {
    let CTGDATA = {
      docid: oriobj.docid,
      fhr: [[], [], []],
      toco: [],
      fm: [],
      fmp: [],
      fetal_num: +oriobj.fetalnum || 1,
      index: 0,
      starttime: '',
      fetalposition: {},
      analyse: { acc: [], dec: [], baseline: [], start: 0, end: 0 },
      noOffset: oriobj.noOffset,
      selectBarHidden: oriobj.selectBarHidden,
      keepSelection: oriobj.keepSelection,
    };
    if (oriobj.docid) {
      let pureidarr: string[] = oriobj.docid.split('_');
      let pureid = pureidarr[2];
      CTGDATA.starttime = convertstarttime(pureid);
    }
    if (
      typeof oriobj.fetalposition != 'undefined' &&
      oriobj.fetalposition != null &&
      oriobj.fetalposition != ''
    ) {
      let positionobj = JSON.parse(oriobj.fetalposition);
      CTGDATA.fetalposition = positionobj;

    }
    Object.keys(oriobj).forEach(key => {
      let oridata = oriobj[key];
      if (!oridata || oridata === '') {
        return false;
      }
      if (key === 'docid') {
        return false;
      }


      if (key === 'analyse' && oridata) {
        Object.assign(CTGDATA.analyse, oridata);
        return;
      }
      if (key === 'fhr1') {
        CTGDATA.index = oridata.length / 2;
      }
      for (let i = 0; i < CTGDATA.index; i++) {
        if (typeof oridata != 'string' || oridata.length < 2) {
          return;
        }
        let hexBits = oridata.substring(0, 2);
        let data_to_push = parseInt(hexBits, 16);
        if (key === 'fhr1') {
          CTGDATA.fhr[0][i] = data_to_push;
        } else if (key === 'fhr2') {
          CTGDATA.fhr[1][i] = data_to_push;
        } else if (key === 'fhr3') {
          CTGDATA.fhr[2][i] = data_to_push;
        } else if (key === 'toco') {
          CTGDATA.toco[i] = data_to_push;
        } else if (key === 'fm') {
          CTGDATA.fm[i] = data_to_push;
        } else if (key === 'fmp') {
          CTGDATA.fmp[i] = data_to_push > 18 ? 98 : (data_to_push + 80);
        }
        oridata = oridata.substring(2, oridata.length);
      }
    });
    return CTGDATA;
  }

  //TODO: 增加 断网事件，接收到断网事件后，drawdot 方法停止
  //所有suit的状态位置，隐藏状态
  //
  drawdot() {
    if (
      this.data.starttime &&
      this.data.starttime != '' &&
      this.data.status === BedStatus.Working &&
      this.data.index > 0 &&
      this.isOn
    ) {
      if (isNaN(this.data.csspan)) return;
      this.curr = (+new Date() - +new Date(this.data.starttime)) / 1000 * 4 + this.data.csspan;
      if (this.curr < 0) return;
      this.drawobj.drawdot(this.curr, true);
      this.rightViewPosition = this.curr;
      if (this.data.index > this.canvasline.width * 2) {
        if (this.data.index < this.canvasline.width * 4) {
          let len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
          this.barTool.setBarWidth(len);
        } else {
          this.barTool.setBarWidth(100);
        }
        this.barTool.setBarLeft(this.canvasline.width, false);
      } else {
        this.barTool.setBarWidth(0);
      }
    } else {
      // console.log('status',this.data.status);
      this.alarmOff();
      this.drawobj.showcur(this.data.index + 2, false);
      this.drawobj.drawdot(this.data.index + 2, false);
    }
  }

  timerCtg(dely) {
    let id = setInterval(() => {
      if (!this) {
        clearInterval(id);
      }
      if (this.checkdragtimestamp()) {
        if (this.drawSelect.selectstartposition != 0) {
          this.drawSelect.startingBar.setLeft(0);
        }
        this.drawdot();
      }
    }, dely);
    this.intervalIds.push(id);
  }
  checkdragtimestamp() {
    var curstamp = new Date().getTime();
    return curstamp - this.dragtimestamp > this.interval
  }
  onStatusChange(status: boolean): boolean | void {
    return status;
  }

  getoffline() {
    const doc_id = this.data.docid
    const offlineend = this.data.past
    if (!this.requestflag && this.type == 0 && this.data.past > 0) {
      this.requestflag = true;
      request.get(`/ctg-exams-data/${doc_id}`).then(responseData => {
        // console.log(doc_id, offlineend, responseData, this.data.past);
        if (responseData) {
          this.initfhrdata(responseData, this.data, offlineend);
          this.data.past = 0;
        }
      }).finally(() => this.requestflag = false);
    }
    event.emit('suit:keepData')

  }

  initfhrdata(data, localData, offindex) {
    Object.keys(data).forEach(key => {
      let oridata = data[key] as string;
      if (!oridata) {
        return;
      }
      for (let i = 0; i < offindex; i++) {
        let hexBits = oridata.substring(0, 2);
        let data_to_push = parseInt(hexBits, 16);
        if (key === 'fhr1') {
          localData.fhr[0][i] = data_to_push;
        } else if (key === 'fhr2') {
          if (localData.fhr[1]) localData.fhr[1][i] = data_to_push;
        } else if (key === 'fhr3') {
          if (localData.fhr[2]) localData.fhr[2][i] = data_to_push;
        } else if (key === 'toco') {
          localData.toco[i] = data_to_push;
        } else if (key === 'fm') {
          localData.fm[i] = data_to_push;
        }

        oridata = oridata.substring(2, oridata.length);
      }

    });
  }
  isCheckBaelinePoint = false
  getPointType(x: number, y: number): PointType {
    const { analysisData, mapXtoY, mapBaselilneXtoY } = this.drawAnalyse
    x = Math.round(x)
    const mKeys = Object.keys(mapBaselilneXtoY).map(_ => Number(_))
    const edge = 10;


    if (analysisData) {
      if (this.isCheckBaelinePoint) {
        const idx = mKeys.findIndex(_ => Math.abs(x - _) <= edge && Math.abs(y - mapBaselilneXtoY[_]) <= edge)
        if (idx > -1) {
          this.drawAnalyse.baselinePointIndex = this.drawAnalyse.mapBaselilneXtoIndex[mKeys[idx]]
          console.log('idx', this.drawAnalyse.baselinePointIndex, mapBaselilneXtoY)
          return 'BaselinePoint'
        }
      } else {
        const { analysis: { acc, dec } } = analysisData

        let target = acc.find(_ => (x < _.x + edge) && (x >= _.x)) || dec.find(_ => (x < _.x + edge * 2) && (x >= _.x))
        console.log('click', x, y, target)
        // 标记文字
        if (target && (y <= (target.y + 2 * edge) && y > (target.y))) {
          const isDec = 'type' in target
          this.drawAnalyse.pointToEdit = target
          return isDec ? 'EditDecPoint' : 'EditAccPoint'
        }
        const linePoint = mapXtoY[x]

        const leftIndex = mKeys.reduce((index, _) => {
          const left = mKeys[index]
          const right = mKeys[index + 1]
          if (right === undefined) {
            return
          }
          if (left <= x) {
            if (x <= right) {
              return index
            } else {
              return index + 1
            }
          } else {
            return

          }
        }, 0)
        console.log('click', x, y, linePoint)
        // 线上的点
        if (typeof leftIndex === 'number' && linePoint && Math.abs(y - linePoint.y) < 8) {
          const x1 = mKeys[leftIndex]
          const x2 = mKeys[leftIndex + 1]
          const y1 = mapBaselilneXtoY[x1]
          const y2 = mapBaselilneXtoY[x2]
          const k = (y2 - y1) / (x2 - x1)
          const b = y1 - x1 * k
          const baseY = x * k + b
          const type = (linePoint.y - baseY) < 0 ? 'MarkAccPoint' : 'MarkDecPoint'
          this.drawAnalyse.pointToInsert = { type, index: linePoint.index }
          return type
        }
      }

    }

    return null
  }
  getBaseY(x: number) {
    const { analysisData, mapBaselilneXtoY } = this.drawAnalyse
    x = Math.round(x)

    if (analysisData) {



      const mKeys = Object.keys(mapBaselilneXtoY).map(_ => Number(_))
      const leftIndex = mKeys.reduce((index, _) => {
        const left = mKeys[index]
        const right = mKeys[index + 1]
        if (right === undefined) {
          return
        }
        if (left <= x) {
          if (x <= right) {
            return index
          } else {
            return index + 1
          }
        } else {
          return

        }
      }, 0)
      // 线上的点
      if (typeof leftIndex === 'number') {
        const x1 = mKeys[leftIndex]
        const x2 = mKeys[leftIndex + 1]
        const y1 = mapBaselilneXtoY[x1]
        const y2 = mapBaselilneXtoY[x2]
        const k = (y2 - y1) / (x2 - x1)
        const b = y1 - x1 * k
        const baseY = x * k + b
        return baseY
      }

    }

    return null
  }
  // public get reviceAnalyse(): DrawAnalyse['revicePoint'] {
  //   return this.drawAnalyse.revicePoint.bind(this.drawAnalyse)
  // }
  // public get ctgscore(): DrawAnalyse['ctgscore'] {
  //   return this.drawAnalyse.ctgscore.bind(this.drawAnalyse)
  // }
  // public get analyse(): DrawAnalyse['analyse'] {
  //   return this.drawAnalyse.analyse.bind(this.drawAnalyse)
  // }

}

// function formatAnalyseData(obj: { [x: string]: string }) {
//   const keys = ['acc', 'baseline', 'dec', 'meanbaseline'];
//   const arr: [string, number[]][] = Object.entries(obj)
//     .filter(([k, v]) => keys.includes(k))
//     .map(([k, v]) => {
//       v = typeof v === 'string' ? v : '';
//       return [
//         k,
//         v
//           .split(',')
//           .map(_ => parseInt(_))
//           .filter(_ => !isNaN(_)),
//       ];
//     });
//   return {
//     ...obj,
//     ...arr.reduce((a, [k, v]) => {
//       return Object.assign(a, { [k]: v });
//     }, {}),
//   };
// }
