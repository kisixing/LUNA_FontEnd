"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("@lianmed/request"));
var utils_1 = require("@lianmed/utils");
var lodash_1 = require("lodash");
var Draw_1 = __importDefault(require("../Draw"));
var utils_2 = require("../services/utils");
var WsService_1 = require("../services/WsService");
var bindEvents_1 = __importDefault(require("./bindEvents"));
var DrawCTG_1 = __importDefault(require("./DrawCTG"));
var DrawAnalyse_1 = require("./drawTools/DrawAnalyse");
var DrawSelect_1 = require("./drawTools/DrawSelect");
var sid = 0;
var defaultCtgConfig = {
    normalarea: 'rgb(224,255,255)',
    selectarea: 'rgba(192,192,192,0.5)',
    rule: 'rgba(0,51,102,1)',
    scale: 'rgba(0,0,0,1)',
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
};
var lightConfig = {
    rule: 'rgba(0,51,102,1)',
    primarygrid: 'rgba(100, 100, 100, 1)',
    secondarygrid: 'rgba(200, 200, 200, 1)',
    scale: 'rgba(0,0,0,1)',
    normalarea: 'rgb(224,255,255)',
};
var darkConfig = {
    primarygrid: '#8F464D',
    secondarygrid: '#8F464D',
    rule: '#bbb',
    scale: '#bbb',
    normalarea: '#447865',
};
var Suit = (function (_super) {
    __extends(Suit, _super);
    function Suit(canvasgrid, canvasdata, canvasline, canvasselect, canvasanalyse, wrap, barTool, type, ctgconfig) {
        var _this = _super.call(this, wrap) || this;
        _this.needScroll = false;
        _this.option = Suit.option;
        _this.initFlag = false;
        _this.sid = sid++;
        _this.log = (console && console.log) ? console.log.bind(console, 'suit', _this.sid) : function () { };
        _this.intervalIds = [];
        _this.starttime = '2019-09-26';
        _this.fetalcount = 1;
        _this.type = 0;
        _this.currentdot = 10;
        _this.currentx = 10;
        _this.viewposition = 0;
        _this.scollscale = 1;
        _this.buffersize = 16;
        _this.curr = -16;
        _this.alarmStatus = 0;
        _this._ctgconfig = defaultCtgConfig;
        _this.fetalposition = {
            fhr1: '',
            fhr2: '',
            fhr3: '',
        };
        _this.printlen = 4800;
        _this.requestflag = false;
        _this.dragtimestamp = 0;
        _this.interval = 5000;
        _this.toolbarposition = 0;
        _this.lazyEmit = lodash_1.throttle(function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return true;
        }, 0);
        _this.alarmHighCount = [];
        _this.alarmLowCount = [];
        _this.isCheckBaelinePoint = false;
        console.log('suit', _this);
        bindEvents_1.default.call(_this);
        _this.wrap = wrap;
        _this.canvasgrid = canvasgrid;
        _this.canvasdata = canvasdata;
        _this.canvasline = canvasline;
        _this.contextgrid = canvasgrid.getContext('2d');
        _this.contextdata = canvasdata.getContext('2d');
        _this.contextline = canvasline.getContext('2d');
        _this.barTool = barTool;
        _this.drawobj = new DrawCTG_1.default(_this);
        _this.type = type;
        _this.drawAnalyse = new DrawAnalyse_1.DrawAnalyse(wrap, canvasanalyse, _this);
        _this.drawSelect = new DrawSelect_1.DrawSelect(wrap, canvasselect, _this);
        if (_this.option) {
            _this.ctgconfig.tococolor = _this.option.tococolor;
            _this.ctgconfig.fhrcolor[0] = _this.option.fhrcolor1;
            _this.ctgconfig.fhrcolor[1] = _this.option.fhrcolor2;
            _this.ctgconfig.fhrcolor[2] = _this.option.fhrcolor3;
            _this.ctgconfig.show_fetalmovement = _this.option.show_fetalmovement === undefined ? true : !!_this.option.show_fetalmovement;
            if (_this.option.alarm_enable == '0') {
                _this.ctgconfig.alarm_enable = false;
            }
            else {
                _this.ctgconfig.alarm_enable = true;
            }
            _this.ctgconfig.alarm_enable = true;
            _this.ctgconfig.alarm_high = Number(_this.option.alarm_high);
            _this.ctgconfig.alarm_low = Number(_this.option.alarm_low);
            _this.ctgconfig.print_interval = Number(_this.option.print_interval) || 20;
            _this.ctgconfig.alarm_delay = Number(_this.option.alarm_delay) || 0;
        }
        return _this;
    }
    Object.defineProperty(Suit.prototype, "isTrueTime", {
        get: function () {
            return this.type === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Suit.prototype, "ctgconfig", {
        get: function () {
            return Object.assign(this._ctgconfig, window['isDark'] ? darkConfig : lightConfig, !window['isFucked'] ? {} : {
                primarygrid: '#6b6100',
                secondarygrid: '#d6cd81',
                rule: '#827717',
            });
        },
        set: function (value) {
            this._ctgconfig = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Suit.prototype, "leftViewposition", {
        get: function () {
            return this.rightViewPosition >= this.width * 2 ? this.rightViewPosition - this.width * 2 : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Suit.prototype, "rightViewPosition", {
        get: function () {
            return this.viewposition;
        },
        set: function (value) {
            this.viewposition = value;
            this.emit('change:selectPoint', this.drawSelect.selectingBarPoint);
            this.updateBarTool();
            this.drawobj.drawdot((this.type > 0 && this.viewposition < this.width * 2) ? this.width * 2 : this.viewposition, false);
        },
        enumerable: true,
        configurable: true
    });
    Suit.prototype.getAnalyseEndTime = function (interval) {
        var len = this.data.fhr[0].length;
        var startTime = this.drawSelect.selectingBarPoint;
        var targetEndTime = startTime + interval * 240;
        return len ? (Math.min(targetEndTime, len) || 0) : 0;
    };
    Suit.prototype.onMov = function () {
        this.getoffline();
    };
    Suit.prototype.init = function (data) {
        var _this = this;
        if (!data || !(data.fhr || data.fhr1)) {
            return;
        }
        var t = this.initFlag && data.keepSelection;
        var defaultinterval = 500;
        this.data = data;
        this.currentdot = data.index;
        if (data.status) {
            this.type = 0;
        }
        else {
            this.type = 1;
            if (typeof data.index == 'undefined') {
                this.data = this.InitFileData(data);
                if (this.data.index > this.width * 2) {
                    this.needScroll = true;
                }
            }
        }
        this.drawAnalyse.init();
        this.drawSelect.init();
        t || this.drawSelect.clearselect();
        this.drawobj.showcur(t ? this.drawSelect.selectingBarPoint : 0, false);
        if (this.type > 0) {
            if (this.data.index > this.canvasline.width * 2) {
                this.curr = this.canvasline.width * 2;
                if (this.data.index < this.canvasline.width * 4) {
                    var len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
                    this.barTool.setBarWidth(len);
                }
                else {
                    this.barTool.setBarWidth(100);
                }
            }
            else {
                this.barTool.setBarWidth(0);
                this.curr = this.data.index;
            }
            t || (this.rightViewPosition = this.curr);
            t || this.barTool.setBarLeft(0, false);
            this.drawobj.drawdot((t && this.data.index > this.width * 2) ? this.rightViewPosition : this.canvasline.width * 2, false);
        }
        else {
            this.timerCtg(defaultinterval);
        }
        this.barTool.watch(function (value) {
            _this.onMov();
            _this.toolbarposition = value;
            _this.dragtimestamp = new Date().getTime();
            var len = 100;
            if (_this.data.index < _this.canvasline.width * 4) {
                len = Math.floor((_this.canvasline.width * 4 - _this.data.index) / 2);
            }
            var _viewposition = _this.canvasline.width * 2 +
                Math.floor(((_this.data.index - _this.canvasline.width * 2) * value) / (_this.canvasline.width - len));
            if (_this.viewposition < _this.canvasline.width * 2) {
                _viewposition = _this.canvasline.width * 2;
            }
            _this.rightViewPosition = _viewposition;
            _this.drawSelect.updateSelectCur();
            _this.drawSelect.showselect();
            _this.drawobj.drawdot(_this.rightViewPosition, false);
        });
        this.barTool.watchGrab(function (value) {
            _this.onMov();
            var _viewposition;
            value = ~~value * 2;
            if (_this.data.index < _this.canvasline.width * 2) {
                return;
            }
            _this.dragtimestamp = new Date().getTime();
            if (_this.rightViewPosition - value < _this.canvasline.width * 2) {
                _viewposition = _this.canvasline.width * 2;
                _this.drawobj.drawdot(_this.rightViewPosition, false);
                if (_this.drawSelect.selectend == 1) {
                    _this.drawSelect.endingBar.setLeft(_this.canvasline.width - Math.floor((_this.rightViewPosition - _this.drawSelect.selectrpend) / 2));
                }
                _this.drawSelect.showselect();
                _this.updateBarTool();
                return;
            }
            if (_this.rightViewPosition - value < _this.data.index) {
                _viewposition = _this.rightViewPosition - value;
                _this.drawobj.drawdot(_this.rightViewPosition, false);
            }
            else {
                _viewposition = _this.data.index;
                _this.drawobj.drawdot(_this.rightViewPosition, false);
            }
            _this.updateBarTool();
            _this.rightViewPosition = _viewposition;
            if (_this.drawSelect.selectend == 1 && _this.rightViewPosition - _this.drawSelect.selectrpend > -2) {
                _this.drawSelect.endingBar.setLeft(_this.canvasline.width - Math.floor((_this.rightViewPosition - _this.drawSelect.selectrpend) / 2));
            }
            else {
            }
            _this.drawSelect.showselect();
            _this.drawobj.drawdot(_this.rightViewPosition, false);
        });
        utils_1.event.emit('suit:afterInit', this);
        this.initFlag = true;
    };
    Suit.prototype.createLine = function () {
        if (this.rowline)
            return;
        var barTool = this.barTool;
        var lineTool = (this.lineTool = barTool.createHLine('blue'));
        var rowline = lineTool.rowline, addDot = lineTool.addDot, setBase = lineTool.setBase;
        this.rowline = rowline.on('change:y', function (v) {
            console.log('rowline', v);
        });
        var dot0 = addDot({ left: 10 });
        var dot1 = addDot({ left: 100 });
        rowline.setStyle('background', '#FFCC99');
        dot0.setStyle('border-right-color', '#AA33AA');
        dot0.setStyle('border-bottom-color', '#AA33AA');
        dot1.setStyle('border-left-color', '#FF2233');
        dot1.setStyle('border-bottom-color', '#FF2233');
        dot0.on('change:x', function (v) {
            console.log('dot0', v);
        });
        dot1.on('change:x', function (v) {
            console.log('dot1', v);
        });
        var dot2 = addDot({ left: 100 });
        dot2.setVisibility(false);
        setBase(200);
        lineTool.toggleVisibility();
    };
    Suit.prototype.updateBarTool = function () {
        this.drawSelect.updateSelectCur();
        var len = 100;
        if (this.data.index < this.canvasline.width * 4) {
            len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
        }
        this.toolbarposition = Math.floor(((this.canvasline.width - len) * (this.rightViewPosition - this.canvasline.width * 2)) /
            (this.data.index - this.canvasline.width * 2));
        this.barTool.setBarLeft(this.toolbarposition, false);
    };
    Suit.prototype.itemAlarm = function (text) {
        if (this.ctgconfig.alarm_enable && this.checkdragtimestamp()) {
            utils_1.event.emit('item:alarm', this.data.id, 2, text);
        }
    };
    Suit.prototype.alarmLow = function (fetalIndex) {
        var key = 'alarmLowCount' + fetalIndex;
        this[key] = this[key] || [];
        var arr = this[key];
        arr.push(0);
        var text = "FHR" + (fetalIndex + 1) + "\u5FC3\u7387\u8FC7\u4F4E";
        if (arr.length >= 2 * this.ctgconfig.alarm_delay) {
            this.itemAlarm(text);
            this.lazyEmit('alarmOn', text);
            return true;
        }
    };
    Suit.prototype.alarmHigh = function (fetalIndex) {
        var key = 'alarmHighCount' + fetalIndex;
        this[key] = this[key] || [];
        var arr = this[key];
        arr.push(0);
        if (arr.length >= 2 * this.ctgconfig.alarm_delay) {
            var text = "FHR" + (fetalIndex + 1) + "\u5FC3\u7387\u8FC7\u9AD8";
            this.itemAlarm(text);
            this.lazyEmit('alarmOn', text);
            return true;
        }
    };
    Suit.prototype.alarmOff = function (fetalIndex) {
        var _this = this;
        if (typeof fetalIndex === 'number') {
            this.lazyEmit('alarmOff', '');
            var key = 'alarmLowCount' + fetalIndex;
            this[key] = [];
        }
        else {
            this.data && Array(this.data.fetal_num).fill(0).forEach(function (_, i) {
                var key = 'alarmLowCount' + i;
                _this[key] = [];
            });
        }
    };
    Suit.prototype.checkAlarm = function (fetalIndex, cv) {
        if (this.data.isWorking) {
            if (cv <= 241 && cv > this.ctgconfig.alarm_high) {
                this.alarmHigh(fetalIndex);
                return true;
            }
            else if (cv < this.ctgconfig.alarm_low && cv >= 29) {
                this.alarmLow(fetalIndex);
                return true;
            }
            else {
                this.alarmOff(fetalIndex);
                return false;
            }
        }
    };
    Suit.prototype.destroy = function () {
        this.intervalIds.forEach(function (_) { return clearInterval(_); });
        this.canvasgrid = null;
        this.canvasdata = null;
        this.contextgrid = null;
        this.contextdata = null;
        this.canvasline = null;
        this.contextline = null;
        this.wrap = null;
        this.drawobj = null;
        this.barTool = null;
    };
    Suit.prototype._resize = function () {
        if (this.wrap) {
            var _a = this.wrap.getBoundingClientRect(), width_1 = _a.width, height_1 = _a.height;
            if (this.type > 0 && width_1 < 200) {
                Object.values(this).forEach(function (_) { return _ && _.resize && _.resize(width_1, height_1); });
            }
            else {
                Object.values(this).forEach(function (_) { return _ && _.resize && _.resize(width_1, height_1); });
            }
        }
    };
    Suit.prototype.setfetalposition = function (fhr1, fhr2, fhr3) {
        if (this.data && this.data.fetalposition) {
            this.data.fetalposition.fhr1 = fhr1;
            this.data.fetalposition.fhr2 = fhr2;
            this.data.fetalposition.fhr3 = fhr3;
        }
    };
    Suit.prototype.movescoller = function () { };
    Suit.prototype.InitFileData = function (oriobj) {
        var CTGDATA = {
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
            var pureidarr = oriobj.docid.split('_');
            var pureid = pureidarr[2];
            CTGDATA.starttime = utils_2.convertstarttime(pureid);
        }
        if (typeof oriobj.fetalposition != 'undefined' &&
            oriobj.fetalposition != null &&
            oriobj.fetalposition != '') {
            var positionobj = JSON.parse(oriobj.fetalposition);
            CTGDATA.fetalposition = positionobj;
        }
        Object.keys(oriobj).forEach(function (key) {
            var oridata = oriobj[key];
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
            for (var i = 0; i < CTGDATA.index; i++) {
                if (typeof oridata != 'string' || oridata.length < 2) {
                    return;
                }
                var hexBits = oridata.substring(0, 2);
                var data_to_push = parseInt(hexBits, 16);
                if (key === 'fhr1') {
                    CTGDATA.fhr[0][i] = data_to_push;
                }
                else if (key === 'fhr2') {
                    CTGDATA.fhr[1][i] = data_to_push;
                }
                else if (key === 'fhr3') {
                    CTGDATA.fhr[2][i] = data_to_push;
                }
                else if (key === 'toco') {
                    CTGDATA.toco[i] = data_to_push;
                }
                else if (key === 'fm') {
                    CTGDATA.fm[i] = data_to_push;
                }
                else if (key === 'fmp') {
                    CTGDATA.fmp[i] = data_to_push > 18 ? 98 : (data_to_push + 80);
                }
                oridata = oridata.substring(2, oridata.length);
            }
        });
        return CTGDATA;
    };
    Suit.prototype.drawdot = function () {
        if (this.data.starttime &&
            this.data.starttime != '' &&
            this.data.status === WsService_1.BedStatus.Working &&
            this.data.index > 0 &&
            this.isOn) {
            if (isNaN(this.data.csspan))
                return;
            this.curr = (+new Date() - +new Date(this.data.starttime)) / 1000 * 4 + this.data.csspan;
            if (this.curr < 0)
                return;
            this.drawobj.drawdot(this.curr, true);
            this.rightViewPosition = this.curr;
            if (this.data.index > this.canvasline.width * 2) {
                if (this.data.index < this.canvasline.width * 4) {
                    var len = Math.floor((this.canvasline.width * 4 - this.data.index) / 2);
                    this.barTool.setBarWidth(len);
                }
                else {
                    this.barTool.setBarWidth(100);
                }
                this.barTool.setBarLeft(this.canvasline.width, false);
            }
            else {
                this.barTool.setBarWidth(0);
            }
        }
        else {
            this.alarmOff();
            this.drawobj.showcur(this.data.index + 2, false);
            this.drawobj.drawdot(this.data.index + 2, false);
        }
    };
    Suit.prototype.timerCtg = function (dely) {
        var _this = this;
        var id = setInterval(function () {
            if (!_this) {
                clearInterval(id);
            }
            if (_this.checkdragtimestamp()) {
                if (_this.drawSelect.selectstartposition != 0) {
                    _this.drawSelect.startingBar.setLeft(0);
                }
                _this.drawdot();
            }
        }, dely);
        this.intervalIds.push(id);
    };
    Suit.prototype.checkdragtimestamp = function () {
        var curstamp = new Date().getTime();
        return curstamp - this.dragtimestamp > this.interval;
    };
    Suit.prototype.onStatusChange = function (status) {
        return status;
    };
    Suit.prototype.getoffline = function () {
        var _this = this;
        var doc_id = this.data.docid;
        var offlineend = this.data.past;
        if (!this.requestflag && this.type == 0 && this.data.past > 0) {
            this.requestflag = true;
            request_1.default.get("/ctg-exams-data/" + doc_id).then(function (responseData) {
                if (responseData) {
                    _this.initfhrdata(responseData, _this.data, offlineend);
                    _this.data.past = 0;
                }
            }).finally(function () { return _this.requestflag = false; });
        }
        utils_1.event.emit('suit:keepData');
    };
    Suit.prototype.initfhrdata = function (data, localData, offindex) {
        Object.keys(data).forEach(function (key) {
            var oridata = data[key];
            if (!oridata) {
                return;
            }
            for (var i = 0; i < offindex; i++) {
                var hexBits = oridata.substring(0, 2);
                var data_to_push = parseInt(hexBits, 16);
                if (key === 'fhr1') {
                    localData.fhr[0][i] = data_to_push;
                }
                else if (key === 'fhr2') {
                    if (localData.fhr[1])
                        localData.fhr[1][i] = data_to_push;
                }
                else if (key === 'fhr3') {
                    if (localData.fhr[2])
                        localData.fhr[2][i] = data_to_push;
                }
                else if (key === 'toco') {
                    localData.toco[i] = data_to_push;
                }
                else if (key === 'fm') {
                    localData.fm[i] = data_to_push;
                }
                oridata = oridata.substring(2, oridata.length);
            }
        });
    };
    Suit.prototype.getPointType = function (x, y) {
        var _a = this.drawAnalyse, analysisData = _a.analysisData, mapXtoY = _a.mapXtoY, mapBaselilneXtoY = _a.mapBaselilneXtoY;
        x = Math.round(x);
        var mKeys = Object.keys(mapBaselilneXtoY).map(function (_) { return Number(_); });
        var edge = 10;
        if (analysisData) {
            if (this.isCheckBaelinePoint) {
                var idx = mKeys.findIndex(function (_) { return Math.abs(x - _) <= edge && Math.abs(y - mapBaselilneXtoY[_]) <= edge; });
                if (idx > -1) {
                    this.drawAnalyse.baselinePointIndex = this.drawAnalyse.mapBaselilneXtoIndex[mKeys[idx]];
                    console.log('idx', this.drawAnalyse.baselinePointIndex, mapBaselilneXtoY);
                    return 'BaselinePoint';
                }
            }
            else {
                var _b = analysisData.analysis, acc = _b.acc, dec = _b.dec;
                var target = acc.find(function (_) { return (x < _.x + edge) && (x >= _.x); }) || dec.find(function (_) { return (x < _.x + edge * 2) && (x >= _.x); });
                console.log('click', x, y, target);
                if (target && (y <= (target.y + 2 * edge) && y > (target.y))) {
                    var isDec = 'type' in target;
                    this.drawAnalyse.pointToEdit = target;
                    return isDec ? 'EditDecPoint' : 'EditAccPoint';
                }
                var linePoint = mapXtoY[x];
                var leftIndex = mKeys.reduce(function (index, _) {
                    var left = mKeys[index];
                    var right = mKeys[index + 1];
                    if (right === undefined) {
                        return;
                    }
                    if (left <= x) {
                        if (x <= right) {
                            return index;
                        }
                        else {
                            return index + 1;
                        }
                    }
                    else {
                        return;
                    }
                }, 0);
                console.log('click', x, y, linePoint);
                if (typeof leftIndex === 'number' && linePoint && Math.abs(y - linePoint.y) < 8) {
                    var x1 = mKeys[leftIndex];
                    var x2 = mKeys[leftIndex + 1];
                    var y1 = mapBaselilneXtoY[x1];
                    var y2 = mapBaselilneXtoY[x2];
                    var k = (y2 - y1) / (x2 - x1);
                    var b = y1 - x1 * k;
                    var baseY = x * k + b;
                    var type = (linePoint.y - baseY) < 0 ? 'MarkAccPoint' : 'MarkDecPoint';
                    this.drawAnalyse.pointToInsert = { type: type, index: linePoint.index };
                    return type;
                }
            }
        }
        return null;
    };
    Suit.prototype.getBaseY = function (x) {
        var _a = this.drawAnalyse, analysisData = _a.analysisData, mapBaselilneXtoY = _a.mapBaselilneXtoY;
        x = Math.round(x);
        if (analysisData) {
            var mKeys_1 = Object.keys(mapBaselilneXtoY).map(function (_) { return Number(_); });
            var leftIndex = mKeys_1.reduce(function (index, _) {
                var left = mKeys_1[index];
                var right = mKeys_1[index + 1];
                if (right === undefined) {
                    return;
                }
                if (left <= x) {
                    if (x <= right) {
                        return index;
                    }
                    else {
                        return index + 1;
                    }
                }
                else {
                    return;
                }
            }, 0);
            if (typeof leftIndex === 'number') {
                var x1 = mKeys_1[leftIndex];
                var x2 = mKeys_1[leftIndex + 1];
                var y1 = mapBaselilneXtoY[x1];
                var y2 = mapBaselilneXtoY[x2];
                var k = (y2 - y1) / (x2 - x1);
                var b = y1 - x1 * k;
                var baseY = x * k + b;
                return baseY;
            }
        }
        return null;
    };
    return Suit;
}(Draw_1.default));
exports.Suit = Suit;
//# sourceMappingURL=Suit.js.map