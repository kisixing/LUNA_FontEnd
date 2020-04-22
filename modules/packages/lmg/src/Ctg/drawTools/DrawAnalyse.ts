import { obvue } from "@lianmed/f_types";
import Draw from "../../Draw";
import { AnalyseType } from '../../interface';
import { Suit } from "../Suit";
import { DecType } from "@lianmed/f_types/lib/obvue/ctg_exams_analyse";


// export interface AnalyseData {
//     acc?: AccPoint[]
//     dec?: DecPoint[]
//     baseline?: number[]
//     start?: number
//     end?: number
// }

export class DrawAnalyse extends Draw {
    // private _analyseData: AnalyseData
    analysisData: obvue.ctg_exams_analyse
    suit: Suit
    constructor(canvas: HTMLCanvasElement, width = 0, height = 0, suit: Suit) {
        super(width, height, canvas)
        this.suit = suit
    }
    init() {
        this.analysisData = null
    }
    setData(analyseData: obvue.ctg_exams_analyse, ) {
        this.analysisData = analyseData
    }
    drawBaseline(cur, color, yspan, xspan, max, basetop) {
        //清空分析画布
        const { context2D, width, height, analysisData: analyseData } = this;
        context2D && context2D.clearRect(0, 0, width, height)

        if (!analyseData) {
            return
        }
        const { analysis: { fhrbaselineMinute: baseline, start, end } } = analyseData
        let lastx = 0;
        const leftViewposition = cur - width * 2 > 0 ? cur - width * 2 : 0;
        //kisi 2019-10-29 baseline
        //TODO
        let curfhroffset = 0;
        context2D.beginPath();
        context2D.strokeStyle = color;//基线颜色
        context2D.lineWidth = 2;
        //if (leftViewposition <= analyseData.start && cur > analyseData.start) {
        //kisi 2020-03-05 基线是完整分析曲线每分钟一一对应
        if (true) {
            let baselineoff = 0;
            let firstindex = Math.floor(leftViewposition / (xspan * 6));
            //console.log("==0==",cur,firstindex,baselineoff);
            context2D.moveTo(baselineoff * xspan * 3, (max - curfhroffset - baseline[firstindex]) * yspan + basetop);
            for (var i = leftViewposition; i < cur; i++) {
                baselineoff = Math.ceil(i / (xspan * 6));
                if (baselineoff >= baseline.length - 1) {
                    break;
                }
                if ((i) % (xspan * 6) == 0) {
                    //console.log("==1==",cur,firstindex,baselineoff);
                    lastx = Math.floor((i - leftViewposition) / 2);
                    context2D.lineTo(lastx, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop);
                }
            }
            context2D.lineTo(cur, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop)
            context2D.stroke();

        } else if (leftViewposition < end) {

            let baselineoff = Math.ceil((leftViewposition - start) / (xspan * 6));
            let firstindex = baselineoff - 1 > 0 ? baselineoff - 1 : 0;
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
            context2D.lineTo((end - leftViewposition) / 2, (max - curfhroffset - baseline[baselineoff]) * yspan + basetop)

            context2D.stroke();

        }
    }
    analyse(type: AnalyseType, start: number, end: number, data = this.analysisData) {
        if (!data) return
        const { suit } = this
        this.setData(data)
        console.log('local analyse result', data)
        suit.drawSelect.$selectrpend = data.analysis.end = end
        suit.drawSelect.$selectrpstart = data.analysis.start = start
        // this.emit('selectForward', data.end - data.start)
        //this.drawobj.drawdot(this.canvasline.width * 2, false);
        //kisi 2020-03-05 
        let newData = this.ctgscore(type)
        suit.drawobj.drawdot(suit.rightViewPosition, false);
        return newData
    }
    //kisi 2019-10-28 绘制 acc dec
    //2020-03-04 用 linecanvas 绘制标记
    drawflag = (canvas, x: number, y: number, index: number) => {
        const { context2D, analysisData: analyseData } = this;
        if (!context2D || !analyseData) return
        const { analysis: { acc, dec } } = analyseData
        const _acc = acc.map(_ => _.index)
        const _dec = dec.map(_ => _.index)
        context2D.textAlign = 'left';
        context2D.textBaseline = 'top';
        let txt = '';
        if (_acc.indexOf(index) > -1 || _acc.indexOf(index - 1) > -1) {
            const target = acc.find(_ => [index, index - 1].includes(_.index))
            target.x = x
            target.y = y
            // 90%(后台默认处理90%marked为true)以上直接显示为绿色加速标记（+）
            if (target.marked) {
                txt = "+";
                canvas.font = '16px arial';
                canvas.fillStyle = 'green';
                canvas.fillText(txt, x + 1, y + 10);
            } else if (target.reliability > 45) { //45%~90%，显示橙色加速标记（+）及橙色**%确定度
                txt = "+" + `${target.reliability}%`;
                canvas.font = '15px arial';
                canvas.fillStyle = 'orange';
                canvas.fillText(txt, x + 1, y + 10);
            }
        } else if (_dec.indexOf(index) > -1 || _dec.indexOf(index - 1) > -1) {
            const target = dec.find(_ => [index, index - 1].includes(_.index))
            target.x = x
            target.y = y
            txt = target ? target.type : '-';
            canvas.font = 'bold 15px arial';
            canvas.fillStyle = 'red';
            canvas.fillText(txt, x + 1, y - 1);
        }
    }
    // kisi 2020-04-08 增加本地分数统计
    inRange = (value: number, min: number, max: number) => {
        let result = false;
        if (value >= min && value <= max)
            result = true;
        return result;
    }
    //遍历时间段内的可信加速
    countAcc = (start: number, end: number) => {
        let accnum = 0;
        const { analysisData } = this
        if (!analysisData) return accnum;
        const { analysis } = analysisData
        analysis.acc.map(function (item) {
            if (item.index > end) {
                return accnum;
            } else if (item.index >= start) {
                if (item.marked)
                    accnum++;
            }
        })
        return accnum;
    }
    //遍历时间段内的某类型减速
    countDec = (start: number, end: number, type: string) => {
        let decnum = 0;
        const { analysisData } = this
        if (!analysisData) return decnum;
        const { analysis } = analysisData
        analysis.dec.map(function (item) {
            if (item.index > end) {
                return decnum;
            } else if (item.index >= start) {
                if (item.type.toUpperCase() == type)
                    decnum++;
            }
        })
        return decnum;
    }
    // fm 128 判断
    countFm = (start: number, end: number) => {
        let fmnum = 0;
        for (var i = start; i <= end; i++) {
            if (i % 2 == 1) continue;
            if (this.suit.data.fm[i] == 128 || this.suit.data.fm[i] == 1) {
                fmnum++;
            }
        }
        return fmnum;
    }
    //fm-fhr-duration
    fhrDuration = (start: number, end: number) => {
        let accnum = 0;
        let sum = 0;
        const { analysisData } = this
        if (!analysisData) return accnum;
        const { analysis } = analysisData
        analysis.acc.map(function (item) {
            if (item.index > end) {
                if (accnum == 0)
                    return accnum;
                else {
                    return Math.ceil(sum / accnum/4);
                }
            } else if (item.index >= start) {
                if (item.marked) {
                    sum += item.duration;
                    accnum++;
                    console.log(item.duration);
                }
            }
        })
        if (accnum == 0)
            return accnum;
        else {
            return Math.ceil(sum / accnum/4);
        }
    }
    //fm-fhr-ampl
    fhrAmpl = (start: number, end: number) => {
        let accnum = 0;
        let sum = 0;
        const { analysisData } = this
        if (!analysisData) return accnum;
        const { analysis } = analysisData
        analysis.acc.map(function (item) {
            if (item.index > end) {
                if (accnum == 0)
                    return accnum;
                else {
                    return Math.ceil(sum / accnum);
                }
            } else if (item.index >= start) {
                if (item.marked) {
                    sum += item.ampl;
                    accnum++;
                }
            }
        })
        if (accnum == 0)
            return accnum;
        else {
            return Math.ceil(sum / accnum);
        }
    }
    // TODO：analysis 结构最好与score结构分开
    // 评分类型最好枚举实现
    ctgscore = (type: AnalyseType) => {
        let { analysisData } = this
        if (!analysisData) return null
        analysisData = JSON.parse(JSON.stringify(analysisData))
        const { analysis, score } = analysisData

        // let timeframe = end-start/4*60;
        let bhr = analysis.bhr;
        //NST(国内) 20分钟
        if (type == 'Nst') {
            // 基线选项
            score.nstdata.bhrvalue = bhr;
            if (bhr < 100)
                score.nstdata.bhrscore = 0;
            else if (this.inRange(bhr, 100, 109) || bhr > 160)
                score.nstdata.bhrscore = 1;
            else if (this.inRange(bhr, 110, 160)) {
                score.nstdata.bhrscore = 2;
            }
            // 振幅
            score.nstdata.ltvvalue = analysis.ltv;
            if (analysis.ltv < 5) {
                score.nstdata.ltvscore = 0;
            } else if (this.inRange(analysis.ltv, 5, 9) || analysis.ltv > 30) {
                score.nstdata.ltvscore = 1;
            } else if (this.inRange(analysis.ltv, 10, 30)) {
                score.nstdata.ltvscore = 2;
            }
            // 胎动fhr上升时间
            let fhr_uptime = this.fhrDuration(analysis.start, analysis.end);
            score.nstdata.accdurationvalue = fhr_uptime;
            if (fhr_uptime < 10) {
                score.nstdata.accdurationscore = 0;
            } else if (this.inRange(fhr_uptime, 10, 14)) {
                score.nstdata.accdurationscore = 1;
            } else if (fhr_uptime > 15) {
                score.nstdata.accdurationscore = 2;
            }
            // 胎动fhr变化幅度
            let fhr_ampl = this.fhrAmpl(analysis.start, analysis.end);;
            score.nstdata.accamplvalue = fhr_ampl;
            if (fhr_ampl < 10) {
                score.nstdata.accamplscore = 0;
            } else if (this.inRange(fhr_ampl, 10, 14)) {
                score.nstdata.accamplscore = 1;
            } else if (fhr_ampl > 15) {
                score.nstdata.accamplscore = 2;
            }
            // 胎动
            let fmnum = this.countFm(analysis.start, analysis.end);
            score.nstdata.fmvalue = fmnum;
            if (fmnum == 0) {
                score.nstdata.fmscore = 0;
            } else if (this.inRange(fmnum, 1, 2)) {
                score.nstdata.fmscore = 1;
            } else if (fmnum > 2) {
                score.nstdata.fmscore = 2;
            }
            score.nstdata.total = score.nstdata.accamplscore + score.nstdata.accdurationscore + score.nstdata.bhrscore + score.nstdata.fmscore + score.nstdata.ltvscore;
            return this.analysisData = analysisData
        }
        //Krebs 30分钟
        else if (type == 'Krebs') {
            // 基线选项
            score.krebsdata.bhrvalue = bhr;
            if (bhr < 100 || bhr > 180) {
                score.krebsdata.bhrscore = 0;
            } else if (this.inRange(bhr, 100, 109) || this.inRange(bhr, 161, 180)) {
                score.krebsdata.bhrscore = 1;
            } else if (this.inRange(bhr, 110, 160)) {
                score.krebsdata.bhrscore = 2;
            }
            // 振幅变异
            let zhenfu_tv = analysis.ltv;
            score.krebsdata.ltvvalue = zhenfu_tv;
            if (zhenfu_tv < 5) {
                score.krebsdata.ltvscore = 0;
            } else if (this.inRange(zhenfu_tv, 5, 9) || zhenfu_tv > 25) {
                score.krebsdata.ltvscore = 1;
            } else if (this.inRange(zhenfu_tv, 10, 25)) {
                score.krebsdata.ltvscore = 2;
            }
            // 周期变异
            let zhouqi_tv = analysis.stv;
            score.krebsdata.stvvalue = zhouqi_tv;
            if (zhouqi_tv < 3) {
                score.krebsdata.stvscore = 0;
            } else if (this.inRange(zhouqi_tv, 3, 6)) {
                score.krebsdata.stvscore = 1;
            } else if (zhouqi_tv > 6) {
                score.krebsdata.stvscore = 2;
            }
            // 加速
            let accnum = this.countAcc(analysis.start, analysis.end);
            score.krebsdata.accvalue = accnum;
            if (accnum == 0) {
                score.krebsdata.accscore = 0;
            } else if (this.inRange(accnum, 1, 4)) {
                score.krebsdata.accscore = 1;
            } else if (accnum > 4) {
                score.krebsdata.accscore = 2;
            }
            // 减速
            let decnum = analysis.ldtimes + analysis.vdtimes;
            if (decnum > 1) {
                score.krebsdata.decscore = 0;
                score.krebsdata.decvalue = decnum + "";
            } else if (decnum = 1) {
                score.krebsdata.decscore = 1;
                score.krebsdata.decvalue = decnum + "";
            } else {
                score.krebsdata.decscore = 2;
                if (analysis.edtimes > 0) {
                    score.krebsdata.decvalue = "早减";
                } else {
                    score.krebsdata.decvalue = "无";
                }
            }
            // 胎动
            let fmnum = this.countFm(analysis.start, analysis.end);
            score.krebsdata.fmvalue = fmnum;
            if (fmnum == 0) {
                score.krebsdata.fmscore = 0;
            } else if (this.inRange(fmnum, 1, 4)) {
                score.krebsdata.fmscore = 1;
            } else if (fmnum > 4) {
                score.krebsdata.fmscore = 2;
            }
            score.krebsdata.total = score.krebsdata.bhrscore + score.krebsdata.accscore + score.krebsdata.decscore + score.krebsdata.ltvscore + score.krebsdata.stvscore + score.krebsdata.fmscore;
        }
        //Fischer 20分钟
        else if (type == 'Fischer') {
            // 基线选项
            score.fischerdata.bhrvalue = bhr;
            if (bhr < 100 || bhr > 180) {
                score.fischerdata.bhrscore = 0;
            } else if (this.inRange(bhr, 100, 109) || this.inRange(bhr, 161, 180)) {
                score.fischerdata.bhrscore = 1;
            } else if (this.inRange(bhr, 110, 160)) {
                score.fischerdata.bhrscore = 2;
            }
            // 振幅变异
            let zhenfu_tv = analysis.ltv;
            score.fischerdata.ltvvalue = zhenfu_tv;
            if (zhenfu_tv < 5) {
                score.fischerdata.ltvscore = 0;
            } else if (this.inRange(zhenfu_tv, 5, 9) || zhenfu_tv > 30) {
                score.fischerdata.ltvscore = 1;
            } else if (this.inRange(zhenfu_tv, 10, 30)) {
                score.fischerdata.ltvscore = 2;
            }
            // 周期变异
            let zhouqi_tv = analysis.stv;
            score.fischerdata.stvvalue = zhouqi_tv;
            if (zhouqi_tv < 3) {
                score.fischerdata.stvscore = 0;
            } else if (this.inRange(zhouqi_tv, 3, 6)) {
                score.fischerdata.stvscore = 1;
            } else if (zhouqi_tv > 6) {
                score.fischerdata.stvscore = 2;
            }
            // 加速
            let accnum = this.countAcc(analysis.start, analysis.end);
            score.fischerdata.accvalue = accnum;
            if (accnum == 0) {
                score.fischerdata.accscore = 0;
            } else if (this.inRange(accnum, 1, 4)) {
                score.fischerdata.accscore = 1;
            } else if (accnum > 4) {
                score.fischerdata.accscore = 2;
            }
            // 减速
            let ld = analysis.ldtimes;//this.countDec(analysis.start,analysis.end,'LD');
            let vd = analysis.vdtimes;//this.countDec(analysis.start,analysis.end,'VD');
            let ed = analysis.edtimes;//this.countDec(analysis.start,analysis.end,'ED');
            if (ld > 0) {
                score.fischerdata.decscore = 0;
                score.fischerdata.decvalue = 'LD';
            } else if (vd > 0) {
                score.fischerdata.decscore = 1;
                score.fischerdata.decvalue = 'VD';
            } else {
                if (ed > 0) {
                    score.fischerdata.decvalue = 'ED';
                } else {
                    score.fischerdata.decvalue = '无';
                }
                score.fischerdata.decscore = 2;
            }
            score.fischerdata.total = score.fischerdata.bhrscore + score.fischerdata.accscore + score.fischerdata.decscore + score.fischerdata.ltvscore + score.fischerdata.stvscore;
        }
        //NST-sogc 20~40分钟
        else if (type == 'Sogc') {
            // 基线选项
            score.sogcdata.bhrvalue = bhr;
            if (bhr < 100)
                score.sogcdata.bhrscore = 0;
            else if (this.inRange(bhr, 100, 109) || bhr > 160)
                score.sogcdata.bhrscore = 1;
            else if (this.inRange(bhr, 110, 160)) {
                score.sogcdata.bhrscore = 2;
            }
            // 振幅
            score.sogcdata.ltvvalue = analysis.ltv;
            if (analysis.ltv < 5) {
                score.sogcdata.ltvscore = 0;
            } else if (this.inRange(analysis.ltv, 5, 9) || analysis.ltv > 30) {
                score.sogcdata.ltvscore = 1;
            } else if (this.inRange(analysis.ltv, 10, 30)) {
                score.sogcdata.ltvscore = 2;
            }
            // 加速
            let accnum = this.countAcc(analysis.start, analysis.end);
            score.sogcdata.accvalue = accnum;
            if (accnum == 0) {
                score.sogcdata.accscore = 0;
            } else if (this.inRange(accnum, 1, 2)) {
                score.sogcdata.accscore = 1;
            } else if (accnum > 2) {
                score.sogcdata.accscore = 2;
            }
            // 减速
            let ld = analysis.ldtimes;//this.countDec(analysis.start,analysis.end,'LD');
            let vd = analysis.vdtimes;//this.countDec(analysis.start,analysis.end,'VD');
            let ed = analysis.edtimes;//this.countDec(analysis.start,analysis.end,'ED');
            if (ld > 0) {
                score.fischerdata.decscore = 0;
                score.fischerdata.decvalue = 'LD';
            } else if (vd > 0) {
                score.fischerdata.decscore = 1;
                score.fischerdata.decvalue = 'VD';
            } else {
                if (ed > 0) {
                    score.fischerdata.decvalue = 'ED';
                } else {
                    score.fischerdata.decvalue = '无';
                }
                score.fischerdata.decscore = 2;
            }
        }
        //CST
        else if (type == 'Cst') {

        }
        return (this.analysisData = analysisData)

    }
    revicePoint(x: number, y: number) {
        if (!this.analysisData) return
        const edge = 20;
        const { analysis: { acc, dec } } = this.analysisData

        const target = acc.find(_ => (x < _.x + edge) && (x > _.x - edge)) || dec.find(_ => (x < _.x + edge) && (x > _.x - edge))
        if (target && (y < (target.y + edge) && y > (target.y - edge))) {
            const isAcc = 'reliability' in target

            return isAcc ? '' : ''
        }
        return null
    }
    refresh() {
        this.suit.emit('suit:analyseMark')
        this.suit.drawobj.drawdot(this.suit.viewposition < this.width * 2 ? this.width * 2 : this.suit.viewposition);
    }
 
