import {Clipboard as ClipboardView} from '@/interface/clipboard'
import {timeAgo} from '@/utils/timeago'
import {FC} from 'react'

interface ClipboardProps {
    data: ClipboardView[]
}

const ClipboardView: FC<ClipboardProps> = ({data}) => {
    return (
        <div className="w-full h-full overflow-y-auto px-4">
            <div>
                <input placeholder="search..." />
            </div>
            {data.map(item => {
                return (
                    <div key={item.id} className="border-b border-solid w-full py-2">
                        <div className="line-clamp-3 text-ellipsis text-black text-sm">{item.content}</div>
                        <div className="text-xs text-gray-400">
                            <span className="mr-2">{timeAgo(item.createdAt)}</span>
                            <span className="hover:text-blue-400 cursor-pointer">copy</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ClipboardView
