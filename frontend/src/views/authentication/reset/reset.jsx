import { Button, Flex, Form, Input, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import "./reset.css";
import { useEffect } from "react";
import Notification from "../../../utils/configToastify";
import { resetPassword } from "../../../services/user_service";
import { useMutation } from "@tanstack/react-query";
function Reset() {
    const navigate = useNavigate()
    const { token } = useParams()
    const [form] = Form.useForm();
    const { mutate } = useMutation({
        mutationKey: ['reset_password_forget'],
        mutationFn: (data) => resetPassword({ ...data, token: token }),
        onSuccess: () => {
            Notification({ message: "Đặt lại mật khẩu thành công!", type: "success" })
            navigate('/')
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "error" })

    })

    useEffect(() => { document.title = "Đặt lại mật khẩu" }, [])

    return (
        <Flex className="reset_wrap" justify="center" align="center">
            <Flex className="reset_panel" vertical align="center">
                <Flex className="wrap_logo d-flex justify-content-center align-items-center" align="center" justify="center"><img src="/images/icon/scart-mid.png" alt="logo" /></Flex>
                <Typography.Title level={2}>Đặt lại mật khẩu</Typography.Title>
                <Form
                    form={form}
                    style={{ width: "100%", padding: "0 20px" }}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 100 }}
                    layout="horizontal"
                    onFinish={mutate}>
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
                        <Input.Password visibilityToggle placeholder="Mật khẩu mới" size="large" />
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
                        <Input.Password visibilityToggle placeholder="Xác nhận mật khẩu mới" size="large" />
                    </Form.Item>
                    <Flex vertical align="center" justify="center" className="button_group">
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="reset">Xác nhận</Button>
                        </Form.Item>
                    </Flex>
                </Form>
            </Flex>
        </Flex >
    );
}

export default Reset;