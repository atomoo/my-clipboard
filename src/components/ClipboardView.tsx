import {Clipboard as ClipboardView} from '@/interface/clipboard'
import {timeAgo} from '@/utils/timeago'
import {FC} from 'react'

interface ClipboardProps {
    data: ClipboardView[]
}

const ClipboardView: FC<ClipboardProps> = ({data}) => {
    return (
        <div className="w-full">
            {data.map(item => {
                return (
                    <div key={item.id} className="border-b border-solid w-full px-4 py-2">
                        <div className="text-xs text-gray-400">{timeAgo(item.createdAt)}</div>
                        <div className="line-clamp-3 text-ellipsis text-black">{item.content}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default ClipboardView
