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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var getErrData_1 = __importDefault(require("./getErrData"));
var Request_1 = __importDefault(require("./Request"));
var store_1 = __importDefault(require("store"));
var utils_1 = require("@lianmed/utils");
var reasons_1 = __importDefault(require("./reasons"));
var R = (function (_super) {
    __extends(R, _super);
    function R() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.TOKEN_KEY = utils_1.TOKEN_KEY;
        _this.hasConfiged = false;
        _this.configure = {};
        _this.config = function (configs) {
            if (configs === void 0) { configs = {}; }
            var hasConfiged = _this.hasConfiged;
            if (hasConfiged) {
                console.warn("couldn't config twice");
            }
            _this.hasConfiged = true;
            var _a = configs.Authorization, Authorization = _a === void 0 ? store_1.default.get(utils_1.TOKEN_KEY) || '' : _a;
            Object.assign(_this.configure, configs, { Authorization: Authorization });
            _this.init(_this.configure);
            _this._request.interceptors.request.use(function (url, options) {
                Authorization &&
                    (options.headers.Authorization =
                        Authorization.indexOf('Bearer') < 0 ? "Bearer " + Authorization : Authorization);
                return { url: url, options: options };
            });
            _this._request.interceptors.response.use(function (response, options) {
                var successText = options.successText, hideErr = options.hideErr;
                var errorData = getErrData_1.default(response);
                var status = errorData.status, errortext = errorData.errortext, url = errorData.url, data = errorData.data;
                if ([200, 201, 204, 304].includes(status)) {
                    successText && antd_1.message.success(successText);
                }
                else {
                    var r_1 = reasons_1.default[Math.floor(Math.random() * reasons_1.default.length)];
                    data.then(function (_a) {
                        var _b = (_a === void 0 ? { title: r_1 } : _a).title, title = _b === void 0 ? r_1 : _b;
                        if (status === 401) {
                            antd_1.notification.error({
                                message: '未登录或登录已过期，请重新登录。',
                            });
                        }
                        if (!hideErr) {
                            antd_1.notification.error({
                                message: "\u8BF7\u6C42\u9519\u8BEF " + status + ": " + url,
                                description: "\u539F\u56E0\uFF1A" + title,
                            });
                        }
                        else {
                            console.error('Network Error', "\u8BF7\u6C42\u9519\u8BEF " + status + ": " + url + ": " + errortext);
                        }
                    });
                }
                return response;
            });
            return _this;
        };
        _this.authenticate = function (params, c) {
            if (c === void 0) { c = {}; }
            var options = __assign({ data: params }, c);
            return _this._request.post("/authenticate", options).then(function (r) {
                if (r && r.id_token) {
                    var Authorization = r.id_token;
                    _this.config(__assign({ Authorization: Authorization }, c));
                    store_1.default.set(utils_1.TOKEN_KEY, Authorization);
                    return true;
                }
                else {
                    throw '非标准登陆';
                }
            });
        };
        return _this;
    }
    return R;
}(Request_1.default));
var r = new R();
var get = r.get, post = r.post, put = r.put, config = r.config;
exports.get = get;
exports.post = post;
exports.put = put;
exports.config = config;
exports.default = r;
//# sourceMappingURL=index.js.map