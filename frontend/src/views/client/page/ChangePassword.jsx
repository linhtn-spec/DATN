import { Flex, Form, Breadcrumb, Input, Button, Typography } from 'antd'
import { NavLink, useNavigate } from 'react-router-dom'
import '../style/ChangePassword.css'
import Notification from '../../../utils/configToastify'
import { useMutation } from '@tanstack/react-query'
import { resetPasswordCurrentUser } from '../../../services/user_service'
import { useEffect } from 'react'

export const ChangePassword = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const { mutate } = useMutation({
        mutationFn: (data) => resetPasswordCurrentUser(data),
        onSuccess: () => {
            Notification({ message: "Đổi mật khẩu thành công!", type: "success" })
            navigate("/client")
        },
        onError: () => Notification({ message: "Đổi mật khẩu thất bại, vui lòng kiểm tra lại!", type: "error" })
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
            <Flex className='form_wrap'>
                <Form
                    form={form}
                    style={{ width: "100%", padding: "0 20px" }}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 100 }}
                    layout="horizontal"
                    onFinish={handleSubmit}>
                    <Flex vertical >
                        <Typography.Title level={3}>Mật khẩu hiện tại</Typography.Title >
                        <Form.Item
                            name="current_password"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu!',
                                }, {
                                    min: 6,
                                    message: "Tối thiểu 6 ký tự"
                                }
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="Mật khẩu hiện tại" size="large" />
                        </Form.Item>
                        <Typography.Title level={3}>Mật khẩu mới</Typography.Title>
                        <Form.Item
                            name="new_password"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu mới!',
                                }, {
                                    min: 6,
                                    message: "Tối thiểu 6 ký tự"
                                }
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="Mật khẩu mới" size="large" />
                        </Form.Item>
                        <Typography.Title level={3}>Xác nhận mật khẩu mới</Typography.Title>
                        <Form.Item
                            name="confirm_new_password"
                            dependencies={['new_password']}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng xác nhận mật khẩu!',
                                }, {
                                    min: 6,
                                    message: "Tối thiểu 6 ký tự"
                                },
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
                            <Input.Password visibilityToggle placeholder="Xác nhận mật khẩu mới" size="large" />
                        </Form.Item>

                        <Flex vertical align="center" justify="center" className="button_group">
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="register">Đổi mật khẩu</Button>
                            </Form.Item>
                        </Flex>
                    </Flex>
                </Form>
            </Flex >
        </Flex >
    )
}


