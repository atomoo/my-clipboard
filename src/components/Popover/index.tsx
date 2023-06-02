import {FC, PropsWithChildren, ReactNode} from 'react'

interface PopoverProps { 
    overlay: ReactNode
}

const Popover: FC<PropsWithChildren<PopoverProps>> = ({children, overlay}) => {

    return (
        <div>
            {children}
            <div className="border-t-4"></div>
            <div>
                {overlay}
            </div>
        </div>
    )
}

export default Popover
