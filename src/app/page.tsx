'use client'

import {clipboard, invoke} from '@tauri-apps/api'
import {useCallback, useEffect, useRef, useState} from 'react'

import {PACKAGE_LIST, getPackageVersion} from '@/utils/package'
import SysIcon from '@/icon/system.svg'

async function getPackageList() {
  return Promise.all(PACKAGE_LIST.map(async item => {
    const version = await getPackageVersion(item)
    return {...item, version}
  }))
}


export default function Home() {
  const [list, setList] = useState<any[]>([])
  const timerRef= useRef<any>(0)
  useEffect(
    () => {
      getPackageList().then(list => {
        setList(list)
      })
    },
    []
  )

  // useEffect(
  //   () => {
  //     const timer = timerRef.current
  //     if (!timerRef.current) {
  //       timerRef.current = setInterval(() => {
  //         clipboard.readText().then(console.log)
  //       }, 1000)
  //       console.log(timerRef.current)
  //     }
  //     return () => {
  //       clearInterval(timer)
  //     }
  //   },
  //   []
  // )

  const click = useCallback(
    () => {
      invoke('get_clipboard_contents').then(result => {
        console.log(result)
      }).catch(console.error)
    }, 
    []
  )
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pb-4 rounded-md bg-white shadow-sm">
      <div>
        <button onClick={click}>click</button>
      </div>
      <div className="z-10 fixed bottom-0 right-0 w-full border-t text-xs flex items-center">
        <div className="flex-shrink-0 p-1 border-r">
          <SysIcon />
        </div>
        <div className="flex-1 pl-2">
        {list.map(item => {
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
