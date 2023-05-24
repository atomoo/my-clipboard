import {ReactNode} from "react"

export interface Package {
    name: string;
    command: string;
    args: string[];
    pattern: string;
    icon?: ReactNode
}