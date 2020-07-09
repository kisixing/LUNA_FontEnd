interface BasePoint {
    index: number;
    start: number;
    end: number;
    peak: number;
    duration: number;
    ampl: number;
    x?: number;
    y?: number;
    marked?: boolean;
    remove?: boolean;
    user?: boolean;
}
export interface AccPoint extends BasePoint {
    reliability: number;
}
export declare type DecType = 'ld' | 'ed' | 'vd';
export interface DecPoint extends BasePoint {
    type: DecType;
}
export interface ctg_exams_analyse_score {
    sogcdata?: {
        bhrscore: number;
        ltvvalue: number;
        ltvscore: number;
        accscore: number;
        accvalue: number;
        bhrvalue: number;
        decscore: number;
        decvalue: string | number;
        total: number;
        result: number | string
    };
    cstdata?: {
        bhrscore: number;
        ltvvalue: number;
        ltvscore: number;
        stvscore: number;
        stvvalue: number;
        accscore: number;
        accvalue: number;
        bhrvalue: number;
        decscore: number;
        decvalue: string | number;
        total: number;
    };
    cstoctdata?: {
        bhrscore: number;
        ltvvalue: number;
        ltvscore: number;
        accscore: number;
        accvalue: number;
        bhrvalue: number;
        decscore: number;
        decvalue: string | number;
        edscore: number;
        edvalue: string | number;
        ldscore: number;
        ldvalue: string | number;
        vdscore: number;
        vdvalue: string | number;
        sinusoidscore: number;
        sinusoidvalue: number;
        total: number;
        result: number | string
    };
    ret: number;
    msg: string;
    nstdata?: {
        bhrscore: number;
        ltvscore: number;
        accdurationscore: number;
        accamplscore: number;
        fmscore: number;
        total: number;
        bhrvalue: number;
        ltvvalue: number;
        accdurationvalue: number;
        accamplvalue: number;
        fmvalue: number;
    };
    krebsdata?: {
        ltvvalue: number;
        bhrscore: number;
        ltvscore: number;
        stvscore: number;
        accscore: number;
        decscore: number;
        fmscore: number;
        total: number;
        bhrvalue: number;
        ltvalue: number;
        stvvalue: number;
        accvalue: number;
        decvalue: string;
        fmvalue: number;
    };
    fischerdata?: {
        ltvvalue: number;
        bhrscore: number;
        ltvscore: number;
        stvscore: number;
        accscore: number;
        decscore: number;
        total: number;
        bhrvalue: number;
        ltvalue: number;
        stvvalue: number;
        accvalue: number;
        decvalue: string;
    };
}
export interface _ctg_exams_analyse {
    analysis: {
        bhr: number;
        ltv: number;
        stv: number;
        edtimes: number;
        ldtimes: number;
        vdtimes: number;
        acc: AccPoint[];
        dec: DecPoint[];
        fm: number[];
        fhrbaselineMinute: number[];
        ucdata: {
            ucIndex: number[];
            uctimes: number;
            ucStrong: number;
            uckeeptime: number;
            ucdurationtime: number;
        };
        start: number;
        end: number;
        isSinusoid: boolean;
    };
    score: ctg_exams_analyse_score
}
export { };
