"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var cascade_search_1 = require("./cascade-search");
exports.useCascadeSelect = function (_a) {
    var _b = _a.list, list = _b === void 0 ? [] : _b, _c = _a.autoFirstSearch, autoFirstSearch = _c === void 0 ? true : _c, form = _a.form;
    var _d = cascade_search_1.useCascadeSearch({
        list: list.map(function (item) { return function (lastValue) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return item.options.apply(item, args);
        }; }),
    }), search = _d.search, responseDataList = _d.responseDataList, loadingList = _d.loadingList, setResponseDataList = _d.setResponseDataList;
    var selects = list.map(function (item, index) {
        var options = responseDataList[index] || [];
        return {
            props: {
                loading: loadingList[index],
                onChange: function (val) {
                    if (val) {
                        search(index + 1, val);
                    }
                    if (form) {
                        var values = {};
                        for (var i = index + 1; i < list.length; i += 1) {
                            values[list[i].name] = undefined;
                        }
                        var nextResponseDataList = responseDataList.slice(0, index + 1);
                        form.setFieldsValue(values);
                        setResponseDataList(nextResponseDataList);
                    }
                },
            },
            options: options,
        };
    });
    react_1.useEffect(function () {
        if (autoFirstSearch && !responseDataList[0]) {
            search(0);
        }
    }, []);
    return {
        search: search,
        selects: selects,
    };
};
