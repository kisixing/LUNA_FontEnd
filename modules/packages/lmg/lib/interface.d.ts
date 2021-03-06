import { ICacheItem } from "./services/types";
import { CSSProperties } from "react";
export interface IProps {
    data: ICacheItem;
    mutableSuitObject?: {
        suit: (Drawer | any);
    };
    onReady?: (suit: Drawer) => void;
    loading?: boolean;
    isFullscreen?: boolean;
    audios?: string[];
    style?: CSSProperties;
    [x: string]: any;
}
export declare type AnalyseType = 'Nst' | 'Krebs' | 'Fischer' | 'Sogc' | 'Cst' | 'Cstoct';
export declare type PointType = 'EditAccPoint' | 'EditDecPoint' | 'MarkAccPoint' | 'MarkDecPoint' | 'BaselinePoint' | 'other';
export interface Drawer {
    wrap: HTMLElement;
    resize: () => void;
    init: (data?: any) => void;
    destroy: () => void;
}
export declare type Canvas = HTMLCanvasElement;
export declare type Div = HTMLDivElement;
