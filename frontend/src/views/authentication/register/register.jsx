import { Button, Flex, Form, Input, Select, Typography } from "antd";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../../../utils/configToastify";
import { register } from "../../../services/user_service";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
function Register() {
    const { Option } = Select;
    const navigate = useNavigate()
    const { mutate } = useMutation({
        mutationKey: ['register_account'],
        mutationFn: (data) => register(data),
        onSuccess: () => {
            Notification({ message: "Register successfully!", type: "success" })
            navigate('/')
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "error" })
    })

    useEffect(() => { document.title = "Sign up" }, [])

    return (

        <Flex className="register_wrap" justify="center" align="center">
            <Flex className="register_panel" vertical align="center">
                <Flex className="wrap_logo d-flex justify-content-center align-items-center" align="center" justify="center"><img src="/images/icon/scart-mid.png" alt="logo" /></Flex>
                <Typography.Title level={2}>Sign up</Typography.Title>
                <Form
                    style={{ width: "100%", padding: "0 20px" }}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 100 }}
                    layout="horizontal"
                    onFinish={mutate}>
                    <Flex vertical >
                        <Form.Item
                            name="firstName"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                                {
                                    min: 3,
                                    message: "At least 3 characters"
                                },
                                {
                                    max: 50,
                                    message: "At max 50 characters"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="First name" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                                {
                                    min: 3,
                                    message: "At least 3 characters"
                                },
                                {
                                    max: 50,
                                    message: "At max 50 characters"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Last name" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                                {
                                    min: 10,
                                    message: 'At least 10 digits long.',
                                },
                                {
                                    max: 13,
                                    message: 'Maximum 13 digits long.',
                                },
                            ]}
                        >
                            <Input type="number" style={{ width: '100%' }} placeholder="Phone" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            rules={[{ required: true, message: 'Please select!' }]}
                            hasFeedback
                        >
                            <Select placeholder="Gender" size="large">
                                <Option value="male" >Male</Option>
                                <Option value="female">Female</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="email"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                }, {
                                    min: 6,
                                    message: "At least 6 characters"
                                },
                                {
                                    type: 'email',
                                    message: 'Please input an email address'
                                }
                            ]}
                        >
                            <Input type="email" placeholder="Email" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                                {
                                    min: 3,
                                    message: "At least 6 characters"
                                },
                                {
                                    max: 50,
                                    message: "At max 50 characters"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Username" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="password"
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
                            <Input.Password visibilityToggle placeholder="Password" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="confirm_password"
                            dependencies={['password']}
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
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The new password that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="Confirm password" size="large" />
                        </Form.Item>
                        <Flex vertical align="center" justify="center" className="button_group">
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="register">Sign up</Button>
                            </Form.Item>
                            <Typography.Text className="login">Have an account? <Link to={'/'}>Login</Link></Typography.Text>
                        </Flex>
                    </Flex>
                </Form>
            </Flex>
        </Flex >
    );
}

export default Register;