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
            Notification({ message: "Change password successfully", type: "success" })
            navigate("/client")
        },
        onError: () => Notification({ message: "Change password unsuccessfully", type: "error" })
    })
    const handleSubmit = (e) => {
        mutate(e);
    }


    useEffect(() => {
        document.title = "Change password"
    }, [])
    return (
        <Flex vertical className='security' align='center'>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/user/change-password'}>CHANGE PASSWORD</NavLink>,
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
                        <Typography.Title level={3}>Current password</Typography.Title >
                        <Form.Item
                            name="current_password"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                }, {
                                    min: 6,
                                    message: "At least 6 characters"
                                }
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="Current password" size="large" />
                        </Form.Item>
                        <Typography.Title level={3}>New password</Typography.Title>
                        <Form.Item
                            name="new_password"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                }, {
                                    min: 6,
                                    message: "At least 6 characters"
                                }
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="New password" size="large" />
                        </Form.Item>
                        <Typography.Title level={3}>Confirm new password</Typography.Title>
                        <Form.Item
                            name="confirm_new_password"
                            dependencies={['new_password']}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                }, {
                                    min: 6,
                                    message: "At least 6 characters"
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The new password that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="Confirm new password" size="large" />
                        </Form.Item>

                        <Flex vertical align="center" justify="center" className="button_group">
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="register">Change password</Button>
                            </Form.Item>
                        </Flex>
                    </Flex>
                </Form>
            </Flex >
        </Flex >
    )
}


