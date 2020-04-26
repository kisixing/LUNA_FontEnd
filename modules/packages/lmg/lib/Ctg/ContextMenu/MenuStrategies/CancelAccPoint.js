"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_1 = __importDefault(require("react"));
exports.default = (function (props) {
    var fn = function (marked) {
        if (marked === void 0) { marked = true; }
        props.s.current.drawAnalyse.cancelPoint();
    };
    return (react_1.default.createElement(antd_1.Menu, null,
        react_1.default.createElement(antd_1.Menu.Item, { key: "2", onClick: function (e) { return fn(false); } }, "\u53D6\u6D88\u6807\u8BB0")));
});
//# sourceMappingURL=CancelAccPoint.js.map