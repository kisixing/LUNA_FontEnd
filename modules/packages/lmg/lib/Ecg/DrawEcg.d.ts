import Draw from "../Draw";
import Queue from "./Queue";
declare type Canvas = HTMLCanvasElement;
interface I {
    wrap: HTMLDivElement;
    MultiParam: number[];
    Ple: number[];
    Tre: number[];
    canvas: Canvas;
    canvasline: Canvas;
    canvasmonitor: Canvas;
    canvasPle: Canvas;
    ecg_scope?: number;
    current_times?: number;
    max_times?: number;
    width?: number;
    height?: number;
    data: any;
}
export declare class DrawEcg extends Draw {
    static Queue: typeof Queue;
    private data;
    canvas: Canvas;
    canvasline: Canvas;
    private canvasmonitor;
    private ctx;
    private linectx;
    private datactx;
    private ecg_scope?;
    private _current_times?;
    private drawPle;
    get current_times(): number;
    set current_times(value: number);
    private max_times?;
    private start?;
    private intervalIds;
    private last_points;
    constructor(args: I);
    init(data: any): void;
    _resize(): void;
    destroy(): void;
    ecg(): void;
    Convert16Scale(): void;
    addfilltext(): void;
    DrawDatatext(): void;
    getLength(val: any): number;
    initparm(): void;
    timerEcg(dely: any): void;
    drawsingle(): void;
    clearcanvans(): void;
    GetYStarts(C: any): any[];
}
export {};
