import { Suit } from './Suit';
export default class DrawCTG {
    suit: Suit;
    gridcontext: CanvasRenderingContext2D;
    linecontext: CanvasRenderingContext2D;
    datacontext: CanvasRenderingContext2D;
    selectcontext: CanvasRenderingContext2D;
    baseleft: number;
    basetop: number;
    min: number;
    max: number;
    xspan: number;
    yspan: number;
    scalespan: number;
    starttime: string;
    fhroffset: number;
    constructor(suit: Suit, xspan?: number, yspan?: number, scalespan?: number, fhroffset?: number, baseleft?: number, basetop?: number, min?: number, max?: number);
    resize(): void;
    drawgrid(cur: any, drawtimespan?: boolean): void;
    drawdotright(cur: any): void;
    drawdot(cur: any, isemit?: boolean): void;
    sethorizontal: (length: number, startposition: number, drawtimespan?: boolean) => void;
    sethorizontalright: (length: number, startposition: number, drawtimespan?: boolean) => void;
    setvertical: (_maxline: number, startposition: number) => void;
    setscalestyle(context: any, color: any): void;
    setrules: (x: number) => void;
    showcur: (x: number, eventemit?: boolean) => void;
    showfm: (postion: any) => void;
}
