import { useEffect, useState } from "react"

export default function Timer({ startTime, run }: {
    startTime: number
    run: boolean
}) {
    const [timePassed, setTimePassed] = useState(0)
    const [timer, setTimer] = useState<number>()
    useEffect(() => {
        if (timer) clearInterval(timer)
        if (run) {
            setTimer(window.setInterval(() => {
                setTimePassed(Math.floor((Date.now() - startTime) / 1000))
            }, 1000))
            return () => clearInterval(timer)
        }
        if(startTime ==0 )setTimePassed(0)
    }, [run,startTime])
    return <span>{timePassed}</span>
}