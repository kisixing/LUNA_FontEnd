import { IMessage, IContact } from "./types";
export declare function useI(url?: string): {
    chatMessage: import("./types").IMessageMap;
    contacts: IContact[];
    current: IContact;
    currentMessage: IMessage[];
    setCurrentId: (id: string) => void;
    sendTextMessage: (receiver: string, msg: string) => void;
};
