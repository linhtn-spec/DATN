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
            Notification({ message: "Send email successfully!", type: "success" })
            navigate('/')
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "error" })
    })

    useEffect(() => { document.title = "Forget password" }, [])

    return (

        <Flex className="forget_wrap" justify="center" align="center">
            <Flex className="forget_panel" vertical align="center">
                <Flex className="wrap_logo d-flex justify-content-center align-items-center" align="center" justify="center"><img src="/images/icon/scart-mid.png" alt="logo" /></Flex>
                <Typography.Title level={2}>Forget password?</Typography.Title>
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

                    <Flex vertical align="center" justify="center" className="button_group">
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="complete">Complete</Button>
                        </Form.Item>
                    </Flex>

                </Form>
                <Link to={'/'} style={{ textAlign: "right", width: "100%", paddingRight: "20px", marginBottom: "20px", fontWeight: "400" }} >Back to login</Link>


            </Flex>
        </Flex >
    );
}

export default Forget;