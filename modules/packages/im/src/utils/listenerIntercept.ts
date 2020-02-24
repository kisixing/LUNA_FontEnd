import { IConn } from "../types/conn";
import { EventEmitter } from "@lianmed/utils";
import { ICbs, TListen } from "../types/listen";
import { parse } from "./msgParse";
import { EMsgBodyType } from "../types/msg";
const CHAT_MSG = 'chattingMessage'
export function listenerIntercept(conn: IConn) {
    conn._event = new EventEmitter()
    conn.on = function (this: IConn, event: string, listener: (...args: any[]) => void) {
        this._event.on(event, listener)
        return this
    }
    conn.emit = function emit(this: IConn, event: string, ...args: any[]) {
        this._event.emit(event, ...args)
        return true
    }
    const oldListen = conn.listen.bind(conn) as TListen
    const user = conn.user
    conn.listen = function name(this: IConn, cbs: ICbs) {
        const { onTextMessage, onAudioMessage, onVideoMessage, onFileMessage, onPictureMessage, ...others } = cbs


        oldListen({
            ...others,
            onTextMessage(this: IConn, msg) {
                const _msg = parse({ ...msg, bodyType: EMsgBodyType.txt }, user)
                this._event.emit(CHAT_MSG, _msg)
                onTextMessage && onTextMessage.call(msg, this)
            },
            onAudioMessage(this: IConn, msg) {
                const _msg = parse({ ...msg, bodyType: EMsgBodyType.audio }, user)
                this._event.emit(CHAT_MSG, _msg)
                onAudioMessage && onAudioMessage.call(msg, this)
            },
            onVideoMessage(this: IConn, msg) {
                const _msg = parse({ ...msg, bodyType: EMsgBodyType.video }, user)
                this._event.emit(CHAT_MSG, _msg)
                onVideoMessage && onVideoMessage.call(msg, this)
            },
            onFileMessage(this: IConn, msg) {
                const _msg = parse({ ...msg, bodyType: EMsgBodyType.file }, user)
                this._event.emit(CHAT_MSG, _msg)
                onFileMessage && onFileMessage.call(msg, this)
            },
            onPictureMessage(this: IConn, msg) {
                const _msg = parse({ ...msg, bodyType: EMsgBodyType.img }, user)
                this._event.emit(CHAT_MSG, _msg)
                onPictureMessage && onPictureMessage.call(msg, this)
            },
        })
    }
    return conn as IConn
}


