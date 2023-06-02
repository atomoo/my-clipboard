'use client'

import {invoke} from '@tauri-apps/api'
import {useCallback} from 'react'

import SysIcon from '@/icon/system.svg'
import {usePackage} from '@/hooks/package'
import {useClipboard} from '@/hooks/clipboard'
import ClipboardView from '@/components/ClipboardView'


function getClipboardContents() {
  return invoke('get_clipboard_contents') as Promise<any[]>
}


export default function Home() {
  const packageList = usePackage()
  const clipboardContents = useClipboard()
  console.log(clipboardContents)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pb-4 rounded-md bg-white shadow">
      <ClipboardView data={clipboardContents} />
      <div className="z-10 fixed bottom-0 right-0 w-full border-t text-xs flex items-center">
        <div className="flex-shrink-0 p-1 border-r">
          <SysIcon />
        </div>
        <div className="flex-1 pl-2">
        {packageList.map(item => {
          return (
            <div className="flex items-center" key={item.name}>
              <span className="text-sm mr-1">{item.icon}</span>
              <span className="text-gray-500">v{item.version}</span>
            </div>
          )
        })}
        </div>
      </div>
    </main>
  )
}
