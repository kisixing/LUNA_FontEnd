import { MutableRefObject } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Suit } from '@lianmed/lmg/lib/Ctg/Suit';
import { AnalyseType } from '@lianmed/lmg/lib/interface';
declare const _default: (v: MutableRefObject<Suit>, docid: string, fetal: any, setFhr: (index: 2 | 1 | 3) => void, ctgData: {
    fhr1?: string;
    fhr2?: string;
    fhr3?: string;
    toco?: string;
    fm?: string;
    docid?: string;
    fetalnum?: string;
    fetalposition?: any;
    _fhr1?: string;
    _fhr2?: string;
    _fhr3?: string;
}) => {
    setMark(m: AnalyseType): void;
    mark: AnalyseType;
    MARKS: AnalyseType[];
    reAnalyse: () => Promise<void>;
    startTime: number;
    endTime: number;
    setStartTime: import("react").Dispatch<import("react").SetStateAction<number>>;
    interval: number;
    setInterval: import("react").Dispatch<import("react").SetStateAction<number>>;
    Fischer_ref: MutableRefObject<FormInstance>;
    Nst_ref: MutableRefObject<FormInstance>;
    Krebs_ref: MutableRefObject<FormInstance>;
    analysis_ref: MutableRefObject<FormInstance>;
    old_ref: MutableRefObject<{
        [x: string]: any;
    }>;
    analyseLoading: boolean;
    isToShort: boolean;
    setAutoFm(s: boolean): void;
    autoFm: boolean;
};
export default _default;
