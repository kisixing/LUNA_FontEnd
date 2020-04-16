"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var Queue_1 = __importDefault(require("../Ecg/Queue"));
exports.mapStatusToColor = (_a = {},
    _a[types_1.BedStatus.Offline] = '#f4511e',
    _a[types_1.BedStatus.Stopped] = '#bdbdbd ',
    _a[types_1.BedStatus.OfflineStopped] = '#bdbdbd ',
    _a[types_1.BedStatus.Working] = '#43a047',
    _a);
exports.mapStatusToText = (_b = {},
    _b[types_1.BedStatus.Offline] = '离线',
    _b[types_1.BedStatus.Stopped] = '停止',
    _b[types_1.BedStatus.OfflineStopped] = '停止',
    _b[types_1.BedStatus.Working] = '监护中',
    _b);
var MAX_SIZE = 4 * 3600 * 24 * 1;
function getMaxArray() {
    return new Uint8Array(MAX_SIZE);
}
exports.getMaxArray = getMaxArray;
function getEmptyCacheItem(base) {
    if (base === void 0) { base = { fetal_num: 1 }; }
    var fetal_num = base.fetal_num;
    return Object.assign({
        fhr: Array(fetal_num).fill(0).map(function () { return getMaxArray(); }),
        toco: getMaxArray(),
        fm: getMaxArray(),
        index: 0,
        length: 0,
        start: -1,
        last: 0,
        past: 0,
        timestamp: 0,
        docid: '',
        status: types_1.BedStatus.Offline,
        orflag: true,
        starttime: '',
        pregnancy: null,
        fetalposition: { fhr1: '', fhr2: '', fhr3: '' },
        fetal_num: 1,
        csspan: NaN,
        ismulti: false,
        ecg: new Queue_1.default(),
        ecgdata: getMaxArray(),
        is_include_volume: false,
        is_include_tocozero: false
    }, base);
}
exports.getEmptyCacheItem = getEmptyCacheItem;
function cleardata(datacache, curid, fetal_num) {
    var target = datacache.get(curid);
    var empty = getEmptyCacheItem({ fetal_num: fetal_num, fhr: Array(fetal_num).fill(0).map(function () { return getMaxArray(); }) });
    if (target) {
        Object.assign(target, empty);
    }
    else {
        datacache.set(curid, empty);
    }
}
exports.cleardata = cleardata;
function convertstarttime(pureid) {
    if (!pureid)
        return new Date().toLocaleDateString();
    var t = ["/", "/", " ", ":", ":", ""];
    return '20' + pureid.split('').reduce(function (a, b, i) {
        return "" + a + b + (i & 1 ? t[~~(i / 2)] : '');
    }, '');
}
exports.convertstarttime = convertstarttime;
//# sourceMappingURL=utils.js.map