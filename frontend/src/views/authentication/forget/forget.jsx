import { MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Flex, Form, Input, Typography } from "antd";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgetPassword } from "../../../services/user_service";
import Notification from "../../../utils/configToastify";
import "./forget.css";

function Forget() {
    const [form] = Form.useForm();
    const navigate = useNavigate()
    const { mutate, isPending } = useMutation({
        mutationKey: ['forget_password'],
        mutationFn: (data) => forgetPassword(data),
        onSuccess: () => {
            Notification({ message: "Gửi email thành công! Vui lòng kiểm tra hộp thư của bạn.", type: "success" })
            navigate('/')
        },
        onError: (error) => Notification({ message: error?.response?.data || "Cung cấp email thất bại!", type: "error" })
    })

    useEffect(() => { document.title = "Quên mật khẩu" }, [])

    return (
        <Flex className="forget_wrap" justify="center" align="center">
            <Flex className="forget_panel" vertical align="center">
                <Flex className="wrap_logo" align="center" justify="center">
                    <img src="/images/icon/scart-mid.png" alt="logo" />
                </Flex>

                <div className="forget_header">
                    <SafetyCertificateOutlined className="forget_icon" />
                    <Typography.Title level={2} className="forget_title">Quên mật khẩu?</Typography.Title>
                    <Typography.Text type="secondary" className="forget_subtitle">
                        Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
                    </Typography.Text>
                </div>

                <Form
                    style={{ width: "100%" }}
                    form={form}
                    layout="vertical"
                    size="large"
                    onFinish={mutate}
                >
                    <Form.Item
                        name="email"
                        label={<span className="forget_label">Địa chỉ Email</span>}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { min: 6, message: "Tối thiểu 6 ký tự" },
                            { type: 'email', message: 'Định dạng email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="forget_input_icon" />}
                            type="email"
                            placeholder="example@email.com"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="forget_submit_btn"
                            loading={isPending}
                            block
                        >
                            Gửi liên kết đặt lại
                        </Button>
                    </Form.Item>
                </Form>

                <Link to={'/'} className="forget_back_link">← Quay lại đăng nhập</Link>
            </Flex>
        </Flex>
    );
}

export default Forget;