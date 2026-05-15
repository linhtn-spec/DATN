import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, MailOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { resendVerification, verifyEmail } from '../../../services/user_service'
import Notification from '../../../utils/configToastify'
import './VerifyEmail.css'

const VerifyEmail = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // verifying | success | error | expired
    const [message, setMessage] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [resending, setResending] = useState(false)

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await verifyEmail(token)
                setStatus('success')
                setMessage(response.data.message)
            } catch (error) {
                if (error.response?.status === 410) {
                    setStatus('expired')
                    setUserEmail(error.response.data.email)
                } else {
                    setStatus('error')
                }
                setMessage(error.response?.data?.message || 'Xác nhận email thất bại')
            }
        }
        verify()
    }, [token])

    const handleResend = async () => {
        setResending(true)
        try {
            const response = await resendVerification(userEmail)
            Notification({ message: response.data.message, type: 'success' })
            navigate('/')
        } catch (error) {
            Notification({ message: error.response?.data?.message || 'Gửi lại email thất bại', type: 'error' })
        } finally {
            setResending(false)
        }
    }

    const configs = {
        verifying: {
            icon: <Spin indicator={<LoadingOutlined style={{ fontSize: 52 }} spin />} />,
            title: 'Đang xác nhận email...',
            subtitle: 'Vui lòng chờ trong giây lát.',
            iconClass: 'verify-icon-loading',
        },
        success: {
            icon: <CheckCircleOutlined />,
            title: 'Xác nhận thành công!',
            subtitle: message || 'Email của bạn đã được xác nhận. Bạn có thể đăng nhập ngay bây giờ.',
            iconClass: 'verify-icon-success',
            actions: (
                <Button type="primary" size="large" className="verify-btn-primary" onClick={() => navigate('/')}>
                    Đăng nhập ngay
                </Button>
            )
        },
        expired: {
            icon: <WarningOutlined />,
            title: 'Liên kết đã hết hạn',
            subtitle: message || 'Liên kết xác nhận email của bạn đã hết hạn.',
            iconClass: 'verify-icon-warning',
            actions: (
                <div className="verify-action-group">
                    <Button
                        type="primary"
                        size="large"
                        icon={<MailOutlined />}
                        loading={resending}
                        className="verify-btn-primary"
                        onClick={handleResend}
                    >
                        Gửi lại email xác nhận
                    </Button>
                    <Button size="large" className="verify-btn-ghost" onClick={() => navigate('/register')}>
                        Quay lại đăng ký
                    </Button>
                </div>
            )
        },
        error: {
            icon: <CloseCircleOutlined />,
            title: 'Xác nhận thất bại',
            subtitle: message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            iconClass: 'verify-icon-error',
            actions: (
                <Button type="primary" size="large" className="verify-btn-primary" onClick={() => navigate('/register')}>
                    Quay lại đăng ký
                </Button>
            )
        }
    }

    const current = configs[status]

    return (
        <div className="verify-email-container">
            <div className="verify-card">
                <div className="verify-logo">
                    <img src="/images/icon/scart-mid.png" alt="logo" />
                </div>

                <div className={`verify-icon-wrap ${current.iconClass}`}>
                    {current.icon}
                </div>

                <h2 className="verify-title">{current.title}</h2>
                <p className="verify-subtitle">{current.subtitle}</p>

                {current.actions && (
                    <div className="verify-actions">
                        {current.actions}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VerifyEmail
