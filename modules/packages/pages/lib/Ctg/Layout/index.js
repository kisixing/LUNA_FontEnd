"use strict";
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
var antd_1 = require("antd");
var Item_1 = __importDefault(require("./Item"));
var Home = function (props) {
    var onSelect = props.onSelect, borderedId = props.borderedId, _a = props.borderedColor, borderedColor = _a === void 0 ? 'black' : _a, loading = props.loading, _b = props.listLayout, listLayout = _b === void 0 ? [] : _b, fullScreenId = props.fullScreenId, contentHeight = props.contentHeight, RenderIn = props.RenderIn, RenderMaskIn = props.RenderMaskIn, items = props.items, onClose = props.onClose, _c = props.themeColor, themeColor = _c === void 0 ? 'skyblue' : _c;
    var wrap = react_1.useRef(null);
    var empty = react_1.useRef(null);
    var itemSpan = 24 / listLayout[1];
    var outPadding = 4;
    var itemHeight = (contentHeight - outPadding * 2) / listLayout[0];
    return (react_1.default.createElement("div", { style: { height: '100%' }, ref: wrap }, loading ? (react_1.default.createElement(antd_1.Spin, { spinning: loading, size: "large", style: { paddingTop: 100, width: '100%' } })) : react_1.default.createElement(antd_1.Row, { justify: "start", align: "top", style: { padding: outPadding, maxHeight: contentHeight, overflowY: items.length > (listLayout[0] * listLayout[1]) ? 'scroll' : 'hidden' } }, items.length ? items.map(function (item) {
        var data = item.data, bedname = item.bedname, unitId = item.unitId, id = item.id;
        var pregnancy = data.pregnancy, docid = data.docid, starttime = data.starttime, status = data.status, ismulti = data.ismulti;
        var safePregnancy = pregnancy || { age: null, name: null, bedNO: null, GP: null, gestationalWeek: null, telephone: null };
        var startTime = starttime;
        return (react_1.default.createElement(Item_1.default, { borderedColor: borderedColor, onClose: onClose, themeColor: themeColor, itemData: item, bedname: bedname, unitId: unitId, bordered: borderedId === unitId, key: id, onSelect: onSelect, data: data, RenderMaskIn: RenderMaskIn, ismulti: ismulti, docid: docid, status: status, loading: false, pregnancy: safePregnancy, startTime: startTime, itemHeight: itemHeight, itemSpan: itemSpan, outPadding: outPadding, fullScreenId: fullScreenId }, RenderIn && react_1.default.createElement(RenderIn, { itemData: item })));
    }) : (react_1.default.createElement("div", { ref: empty, style: { marginTop: 200, display: 'flex', justifyContent: 'center', width: '100%' } },
        react_1.default.createElement(antd_1.Empty, { description: "\u80CE\u76D1\u5DE5\u4F5C\u7AD9" }))))));
};
exports.default = react_1.memo(Home);
//# sourceMappingURL=index.js.map