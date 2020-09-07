import { WsService } from "../WsService";
interface IData {
    "name": "time_endwork_tip";
    "device_no": 1;
    "bed_no": 1;
    "data": {
        "mac": "EB:CI:SE:38:90:22";
        "isfhr": boolean;
    };
}
export declare function time_endwork_tip(this: WsService, received_msg: IData): void;
export {};
