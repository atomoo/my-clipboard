import dayjs from 'dayjs'
/**
 * 时间转换
 * @param time 时间 YYYY-MM-DD HH:mm:ss
 */
export function timeAgo(time: string) {
    if (!time) {
        return ''
    }
    const date = dayjs(time, 'YYYY-MM-DD HH:mm:ss')
    if (date.isValid()) {
        const offset = date.diff() / 1000
        const offsetInMinute = offset / 60
        const offsetInHour = offsetInMinute / 60
        const offsetInDay = offsetInHour / 24
        switch (true) {
            case offset < 10:
                return 'just now'
            case offsetInMinute < 1:
                return `${Math.floor(offset)}s`
            case offsetInHour < 1:
                return `${Math.floor(offsetInMinute)}mins`
            case offsetInDay < 1:
                return `${Math.floor(offsetInHour)}h`
            case offsetInDay < 5:
                return `${Math.floor(offsetInDay)}d`
            default:
                return time.substring(0, 10)
        }
    }

    return ''
}