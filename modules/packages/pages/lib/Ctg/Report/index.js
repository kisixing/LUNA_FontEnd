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
var Ctg_1 = __importDefault(require("./Ctg"));
var Panel_1 = __importDefault(require("./Panel"));
exports.Context = react_1.default.createContext({});
var useCtgData_1 = __importDefault(require("../Analyse/useCtgData"));
var PrintPreview = function (props) {
    var docid = props.docid, _a = props.empId, empId = _a === void 0 ? null : _a;
    var _b = react_1.useState({ w: 0, h: 0 }), wh = _b[0], setWh = _b[1];
    react_1.useLayoutEffect(function () {
        var _a = inputEl.current, clientHeight = _a.clientHeight, clientWidth = _a.clientWidth;
        setWh({ h: clientHeight, w: clientWidth });
    }, []);
    var _c = useCtgData_1.default(docid), ctgData = _c.ctgData, loading = _c.loading, fetal = _c.fetal, setFetal = _c.setFetal;
    var inputEl = react_1.useRef(null);
    var v = react_1.useRef(null);
    return (react_1.default.createElement(exports.Context.Provider, { value: v },
        react_1.default.createElement("div", { style: { height: '100%' }, ref: inputEl },
            react_1.default.createElement("div", { style: { height: 240, textAlign: 'center' } },
                react_1.default.createElement(Panel_1.default, __assign({ wh: wh }, props, { empId: empId, fetal: fetal, setFetal: setFetal, fetalcount: ctgData && Number(ctgData.fetalnum) }))),
            react_1.default.createElement("div", { style: {
                    height: "calc(100% - 250px)",
                    padding: 24,
                    marginTop: 12,
                    border: '1px solid #d9d9d9',
                } },
                react_1.default.createElement(Ctg_1.default, { ctgData: ctgData, loading: loading })))));
};
exports.default = PrintPreview;
//# sourceMappingURL=index.js.map