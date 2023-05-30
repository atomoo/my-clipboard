import {Clipboard as ClipboardView} from '@/interface/clipboard'
import {FC} from 'react'

interface ClipboardProps {
    data: ClipboardView[]
}

const ClipboardView: FC<ClipboardProps> = ({data}) => {
    return (
        <div>
            {data.map(item => {
                return (
                    <div key={item.id}>
                        <span>{item.content}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default ClipboardView
