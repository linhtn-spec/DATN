import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Result, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../../../services/user_service'
import './VerifyEmail.css'

const VerifyEmail = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [message, setMessage] = useState('')

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await verifyEmail(token)
                setStatus('success')
                setMessage(response.data.message)
            } catch (error) {
                setStatus('error')
                setMessage(error.response?.data?.message || 'Xác nhận email thất bại')
            }
        }
        verify()
    }, [token])

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