    markAccPoint(x: number, y: number, marked = true) {
        if (!this.analysisData) return
        const edge = 24;
        const { analysis: { acc } } = this.analysisData

        const target = acc.find(_ => (x < _.x + edge) && (x > _.x - edge))
        if (target && (y < (target.y + edge) && y > (target.y - edge))) {
            target.marked = marked
        }
        this.refresh()
    }
    markDecPoint(x: number, y: number, type: DecType) {
        if (!this.analysisData) return
        const edge = 24;
        const { analysis: { dec } } = this.analysisData

        const target = dec.find(_ => (x < _.x + edge) && (x > _.x - edge))
        if (target && (y < (target.y + edge) && y > (target.y - edge))) {
            target.type = type;
        }
        this.refresh()
    }
    // getPointType(x: number, y: number): PointType {
    //     if (!this.analysisData) return
    //     const edge = 20;
    //     const { analysis: { acc, dec } } = this.analysisData

    //     const target = acc.find(_ => (x < _.x + edge) && (x > _.x - edge)) || dec.find(_ => (x < _.x + edge) && (x > _.x - edge))
    //     if (target && (y < (target.y + edge) && y > (target.y - edge))) {
    //         const isAcc = 'reliability' in target

    //         return isAcc ? 'AccPoint' : 'DecPoint'
    //     }
    //     return null
    // }
}
