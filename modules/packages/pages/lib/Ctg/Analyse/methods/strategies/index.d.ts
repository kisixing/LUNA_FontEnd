declare const _default: (key: string, oldData: any, initData: {
    analysis?: {
        length?: number;
        bhr?: number;
        ltv?: number;
        stv?: number;
        edtimes?: number;
        ldtimes?: number;
        vdtimes?: number;
        acc?: import("@lianmed/f_types/lib/obvue").AccPoint[];
        dec?: import("@lianmed/f_types/lib/obvue").DecPoint[];
        fm?: number[];
        fhrbaselineMinute?: number[];
        ucdata?: {
            ucIndex: number[];
            uctimes: number;
            ucStrong: number;
            uckeeptime: number;
            ucdurationtime: number;
        };
        start?: number;
        end?: number;
        sinusoid?: boolean;
        _fhr_uptime: number;
        _acc_num: number;
        _dec_num: number;
        _baseline_avg: number;
    };
    score?: import("@lianmed/f_types/lib/obvue/ctg_exams_analyse").ctg_exams_analyse_score;
}) => any;
export default _default;
