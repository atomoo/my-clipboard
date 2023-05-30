import {Package} from '@/interface/package'
import {Command} from '@tauri-apps/api/shell'

import NodeIcon from '@/icon/node.svg'

export const VERSION_PATTER = '[0-9]+\.[0-9]+\.[0-9]+'
export const PACKAGE_LIST: Package[] = [
    {
        name: 'Node.js',
        command: 'node',
        args: ['-v'],
        pattern: `v(${VERSION_PATTER})`,
        icon: <NodeIcon />
    },
    // {
    //     name: 'fnm',
    //     command: 'fnm',
    //     args: ['-V'],
    //     pattern: `fnm (${VERSION_PATTER})`
    // }
]

export async function getPackageVersion(pkg: Package) {
    try {
        const cmd = new Command(pkg.command, pkg.args)
        const result = await cmd.execute()
        if (result.code === 0) {
            const matched = new RegExp(pkg.pattern).exec(result.stdout)
            return matched?.[1] ?? ''
        }
        return ''
    } catch (error) {
        console.error(error)
        return ''
    }
}
