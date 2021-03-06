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
var Draw_1 = __importDefault(require("../../Draw"));
var utils_1 = require("@lianmed/utils");
var resultMap = ['正常', '可疑', '异常', '时长不足'];
var DrawAnalyse = (function (_super) {
    __extends(DrawAnalyse, _super);
    function DrawAnalyse(wrap, canvas, suit) {
        var _this = _super.call(this, wrap, canvas) || this;
        _this.baselinePointIndex = -1;
        _this.mapXtoY = {};
        _this.mapBaselilneXtoY = {};
        _this.mapBaselilneXtoIndex = {};
        _this.autoFm = false;
        _this.drawflag = function (canvas, x, y, index) {
            _this.mapXtoY[x] = { y: y + _this.suit.drawobj.basetop, index: index };
            var _a = _this, context2D = _a.context2D, analyseData = _a.analysisData;
            if (!context2D || !analyseData)
                return;
            var _b = analyseData.analysis, acc = _b.acc, dec = _b.dec;
            var _acc = _this._acc;
            var _dec = _this._dec;
            context2D.textAlign = 'left';
            context2D.textBaseline = 'top';
            var txt = '';
            if (_acc.indexOf(index) > -1 || _acc.indexOf(index - 1) > -1) {
                var target = acc.find(function (_) { return [index, index - 1].includes(_.index); });
                target.x = x;
                target.y = y;
                if (target.marked) {
                    txt = "+";
                    canvas.font = '18px arial';
                    canvas.fillStyle = 'green';
                    canvas.fillText(txt, x + 1, y + 10);
                }
                else if (target.reliability > 45) {
                    if (!target.remove) {
                        txt = "+" + (target.reliability + "%");
                        canvas.font = '15px arial';
                        canvas.fillStyle = 'orange';
                        canvas.fillText(txt, x + 1, y + 10);
                    }
                }
            }
            else if (_dec.indexOf(index) > -1 || _dec.indexOf(index - 1) > -1) {
                var target = dec.find(function (_) { return [index, index - 1].includes(_.index); });
                target.x = x;
                target.y = y;
                txt = target ? target.type.toUpperCase() : '-';
                canvas.font = 'bold 15px arial';
                canvas.fillStyle = 'red';
                canvas.fillText(txt, x + 1, y + 20);
            }
        };
        _this.inRange = function (value, min, max) {
            var result = false;
            if (value >= min && value <= max)
                result = true;
            return result;
        };
        _this.countAcc = function (start, end) {
            var accnum = 0;
            var analysisData = _this.analysisData;
            if (!analysisData)
                return accnum;
            var analysis = analysisData.analysis;
            analysis.acc.map(function (item) {
                if (item.index > end) {
                    return accnum;
                }
                else if (item.index >= start) {
                    if (item.marked)
                        accnum++;
                }
            });
            return accnum;
        };
        _this.countDec = function (start, end, type) {
            var decnum = 0;
            var analysisData = _this.analysisData;
            if (!analysisData)
                return decnum;
            var analysis = analysisData.analysis;
            analysis.dec.map(function (item) {
                if (item.index > end) {
                    return decnum;
                }
                else if (item.index >= start) {
                    if (item.type.toUpperCase() == type && !item.remove)
                        decnum++;
                }
            });
            return decnum;
        };
        _this.cycleAcc = function () {
            var error = 8;
            var analysisData = _this.analysisData;
            if (!analysisData)
                return 0;
            var analysis = analysisData.analysis;
            if (analysis.acc.length < 3)
                return 0;
            var base = analysis.acc[1].index - analysis.acc[0].index;
            for (var i = 2; i < analysis.acc.length; i++) {
                var diff = analysis.acc[i].index - analysis.acc[i - 1].index;
                if (diff > base + error || diff < base - error) {
                    return 1;
                }
            }
            return 0;
        };
        _this.countFm = function (start, end) {
            var fmnum = 0;
            for (var i = start; i <= end; i++) {
                if (i % 2 == 1)
                    continue;
                if (_this.suit.data.fm[i] == 128 || _this.suit.data.fm[i] == 1) {
                    fmnum++;
                }
            }
            return fmnum;
        };
        _this.fhrDuration = function (start, end) {
            var accnum = 0;
            var sum = 0;
            var _a = _this, analysisData = _a.analysisData, data = _a.suit.data;
            if (!analysisData || !data)
                return accnum;
            var analysis = analysisData.analysis;
            analysis.acc.forEach(function (_) {
                if (_.index >= start) {
                    if (_.reliability > 50) {
                        sum += (_.end - _.start) > 0 ? _.end - _.start : 0;
                        accnum++;
                    }
                }
            });
            return accnum ? Math.ceil(sum / accnum / 4) : 0;
        };
        _this.fhrAmpl = function (start, end) {
            var accnum = 0;
            var sum = 0;
            var analysisData = _this.analysisData;
            if (!analysisData)
                return accnum;
            var analysis = analysisData.analysis;
            analysis.acc.map(function (item) {
                if (item.index > end) {
                    if (accnum == 0)
                        return accnum;
                    else {
                        return Math.ceil(sum / accnum);
                    }
                }
                else if (item.index >= start) {
                    if (item.marked) {
                        if (item.ampl != 0) {
                            sum += item.ampl;
                            accnum++;
                        }
                    }
                }
            });
            if (accnum == 0)
                return accnum;
            else {
                return Math.ceil(sum / accnum);
            }
        };
        _this.ctgscore = function (type) {
            var analysisData = _this.analysisData;
            if (!analysisData)
                return null;
            analysisData = JSON.parse(JSON.stringify(analysisData));
            var analysis = analysisData.analysis, score = analysisData.score;
            var fhrbaselineMinute = analysis.fhrbaselineMinute;
            var fhr_uptime = analysis._fhr_uptime = _this.fhrDuration(analysis.start, analysis.end);
            var acc_num = analysis._acc_num = _this.countAcc(analysis.start, analysis.end);
            var vdtimes = analysis.vdtimes = _this.countDec(analysis.start, analysis.end, 'VD');
            var ldtimes = analysis.ldtimes = _this.countDec(analysis.start, analysis.end, 'LD');
            var edtimes = analysis.edtimes = _this.countDec(analysis.start, analysis.end, 'ED');
            analysis._baseline_avg = ~~(fhrbaselineMinute.reduce(function (a, b) { return a + b; }, 0) / fhrbaselineMinute.length);
            analysis._dec_num = ldtimes + vdtimes + edtimes;
            var bhr = analysis.bhr;
            if (type == 'Nst') {
                score.nstdata.bhrvalue = bhr;
                if (bhr < 100)
                    score.nstdata.bhrscore = 0;
                else if (_this.inRange(bhr, 100, 109) || bhr > 160)
                    score.nstdata.bhrscore = 1;
                else if (_this.inRange(bhr, 110, 160)) {
                    score.nstdata.bhrscore = 2;
                }
                score.nstdata.ltvvalue = analysis.ltv;
                if (analysis.ltv < 5) {
                    score.nstdata.ltvscore = 0;
                }
                else if (_this.inRange(analysis.ltv, 5, 9) || analysis.ltv > 30) {
                    score.nstdata.ltvscore = 1;
                }
                else if (_this.inRange(analysis.ltv, 10, 30)) {
                    score.nstdata.ltvscore = 2;
                }
                score.nstdata.accdurationvalue = fhr_uptime;
                if (fhr_uptime < 10) {
                    score.nstdata.accdurationscore = 0;
                }
                else if (_this.inRange(fhr_uptime, 10, 14)) {
                    score.nstdata.accdurationscore = 1;
                }
                else if (fhr_uptime >= 15) {
                    score.nstdata.accdurationscore = 2;
                }
                var fhr_ampl = _this.fhrAmpl(analysis.start, analysis.end);
                ;
                score.nstdata.accamplvalue = fhr_ampl;
                if (fhr_ampl < 10) {
                    score.nstdata.accamplscore = 0;
                }
                else if (_this.inRange(fhr_ampl, 10, 14)) {
                    score.nstdata.accamplscore = 1;
                }
                else if (fhr_ampl >= 15) {
                    score.nstdata.accamplscore = 2;
                }
                var fmnum = _this.countFm(analysis.start, analysis.end);
                score.nstdata.fmvalue = fmnum;
                if (fmnum == 0) {
                    score.nstdata.fmscore = 0;
                }
                else if (_this.inRange(fmnum, 1, 2)) {
                    score.nstdata.fmscore = 1;
                }
                else if (fmnum >= 3) {
                    score.nstdata.fmscore = 2;
                }
                score.nstdata.total = score.nstdata.accamplscore + score.nstdata.accdurationscore + score.nstdata.bhrscore + score.nstdata.fmscore + score.nstdata.ltvscore;
                return _this.analysisData = analysisData;
            }
            else if (type == 'Krebs') {
                score.krebsdata.bhrvalue = bhr;
                if (bhr < 100 || bhr > 180) {
                    score.krebsdata.bhrscore = 0;
                }
                else if (_this.inRange(bhr, 100, 109) || _this.inRange(bhr, 161, 180)) {
                    score.krebsdata.bhrscore = 1;
                }
                else if (_this.inRange(bhr, 110, 160)) {
                    score.krebsdata.bhrscore = 2;
                }
                var zhenfu_tv = analysis.ltv;
                score.krebsdata.ltvvalue = zhenfu_tv;
                if (zhenfu_tv < 5) {
                    score.krebsdata.ltvscore = 0;
                }
                else if (_this.inRange(zhenfu_tv, 5, 9) || zhenfu_tv > 25) {
                    score.krebsdata.ltvscore = 1;
                }
                else if (_this.inRange(zhenfu_tv, 10, 25)) {
                    score.krebsdata.ltvscore = 2;
                }
                var zhouqi_tv = analysis.stv;
                score.krebsdata.stvvalue = zhouqi_tv;
                if (zhouqi_tv < 3) {
                    score.krebsdata.stvscore = 0;
                }
                else if (_this.inRange(zhouqi_tv, 3, 6)) {
                    score.krebsdata.stvscore = 1;
                }
                else if (zhouqi_tv > 6) {
                    score.krebsdata.stvscore = 2;
                }
                score.krebsdata.accvalue = acc_num;
                if (acc_num == 0) {
                    score.krebsdata.accscore = 0;
                }
                else if (_this.inRange(acc_num, 1, 4)) {
                    score.krebsdata.accscore = 1;
                }
                else if (acc_num > 4) {
                    score.krebsdata.accscore = 2;
                }
                var sum = ldtimes + vdtimes;
                if (sum > 1) {
                    score.krebsdata.decscore = 0;
                    score.krebsdata.decvalue = sum + "";
                }
                else if (sum == 1) {
                    score.krebsdata.decscore = 1;
                    score.krebsdata.decvalue = sum + "";
                }
                else {
                    score.krebsdata.decscore = 2;
                    if (edtimes > 0) {
                        score.krebsdata.decvalue = "早减";
                    }
                    else {
                        score.krebsdata.decvalue = "无";
                    }
                }
                var fmnum = _this.countFm(analysis.start, analysis.end);
                score.krebsdata.fmvalue = fmnum;
                if (fmnum == 0) {
                    score.krebsdata.fmscore = 0;
                }
                else if (_this.inRange(fmnum, 1, 4)) {
                    score.krebsdata.fmscore = 1;
                }
                else if (fmnum > 4) {
                    score.krebsdata.fmscore = 2;
                }
                score.krebsdata.total = score.krebsdata.bhrscore + score.krebsdata.accscore + score.krebsdata.decscore + score.krebsdata.ltvscore + score.krebsdata.stvscore + score.krebsdata.fmscore;
            }
            else if (type == 'Fischer') {
                score.fischerdata.bhrvalue = bhr;
                if (bhr < 100 || bhr > 180) {
                    score.fischerdata.bhrscore = 0;
                }
                else if (_this.inRange(bhr, 100, 109) || _this.inRange(bhr, 161, 180)) {
                    score.fischerdata.bhrscore = 1;
                }
                else if (_this.inRange(bhr, 110, 160)) {
                    score.fischerdata.bhrscore = 2;
                }
                var zhenfu_tv = analysis.ltv;
                score.fischerdata.ltvvalue = zhenfu_tv;
                if (zhenfu_tv < 5) {
                    score.fischerdata.ltvscore = 0;
                }
                else if (_this.inRange(zhenfu_tv, 5, 9) || zhenfu_tv > 30) {
                    score.fischerdata.ltvscore = 1;
                }
                else if (_this.inRange(zhenfu_tv, 10, 30)) {
                    score.fischerdata.ltvscore = 2;
                }
                var zhouqi_tv = analysis.stv;
                score.fischerdata.stvvalue = zhouqi_tv;
                if (zhouqi_tv < 3) {
                    score.fischerdata.stvscore = 0;
                }
                else if (_this.inRange(zhouqi_tv, 3, 6)) {
                    score.fischerdata.stvscore = 1;
                }
                else if (zhouqi_tv > 6) {
                    score.fischerdata.stvscore = 2;
                }
                score.fischerdata.accvalue = acc_num;
                if (acc_num == 0) {
                    score.fischerdata.accscore = 0;
                }
                else if (_this.inRange(acc_num, 1, 4)) {
                    score.fischerdata.accscore = 1;
                }
                else if (acc_num > 4) {
                    score.fischerdata.accscore = 2;
                }
                if (ldtimes > 0) {
                    score.fischerdata.decscore = 0;
                    score.fischerdata.decvalue = 'LD';
                }
                else if (vdtimes > 0) {
                    score.fischerdata.decscore = 1;
                    score.fischerdata.decvalue = 'VD';
                }
                else {
                    if (edtimes > 0) {
                        score.fischerdata.decvalue = 'ED';
                    }
                    else {
                        score.fischerdata.decvalue = '无';
                    }
                    score.fischerdata.decscore = 2;
                }
                score.fischerdata.total = score.fischerdata.bhrscore + score.fischerdata.accscore + score.fischerdata.decscore + score.fischerdata.ltvscore + score.fischerdata.stvscore;
            }
            else if (type == 'Cst') {
                score.cstdata.bhrvalue = bhr;
                if (bhr < 100 || bhr > 180) {
                    score.cstdata.bhrscore = 0;
                }
                else if (_this.inRange(bhr, 100, 109) || _this.inRange(bhr, 161, 180)) {
                    score.cstdata.bhrscore = 1;
                }
                else if (_this.inRange(bhr, 110, 160)) {
                    score.cstdata.bhrscore = 2;
                }
                var zhenfu_tv = analysis.ltv;
                score.cstdata.ltvvalue = zhenfu_tv;
                if (zhenfu_tv < 5) {
                    score.cstdata.ltvscore = 0;
                }
                else if (_this.inRange(zhenfu_tv, 5, 9) || zhenfu_tv > 30) {
                    score.cstdata.ltvscore = 1;
                }
                else if (_this.inRange(zhenfu_tv, 10, 30)) {
                    score.cstdata.ltvscore = 2;
                }
                var zhouqi_tv = analysis.stv;
                score.cstdata.stvvalue = zhouqi_tv;
                if (zhouqi_tv < 3) {
                    score.cstdata.stvscore = 0;
                }
                else if (_this.inRange(zhouqi_tv, 3, 6)) {
                    score.cstdata.stvscore = 1;
                }
                else if (zhouqi_tv > 6) {
                    score.cstdata.stvscore = 2;
                }
                if (acc_num == 0) {
                    score.cstdata.accscore = 0;
                    score.cstdata.accvalue = '无';
                }
                else if (_this.cycleAcc() == 1) {
                    score.cstdata.accscore = 1;
                    score.cstdata.accvalue = '周期性';
                }
                else {
                    score.cstdata.accscore = 2;
                    score.cstdata.accvalue = '散在性';
                }
                if (ldtimes > 0) {
                    score.cstdata.decscore = 0;
                    score.cstdata.decvalue = '晚期';
                }
                else if (edtimes > 0) {
                    score.cstdata.decscore = 0;
                    score.cstdata.decvalue = '其他';
                }
                else if (vdtimes > 0) {
                    score.cstdata.decscore = 1;
                    score.cstdata.decvalue = '变异减速';
                }
                else {
                    score.cstdata.decscore = 2;
                    score.cstdata.decvalue = '无';
                }
                score.cstdata.total = score.cstdata.bhrscore + score.cstdata.accscore + score.cstdata.decscore + score.cstdata.ltvscore + score.cstdata.stvscore;
            }
            else if (type == 'Sogc') {
                var length_1 = analysis.length;
                score.sogcdata.bhrvalue = bhr;
                if (_this.inRange(bhr, 110, 160))
                    score.sogcdata.bhrscore = 0;
                else if (_this.inRange(bhr, 100, 109) || bhr > 160)
                    score.sogcdata.bhrscore = 1;
                else if (bhr < 100) {
                    score.sogcdata.bhrscore = 2;
                }
                score.sogcdata.ltvvalue = analysis.ltv;
                if (analysis.ltv <= 5) {
                    if (length_1 < 40) {
                        score.sogcdata.ltvscore = 0;
                    }
                    else if (_this.inRange(length_1, 40, 80)) {
                        score.sogcdata.ltvscore = 1;
                    }
                    else {
                        score.sogcdata.ltvscore = 2;
                    }
                }
                else if (analysis.ltv >= 26 || analysis.sinusoid) {
                    score.sogcdata.ltvscore = 2;
                }
                else {
                    score.sogcdata.ltvscore = 0;
                }
                score.sogcdata.accvalue = acc_num;
                if (acc_num >= 2) {
                    score.sogcdata.accscore = 0;
                }
                else {
                    if (length_1 > 80) {
                        score.sogcdata.accscore = 2;
                    }
                    else if (_this.inRange(length_1, 40, 80)) {
                        score.sogcdata.accscore = 1;
                    }
                    else {
                        score.sogcdata.accscore = 3;
                    }
                }
                if (edtimes > 0) {
                    score.sogcdata.decvalue = 'ed';
                    score.sogcdata.decscore = 2;
                }
                else if (vdtimes > 0) {
                    var all_1 = analysis.dec.filter(function (_) { return _.type === 'vd' && _.start >= analysis.start && _.end <= analysis.end; });
                    var gt60 = all_1.find(function (_) { return _.duration > 60; });
                    var btw = all_1.find(function (_) { return _this.inRange(_.duration, 30, 60); });
                    if (gt60) {
                        score.sogcdata.decscore = 2;
                    }
                    else if (btw) {
                        score.sogcdata.decscore = 1;
                    }
                    score.sogcdata.decvalue = 'vd';
                }
                else {
                    score.sogcdata.decscore = 0;
                    score.sogcdata.decvalue = '无';
                }
                score.sogcdata.total = 0;
                var _a = score.sogcdata, bhrscore = _a.bhrscore, accscore = _a.accscore, decscore = _a.decscore, ltvscore = _a.ltvscore;
                var all = [bhrscore, accscore, decscore, ltvscore];
                if (all.some(function (_) { return _ === 2; })) {
                    score.sogcdata.total = 2;
                }
                else if (all.some(function (_) { return _ === 1; })) {
                    score.sogcdata.total = 1;
                }
                else if (all.some(function (_) { return _ === 3; })) {
                    score.sogcdata.total = 3;
                }
                score.sogcdata.result = resultMap[score.sogcdata.total];
            }
            else if (type == 'Cstoct') {
                score.cstoctdata.bhrvalue = bhr;
                if (_this.inRange(bhr, 110, 160))
                    score.cstoctdata.bhrscore = 0;
                else if (_this.inRange(bhr, 100, 109) || bhr > 160)
                    score.cstoctdata.bhrscore = 1;
                else if (bhr < 100) {
                    score.cstoctdata.bhrscore = 2;
                }
                score.cstoctdata.ltvvalue = analysis.ltv;
                if (analysis.ltv < 5) {
                    if (length < 40) {
                        score.cstoctdata.ltvscore = 2;
                    }
                    else if (_this.inRange(length, 40, 80)) {
                        score.cstoctdata.ltvscore = 1;
                    }
                    else {
                        score.cstoctdata.ltvscore = 0;
                    }
                }
                else if (_this.inRange(analysis.ltv, 5, 9) || analysis.ltv > 30) {
                    score.cstoctdata.ltvscore = 1;
                }
                else if (_this.inRange(analysis.ltv, 6, 25)) {
                    score.cstoctdata.ltvscore = 0;
                }
                if (!analysis.sinusoid) {
                    score.cstoctdata.sinusoidscore = 0;
                    score.cstoctdata.sinusoidvalue = '无';
                }
                else {
                    score.cstoctdata.sinusoidscore = 2;
                    score.cstoctdata.sinusoidvalue = '有';
                }
                if (acc_num == 0) {
                    score.cstoctdata.accvalue = '无';
                    score.cstoctdata.accscore = 2;
                }
                else if (_this.inRange(acc_num, 1, 2)) {
                    score.cstoctdata.accvalue = '刺激胎儿后仍缺失';
                    score.cstoctdata.accscore = 1;
                }
                else if (acc_num > 2) {
                    score.cstoctdata.accscore = 0;
                    score.cstoctdata.accvalue = '有';
                }
                score.cstoctdata.ldvalue = ldtimes || '无';
                score.cstoctdata.vdvalue = vdtimes || '无';
                score.cstoctdata.edvalue = edtimes || '无';
                if (ldtimes > 0) {
                    score.cstoctdata.decscore = 0;
                    score.cstoctdata.decvalue = 'LD';
                    score.cstoctdata.ldscore = 1;
                }
                else if (vdtimes > 0) {
                    score.cstoctdata.decscore = 1;
                    score.cstoctdata.decvalue = 'VD';
                    score.cstoctdata.vdscore = 1;
                    analysis.dec.map(function (item) {
                        if (item.type.toUpperCase() == 'VD') {
                            if (_this.inRange(item.duration, 30, 60)) {
                                score.cstoctdata.decscore = 1;
                                score.cstoctdata.decvalue = 'VD';
                                score.cstoctdata.vdscore = 1;
                            }
                            else if (item.duration > 60) {
                                score.cstoctdata.decscore = 0;
                                score.cstoctdata.decvalue = 'VD';
                                score.cstoctdata.vdscore = 2;
                            }
                        }
                    });
                }
                else {
                    if (edtimes > 0) {
                        score.cstoctdata.decvalue = 'ED';
                        score.cstoctdata.edscore = 1;
                    }
                    else {
                        score.cstoctdata.decvalue = '无';
                    }
                    score.cstoctdata.decscore = 2;
                }
                score.cstoctdata.total = 0;
                var _b = score.cstoctdata, bhrscore = _b.bhrscore, accscore = _b.accscore, sinusoidscore = _b.sinusoidscore, ltvscore = _b.ltvscore, ldscore = _b.ldscore, edscore = _b.edscore, vdscore = _b.vdscore;
                var all = [bhrscore, accscore, sinusoidscore, ltvscore, ldscore, edscore, vdscore];
                if (all.some(function (_) { return _ === 2; })) {
                    score.cstoctdata.total = 2;
                }
                else if (all.some(function (_) { return _ === 1; })) {
                    score.cstoctdata.total = 1;
                }
                else if (all.some(function (_) { return _ === 3; })) {
                    score.cstoctdata.total = 3;
                }
                score.cstoctdata.result = resultMap[score.cstoctdata.total];
            }
            return (_this.analysisData = analysisData);
        };
        _this.suit = suit;
        return _this;
    }
    DrawAnalyse.prototype.init = function () {
        this.analysisData = null;
    };
    DrawAnalyse.prototype.setData = function (r) {
        if (!r.analysis || !this.suit.data)
            return;
        var fmIndex = r.analysis.fm || [];
        var fm = this.suit.data.fm;
        var autoFmValue = this.autoFm ? 1 : 0;
        r.analysis.acc = r.analysis.acc && r.analysis.acc.map(function (_) { return (__assign(__assign({}, _), { duration: _.dataClean ? _.duration : _.duration / 4, dataClean: true })); });
        r.analysis.dec = r.analysis.dec && r.analysis.dec.map(function (_) { return (__assign(__assign({}, _), { duration: _.dataClean ? _.duration : _.duration / 4, dataClean: true })); }).filter(function (_) { return _.reliability >= 90 || _.user; });
        this._acc = r.analysis.acc.map(function (_) { return _.index; });
        this._dec = r.analysis.dec.map(function (_) { return _.index; });
        this.analysisData = r;
        fmIndex.forEach(function (_) {
            fm[_] = autoFmValue;
            fm[_ - 1] = autoFmValue;
        });
    };
    DrawAnalyse.prototype.drawBaseline = function (cur, color, yspan, xspan, max, basetop) {
        var _a = this, context2D = _a.context2D, width = _a.width, height = _a.height, analyseData = _a.analysisData;
        width = Math.floor(width);
        context2D && context2D.clearRect(0, 0, width, height);
        if (!analyseData || !this.showBase) {
            return;
        }
        var _b = analyseData.analysis, baseline = _b.fhrbaselineMinute, start = _b.start, end = _b.end;
        var lastx = 0;
        var leftViewposition = cur - width * 2 > 0 ? cur - width * 2 : 0;
        var curfhroffset = 0;
        context2D.beginPath();
        context2D.strokeStyle = color;
        context2D.lineWidth = 2;
        this.mapBaselilneXtoY = {};
        if (true) {
            var baselineoff = 0;
            var firstindex = Math.floor(leftViewposition / (xspan * 6));
            context2D.moveTo(baselineoff * xspan * 3, (max - curfhroffset - baseline[firstindex]) * yspan + basetop);
            for (var i = leftViewposition; i < cur; i++) {
                baselineoff = Math.ceil(i / (xspan * 6));
                if (baselineoff >= baseline.length - 1) {
                    break;
                }
                if ((i) % (xspan * 6) == 0) {
                    lastx = Math.floor((i - leftViewposition) / 2);
                    context2D.lineTo(lastx, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop);
                    this.mapBaselilneXtoIndex[lastx] = baselineoff;
                    this.mapBaselilneXtoY[lastx] = (max - curfhroffset - baseline[baselineoff]) * yspan + basetop;
                }
            }
            context2D.lineTo(cur, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop);
            context2D.stroke();
        }
        else if (leftViewposition < end) {
            var baselineoff = Math.ceil((leftViewposition - start) / (xspan * 6));
            var firstindex = baselineoff - 1 > 0 ? baselineoff - 1 : 0;
            context2D.moveTo(0, (max - curfhroffset - baseline[firstindex]) * yspan + basetop);
            for (var i = leftViewposition + 1; i < cur; i++) {
                baselineoff = Math.ceil((i - start) / (xspan * 6));
                if (baselineoff >= baseline.length - 1) {
                    break;
                }
                if ((i) % (xspan * 6) == 0) {
                    lastx = Math.floor((i - leftViewposition) / 2);
                    context2D.lineTo(lastx, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop);
                }
            }
            context2D.lineTo((end - leftViewposition) / 2, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop);
            context2D.stroke();
        }
    };
    DrawAnalyse.prototype.analyse = function (type, start, end, data) {
        if (data === void 0) { data = this.analysisData; }
        if (type) {
            this.type = type;
        }
        else {
            type = this.type;
        }
        if (!data)
            return;
        var suit = this.suit;
        this.setData(data);
        if (!start && !end && this.analysisData) {
            start = this.analysisData.analysis.start;
            end = this.analysisData.analysis.end;
        }
        console.log('analyse', type, start, end, data);
        suit.drawSelect.$selectrpend = data.analysis.end = end;
        suit.drawSelect.$selectrpstart = data.analysis.start = start;
        var newData = this.ctgscore(type);
        suit.drawobj.drawdot((suit.type > 0 && suit.viewposition < suit.width * 2) ? suit.width * 2 : suit.viewposition, false);
        console.log('setFormData', type, data, newData);
        utils_1.event.emit('suit:afterAnalyse', newData);
        return newData;
    };
    DrawAnalyse.prototype.revicePoint = function (x, y) {
        if (!this.analysisData)
            return;
        var edge = 20;
        var _a = this.analysisData.analysis, acc = _a.acc, dec = _a.dec;
        var target = acc.find(function (_) { return (x < _.x + edge) && (x > _.x - edge); }) || dec.find(function (_) { return (x < _.x + edge) && (x > _.x - edge); });
        if (target && (y < (target.y + edge) && y > (target.y - edge))) {
            var isAcc = 'reliability' in target;
            return isAcc ? '' : '';
        }
        return null;
    };
    DrawAnalyse.prototype.refresh = function () {
        this.analyse();
    };
    DrawAnalyse.prototype.markAccPoint = function () {
        if (!this.analysisData)
            return;
        var acc = this.analysisData.analysis.acc;
        acc.push({
            marked: true,
            index: this.pointToInsert.index,
            start: 0,
            end: 0,
            peak: 0,
            duration: 0,
            ampl: 0,
            reliability: 0,
            user: true
        });
        this.refresh();
    };
    DrawAnalyse.prototype.editAccPoint = function (marked) {
        if (marked === void 0) { marked = true; }
        if (!this.analysisData)
            return;
        var acc = this.analysisData.analysis.acc;
        var target = this.pointToEdit;
        target.marked = marked;
        target.remove = !marked;
        var user = target.user;
        if (user && !marked) {
            var index = acc.findIndex(function (_) { return _.index === target.index; });
            acc.splice(index, 1);
        }
        this.refresh();
    };
    DrawAnalyse.prototype.editBaselinePoint = function (n) {
        if (n === void 0) { n = 0; }
        if (!this.analysisData)
            return;
        var fhrbaselineMinute = this.analysisData.analysis.fhrbaselineMinute;
        var index = this.baselinePointIndex;
        fhrbaselineMinute[index] = fhrbaselineMinute[index] + n;
        this.refresh();
        this.baselinePointIndex = -1;
    };
    DrawAnalyse.prototype.markDecPoint = function (type) {
        if (!this.analysisData)
            return;
        var dec = this.analysisData.analysis.dec;
        dec.push({
            index: this.pointToInsert.index,
            type: type,
            start: 0,
            end: 0,
            peak: 0,
            duration: 0,
            ampl: 0,
            marked: true,
            user: true
        });
        this.refresh();
    };
    DrawAnalyse.prototype.editDecPoint = function (type) {
        if (!this.analysisData)
            return;
        var dec = this.analysisData.analysis.dec;
        var target = this.pointToEdit;
        var user = target.user;
        target.type = type;
        if (type == "ld" || type == "vd" || type == "ed") {
            target.remove = false;
        }
        else {
            target.remove = true;
        }
        if (user && !type) {
            var index = dec.findIndex(function (_) { return _.index === target.index; });
            dec.splice(index, 1);
        }
        this.refresh();
    };
    return DrawAnalyse;
}(Draw_1.default));
exports.DrawAnalyse = DrawAnalyse;
//# sourceMappingURL=DrawAnalyse.js.map