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

    if (props.minimal) {
        return (
            <div className="countdown-wrapper minimal-countdown">
                <div className="countdown-item">
                    <span className="countdown-value">{days}</span>
                    <span className="countdown-label">Ngày</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-item">
                    <span className="countdown-value">{hours}</span>
                    <span className="countdown-label">Giờ</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-item">
                    <span className="countdown-value">{minutes}</span>
                    <span className="countdown-label">Phút</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-item">
                    <span className="countdown-value">{seconds}</span>
                    <span className="countdown-label">Giây</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flash-sale-container">
            <Flex className="flash-sale-header" align="center" gap={12}>
                <img 
                    src="https://theme.hstatic.net/200000528965/1001037678/14/home_collection_1_title_ico.png?v=473" 
                    alt="flash sale icon"
                />
                <Typography.Title level={2} className="flash-sale-title">Flash Sale</Typography.Title>
                
                <div className="countdown-wrapper">
                    <div className="countdown-item">
                        <span className="countdown-value">{days}</span>
                        <span className="countdown-label">Ngày</span>
                    </div>
                    <span className="countdown-separator">:</span>
                    <div className="countdown-item">
                        <span className="countdown-value">{hours}</span>
                        <span className="countdown-label">Giờ</span>
                    </div>
                    <span className="countdown-separator">:</span>
                    <div className="countdown-item">
                        <span className="countdown-value">{minutes}</span>
                        <span className="countdown-label">Phút</span>
                    </div>
                    <span className="countdown-separator">:</span>
                    <div className="countdown-item">
                        <span className="countdown-value">{seconds}</span>
                        <span className="countdown-label">Giây</span>
                    </div>
                </div>
            </Flex>
        </div>
    )
}
