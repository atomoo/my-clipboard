import {PACKAGE_LIST, getPackageVersion} from "@/utils/package"
import {useEffect, useState} from "react"

async function getPackageList() {
    return Promise.all(PACKAGE_LIST.map(async item => {
        const version = await getPackageVersion(item)
        return {...item, version}
    }))
}

export function usePackage() {
    const [packageList, setPackageList] = useState<any[]>([])

    useEffect(
        () => {
            getPackageList().then(list => {
                setPackageList(list)
            })
        },
        []
    )
    return packageList
}