import { Flex, Typography } from "antd"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import '../style/CountDown.css'

export const Countdown = (props) => {
    const [days, setDays] = useState(10)
    const [hours, setHours] = useState(10)
    const [minutes, setMinutes] = useState(10)
    const [seconds, setSeconds] = useState(10)
    console.log(new Date().getTime());
    useEffect(() => {
        const countdown = () => {
            const endDate = new Date(dayjs(props.expires).$d).getTime() ?? new Date("December 25, 2026 00:00:00").getTime()
            const today = new Date().getTime()

            const timeDiff = endDate - today

            const seconds = 1000
            const minutes = seconds * 60
            const hours = minutes * 60
            const days = hours * 24

            let timeDays = Math.floor(timeDiff / days)
            let timeHours = Math.floor((timeDiff % days) / hours)
            let timeMinutes = Math.floor((timeDiff % hours) / minutes)
            let timeSeconds = Math.floor((timeDiff % minutes) / seconds)

            timeHours = timeHours < 10 ? "0" + timeHours : timeHours
            timeMinutes = timeMinutes < 10 ? "0" + timeMinutes : timeMinutes
            timeSeconds = timeSeconds < 10 ? "0" + timeSeconds : timeSeconds

            setDays(timeDays)
            setHours(timeHours)
            setMinutes(timeMinutes)
            setSeconds(timeSeconds)
        }

        const interval = setInterval(countdown, 1000)

        // Xóa bộ đếm khi component unmounted
        return () => clearInterval(interval)
    }, [props.expires])

    return (
        <>
            <Flex className="wrap_countdown" align="center">
                <img src="https://theme.hstatic.net/200000528965/1001037678/14/home_collection_1_title_ico.png?v=473" />
                <Typography.Title level={1} style={{ margin: 0, textTransform: 'uppercase', fontSize: '24px' }}>flash sale</Typography.Title>
                <div className="countdown">
                    <article>
                        <div>{days}
                            <h3>Days</h3>
                        </div>
                    </article>
                    <article>
                        <div>{hours}
                            <h3>Hours</h3>
                        </div>
                    </article>
                    <article>
                        <div>{minutes}
                            <h3>Minutes</h3>
                        </div>
                    </article>
                    <article>
                        <div>{seconds}
                            <h3>Seconds</h3>
                        </div>
                    </article>
                </div>
            </Flex>
        </>
    )
}
