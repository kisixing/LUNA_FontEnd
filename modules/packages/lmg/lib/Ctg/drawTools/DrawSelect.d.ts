import Draw from "../../Draw";
import { Suit } from "../Suit";
import ScrollEl from "../../ScrollBar/ScrollEl";
export declare class DrawSelect extends Draw {
    selectrpstart: number;
    selectend: number;
    selectrpend: number;
    selectflag: boolean;
    suit: Suit;
    selectstart: number;
    selectstartposition: number;
    selectingBar: ScrollEl;
    startingBar: ScrollEl;
    endingBar: ScrollEl;
    get selectingBarPoint(): number;
    get $selectrpend(): number;
    set $selectrpend(value: number);
    get $selectrpstart(): number;
    set $selectrpstart(value: number);
    constructor(wrap: HTMLElement, canvas: HTMLCanvasElement, suit: Suit);
    init(): void;
    clearselect: () => void;
    showselect: (start?: number, end?: number) => void;
    selectBasedOnStartingBar(isLeft?: boolean, len?: number): void;
    updateSelectCur(): void;
    createBar(): void;
}
