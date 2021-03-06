
import { useEffect, useState } from "react";

import { IMessageMap } from "./useMessage";
import { IMessage } from "../types/msg";


export function useCurrent(chatMessage: IMessageMap) {
    const [current, setCurrent] = useState<string>(null)
    const [currentMessage, setCurrentMessage] = useState<IMessage[]>([])
    useEffect(() => {
        console.log('current change', current, currentMessage)
        const mesgArr = chatMessage[current] || []
        setCurrentMessage([...currentMessage, ...mesgArr])

    }, [chatMessage, current, setCurrentMessage])


    // let history: any = window.history;

    return { currentMessage, setCurrent, current }

}