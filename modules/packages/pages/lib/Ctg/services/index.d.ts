interface ICtgExamsPdf {
    age: any;
    diagnosis: string;
    docid: string;
    end: number;
    fetalcount: number;
    gestationalWeek?: string;
    inpatientNO: string;
    name: string;
    outputType?: string;
    start: number;
    startdate: string;
    fetal: any;
    show_fetalmovement: boolean;
}
export declare const fetchCtgExamsPdf: (data: ICtgExamsPdf) => Promise<any>;
export {};
