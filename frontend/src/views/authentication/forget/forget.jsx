import { Button, Flex, Form, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./forget.css";
import { useEffect } from "react";
import { forgetPassword } from "../../../services/user_service";
import Notification from "../../../utils/configToastify";
import { useMutation } from "@tanstack/react-query";
function Forget() {
    const [form] = Form.useForm();
    const navigate = useNavigate()
    const { mutate } = useMutation({
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
                <Flex className="wrap_logo d-flex justify-content-center align-items-center" align="center" justify="center"><img src="/images/icon/scart-mid.png" alt="logo" /></Flex>
                <Typography.Title level={2}>Quên mật khẩu?</Typography.Title>
                <Form
                    style={{ width: "100%", padding: "0 20px" }}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 100 }}
                    form={form}
                    layout="horizontal"
                    onFinish={mutate}>
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
                                message: 'Định dạng email không hợp lệ!'
                            }
                        ]}
                    >
                        <Input type="email" placeholder="Email của bạn" size="large" />
                    </Form.Item>

                    <Flex vertical align="center" justify="center" className="button_group">
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="complete">Hoàn tất</Button>
                        </Form.Item>
                    </Flex>

                </Form>
                <Link to={'/'} style={{ textAlign: "right", width: "100%", paddingRight: "20px", marginBottom: "20px", fontWeight: "400" }} >Quay lại đăng nhập</Link>


            </Flex>
        </Flex >
    );
}

export default Forget;