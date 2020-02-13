import { MutableRefObject } from 'react';
import ScrollEl from './ScrollEl';
declare type TResolve = (value: number, isfire?: boolean) => void;
export declare type TLineTool = {
    toggleVisibility: () => void;
    rowline: ScrollEl;
    setBase: (n: number) => void;
    addDot: (obj: {
        width?: number;
        height?: number;
        left?: number;
    }) => ScrollEl;
};
export interface IBarTool {
    watch: (fn: TResolve) => void;
    watchGrab: (fn: TResolve, interval?: number) => void;
    setBarWidth: (width: number) => void;
    setBarLeft?: TResolve;
    createRod?: (name: string) => ScrollEl;
    createHLine?: (bg: string) => TLineTool;
}
declare function useScroll(box: MutableRefObject<HTMLElement>, wrapper: MutableRefObject<HTMLElement>): [() => IBarTool];
export default useScroll;
