import {clipboard} from "@tauri-apps/api"
import {useEffect, useRef, useState} from "react"

export function useClipboard(interval: number = 1000) {
    const [content, setContent] = useState<string[]>([])
    const timerRef = useRef(0)
    useEffect(
        () => {
            const timer = timerRef.current
            if (!timer) {
                timerRef.current = window.setInterval(() => {
                    clipboard.readText().then(text => {
                        if (text) {
                            setContent(prev => {
                                if (text !== prev.at(-1)) {
                                    return [...prev, text]
                                }
                                return prev
                            })
                        }
                    })
                }, 1000)
            }
            return () => {
                if (timer) {
                    window.clearInterval(timer)
                }
            }
        },
        []
    )
    return {content}
}