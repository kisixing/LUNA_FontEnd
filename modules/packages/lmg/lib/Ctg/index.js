"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var Suit_1 = require("./Suit");
var ScrollBar_1 = __importDefault(require("../ScrollBar"));
var Ecg_1 = __importDefault(require("../Ecg"));
var useDraw_1 = __importDefault(require("../useDraw"));
var Loading_1 = require("./Loading");
var WsService_1 = require("../services/WsService");
var ButtonTools_1 = require("./ButtonTools");
exports.default = react_1.forwardRef(function (props, ref) {
    var data = props.data, _a = props.mutableSuitObject, mutableSuitObject = _a === void 0 ? { suit: null } : _a, _b = props.suitType, suitType = _b === void 0 ? 0 : _b, _c = props.showEcg, showEcg = _c === void 0 ? false : _c, _d = props.loading, loading = _d === void 0 ? false : _d, _e = props.onReady, onReady = _e === void 0 ? function (s) { } : _e, others = __rest(props, ["data", "mutableSuitObject", "suitType", "showEcg", "loading", "onReady"]);
    var barTool = react_1.useRef(null);
    var canvasgrid = react_1.useRef(null);
    var canvasdata = react_1.useRef(null);
    var canvasline = react_1.useRef(null);
    var canvasselect = react_1.useRef(null);
    var canvasanalyse = react_1.useRef(null);
    var box = react_1.useRef(null);
    var ctgBox = react_1.useRef(null);
    var ctg = react_1.useRef(null);
    var ecg = react_1.useRef(null);
    var _f = react_1.useState(0), ecgHeight = _f[0], setEcgHeight = _f[1];
    var _g = react_1.useState(false), showBtns = _g[0], setShowBtns = _g[1];
    var staticType = suitType > 0;
    useDraw_1.default(data, ctgBox, function () {
        var instance = ctg.current = new Suit_1.Suit(canvasgrid.current, canvasdata.current, canvasline.current, canvasselect.current, canvasanalyse.current, ctgBox.current, barTool.current, suitType);
        onReady(instance);
        mutableSuitObject.suit = instance;
        return instance;
    }, function () {
        var height = box.current.getBoundingClientRect().height;
        var h = height / 5;
        var t = h > 40 ? (h > 200 ? 200 : 40) : (26);
        setTimeout(function () { return setEcgHeight(t); }, 100);
    });
    WsService_1.useCheckNetwork(function (isOn) { return ctg.current && (ctg.current.isOn = isOn); });
    react_1.useImperativeHandle(ref, function () { return ({
        on: function (e, fn) {
            return ctg.current && ctg.current.on(e, fn);
        },
        off: function (e, fn) {
            return ctg.current && ctg.current.off(e, fn);
        },
        emit: function (e) {
            var _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return ctg.current && (_a = ctg.current).emit.apply(_a, __spreadArrays([e], args));
        },
        getSuit: function () {
            return ctg.current;
        }
    }); });
    var canvasStyles = { position: 'absolute' };
    return (react_1.default.createElement("div", __assign({ style: { width: '100%', height: '100%' }, ref: box }, others, { onContextMenu: function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(e);
            return false;
        }, onMouseEnter: function () { return staticType && setShowBtns(true); }, onMouseLeave: function () { return staticType && setShowBtns(false); } }),
        loading && (react_1.default.createElement("div", { style: { position: 'absolute', width: '100%', height: '100%', background: '#fff', zIndex: 1, opacity: .9 } },
            react_1.default.createElement(Loading_1.Loading, { style: { margin: 'auto', position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 } }))),
        react_1.default.createElement("div", { style: { height: ecgHeight && showEcg ? "calc(100% - " + ecgHeight + "px)" : "100%", position: 'relative' }, ref: ctgBox },
            react_1.default.createElement("canvas", { style: canvasStyles, ref: canvasgrid }),
            react_1.default.createElement("canvas", { style: canvasStyles, ref: canvasline }),
            react_1.default.createElement("canvas", { style: canvasStyles, ref: canvasdata }),
            react_1.default.createElement("canvas", { style: canvasStyles, ref: canvasselect }),
            react_1.default.createElement("canvas", { style: canvasStyles, ref: canvasanalyse })),
        ecgHeight && showEcg && (react_1.default.createElement("div", { style: { height: ecgHeight, overflow: 'hidden' } },
            react_1.default.createElement(Ecg_1.default, { data: data, onReady: function (e) { return ecg.current = e; } }))),
        react_1.default.createElement(ScrollBar_1.default, { box: box, getBarTool: function (tool) { barTool.current = tool; } }),
        suitType > 100 && react_1.default.createElement(ButtonTools_1.ButtonTools, { ctg: ctg, visible: showBtns && staticType })));
});
