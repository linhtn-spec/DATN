import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Breadcrumb, Button, Flex, Form, Input, Typography } from 'antd'
import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { resetPasswordCurrentUser } from '../../../services/user_service'
import Notification from '../../../utils/configToastify'
import '../style/ChangePassword.css'

export const ChangePassword = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const { mutate } = useMutation({
        mutationFn: (data) => resetPasswordCurrentUser(data),
        onSuccess: () => {
            Notification({ message: "Đổi mật khẩu thành công!", type: "success" })
            navigate("/client")
        },
        onError: () => Notification({ message: "Mật khẩu hiện tại không đúng!", type: "error" })
    })
    const handleSubmit = (e) => {
        mutate(e);
    }


    useEffect(() => {
        document.title = "Đổi mật khẩu"
    }, [])
    return (
        <Flex vertical className='security' align='center'>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/user/change-password'}>ĐỔI MẬT KHẨU</NavLink>,
                    },
                ]}
            />
            <Flex className='form_wrap' vertical align="center">
                <div className="form_header">
                    <SafetyCertificateOutlined className="header_icon" />
                    <Typography.Title level={2} className="header_title">Bảo mật tài khoản</Typography.Title>
                    <Typography.Text type="secondary">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</Typography.Text>
                </div>
                <Form
                    form={form}
                    style={{ width: "100%" }}
                    layout="vertical"
                    size="large"
                    onFinish={handleSubmit}>

                    <Form.Item
                        label={<span className="custom_label">Mật khẩu hiện tại</span>}
                        name="current_password"
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                            { min: 6, message: "Tối thiểu 6 ký tự" }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="input_icon" />} visibilityToggle placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="custom_label">Mật khẩu mới</span>}
                        name="new_password"
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: "Tối thiểu 6 ký tự" }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="input_icon" />} visibilityToggle placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="custom_label">Xác nhận mật khẩu mới</span>}
                        name="confirm_new_password"
                        dependencies={['new_password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            { min: 6, message: "Tối thiểu 6 ký tự" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="input_icon" />} visibilityToggle placeholder="Xác nhận lại mật khẩu mới" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 30 }}>
                        <Button type="primary" htmlType="submit" className="submit_btn" block>
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Flex>
        </Flex >
    )
}


