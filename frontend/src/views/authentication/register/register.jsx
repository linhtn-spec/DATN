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
    const { mutate, isPending } = useMutation({
        mutationKey: ['register_account'],
        mutationFn: (data) => register(data),
        onSuccess: () => {
            Notification({ message: "Đăng ký thành công!", type: "success" })
            navigate('/')
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "error" })
    })

    useEffect(() => { document.title = "Đăng ký" }, [])

    return (

        <Flex className="register_wrap" justify="center" align="center">
            <Flex className="register_panel" vertical align="center">
                <Flex className="wrap_logo d-flex justify-content-center align-items-center" align="center" justify="center"><img src="/images/icon/scart-mid.png" alt="logo" /></Flex>
                <Typography.Title level={2}>Đăng ký tài khoản</Typography.Title>
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
                                    message: 'Vui lòng nhập họ!',
                                },
                                {
                                    min: 2,
                                    message: "Tối thiểu 2 ký tự"
                                },
                                {
                                    max: 50,
                                    message: "Tối đa 50 ký tự"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Họ" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên!',
                                },
                                {
                                    min: 2,
                                    message: "Tối thiểu 2 ký tự"
                                },
                                {
                                    max: 50,
                                    message: "Tối đa 50 ký tự"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Tên" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại!',
                                },
                                {
                                    min: 10,
                                    message: 'Tối thiểu 10 chữ số.',
                                },
                                {
                                    max: 13,
                                    message: 'Tối đa 13 chữ số.',
                                },
                            ]}
                        >
                            <Input type="number" style={{ width: '100%' }} placeholder="Số điện thoại" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            hasFeedback
                        >
                            <Select placeholder="Giới tính" size="large">
                                <Option value="male" >Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="email"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email!',
                                }, {
                                    min: 6,
                                    message: "Tối thiểu 6 ký tự"
                                },
                                {
                                    type: 'email',
                                    message: 'Vui lòng nhập đúng định dạng email'
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
                                    message: 'Vui lòng nhập tên đăng nhập!',
                                },
                                {
                                    min: 6,
                                    message: "Tối thiểu 6 ký tự"
                                },
                                {
                                    max: 50,
                                    message: "Tối đa 50 ký tự"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Tên đăng nhập" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="password"
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
                            <Input.Password visibilityToggle placeholder="Mật khẩu" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="confirm_password"
                            dependencies={['password']}
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
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password visibilityToggle placeholder="Xác nhận mật khẩu" size="large" />
                        </Form.Item>
                        <Flex vertical align="center" justify="center" className="button_group">
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="register" loading={isPending}>Đăng ký</Button>
                            </Form.Item>
                            <Typography.Text className="login">Đã có tài khoản? <Link to={'/'}>Đăng nhập</Link></Typography.Text>
                        </Flex>
                    </Flex>
                </Form>
            </Flex>
        </Flex >
    );
}

export default Register;