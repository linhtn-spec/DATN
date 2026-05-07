import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, MailOutlined } from '@ant-design/icons'
import { Button, Result, Spin, message as antMessage } from 'antd'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmail, resendVerification } from '../../../services/user_service'
import './VerifyEmail.css'

const VerifyEmail = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // verifying, success, error, expired
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
            antMessage.success(response.data.message)
            navigate('/')
        } catch (error) {
            antMessage.error(error.response?.data?.message || 'Gửi lại email thất bại')
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="verify-email-container">
            {status === 'verifying' && (
                <div className="verifying-box">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                    <h2>Đang xác nhận email của bạn...</h2>
                </div>
            )}

            {status === 'success' && (
                <Result
                    status="success"
                    title="Xác nhận thành công!"
                    subTitle={message}
                    extra={[
                        <Button type="primary" key="login" onClick={() => navigate('/')}>
                            Đăng nhập ngay
                        </Button>
                    ]}
                />
            )}

            {status === 'expired' && (
                <Result
                    status="warning"
                    title="Liên kết đã hết hạn"
                    subTitle={message}
                    extra={[
                        <Button 
                            type="primary" 
                            key="resend" 
                            icon={<MailOutlined />}
                            loading={resending}
                            onClick={handleResend}
                        >
                            Gửi lại email xác nhận cho {userEmail}
                        </Button>,
                        <Button key="register" onClick={() => navigate('/register')}>
                            Quay lại đăng ký
                        </Button>
                    ]}
                />
            )}

            {status === 'error' && (
                <Result
                    status="error"
                    title="Xác nhận thất bại"
                    subTitle={message}
                    extra={[
                        <Button type="primary" key="retry" onClick={() => navigate('/register')}>
                            Quay lại đăng ký
                        </Button>
                    ]}
                />
            )}
        </div>
    )
}

export default VerifyEmail
