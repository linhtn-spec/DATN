import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Flex, Form, Input, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../../services/user_service";
import Notification from "../../../utils/configToastify";
import "./reset.css";

function Reset() {
    const navigate = useNavigate()
    const { token } = useParams()
    const [form] = Form.useForm();
    const { mutate, isPending } = useMutation({
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
                <Flex className="wrap_logo" align="center" justify="center">
                    <img src="/images/icon/scart-mid.png" alt="logo" />
                </Flex>

                <div className="reset_header">
                    <SafetyCertificateOutlined className="reset_icon" />
                    <Typography.Title level={2} className="reset_title">Đặt lại mật khẩu</Typography.Title>
                    <Typography.Text type="secondary" className="reset_subtitle">
                        Tạo mật khẩu mới an toàn cho tài khoản của bạn.
                    </Typography.Text>
                </div>

                <Form
                    form={form}
                    style={{ width: "100%" }}
                    layout="vertical"
                    size="large"
                    onFinish={mutate}
                >
                    <Form.Item
                        label={<span className="reset_label">Mật khẩu mới</span>}
                        name="password"
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: "Tối thiểu 6 ký tự" }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="reset_input_icon" />}
                            visibilityToggle
                            placeholder="Nhập mật khẩu mới"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="reset_label">Xác nhận mật khẩu mới</span>}
                        name="confirm_password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            { min: 6, message: "Tối thiểu 6 ký tự" },
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
                        <Input.Password
                            prefix={<LockOutlined className="reset_input_icon" />}
                            visibilityToggle
                            placeholder="Xác nhận lại mật khẩu mới"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="reset_submit_btn"
                            loading={isPending}
                            block
                        >
                            Xác nhận đặt lại
                        </Button>
                    </Form.Item>
                </Form>
            </Flex>
        </Flex>
    );
}

export default Reset;