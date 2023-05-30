import {Clipboard} from "@/interface/clipboard"
import {clipboard, event, invoke} from "@tauri-apps/api"
import {useEffect, useRef, useState} from "react"

export function useClipboardTask(interval: number = 1000) {
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


function getClipboardContents() {
    return invoke('get_clipboard_contents') as Promise<Clipboard[]>
}

export function useClipboard() {
    const [content, setContent] = useState<Clipboard[]>([])

    useEffect(
        () => {
            getClipboardContents().then(res => {
                if (Array.isArray(res)) {
                    setContent(res)
                }
            })
        },
        []
    )

    useEffect(
        () => {
            const unListen = event.listen('update_clipboard', async (res) => {
                if (Array.isArray(res?.payload)) {
                    setContent(res.payload)
                }
            })
            return () => {
                unListen.then(fn => {
                    fn()
                })
            }
        },
        []
    )
    return content
}