import { StompService } from "@lianmed/utils";
import { IMessageMap } from "./types";
import { IContact } from "../../types";
export declare const useMessage: (s: StompService, chatUnread: IMessageMap, setChatUnread: any, current: IContact) => {
    chatMessage: IMessageMap;
    setChatMessage: (data: IMessageMap) => void;
};
