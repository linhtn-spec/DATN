import { GoogleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Divider, Flex, Form, Input, Typography } from "antd";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../../services/user_service";
import { ACTION_LOG } from "../../../store/typeLog";
import { LogContext } from "../../../store/typeLog/provider";
import { ACTION_USER, UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import "./login.css";
function Login() {
    const { dispatch } = useContext(UserContext)
    const logGoogle = useContext(LogContext)
    const navigate = useNavigate()
    const { mutate, isPending } = useMutation({
        mutationKey: ['login'],
        mutationFn: (data) => login(data),
        onSuccess: (response) => {
            console.log(response);
            Notification({ message: "Đăng nhập thành công!", type: "success" })
            dispatch({ type: ACTION_USER.LOGIN, payload: response.data })
            if (response.data.role === 0)
                navigate('/client')
            else
                navigate('/admin')
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const loginByGoogle = () => {
        logGoogle.dispatch({ type: ACTION_LOG.IN })
        const socketEndpoint = import.meta.env.VITE_SOCKET_ENDPOINT || 'http://localhost:5000';
        window.open(`${socketEndpoint}/api/auth/google`, '_self')
    }


    const hanldeLogin = (e) => {
        mutate(e)
    }

    useEffect(() => { document.title = "Đăng nhập" }, [])



    return (

        <Flex className="login_wrap" justify="center" align="center">
            <Flex className="login_panel" vertical align="center">
                <Flex className="wrap_logo d-flex justify-content-center align-items-center" align="center" justify="center"><img src="/images/icon/scart-mid.png" alt="logo" /></Flex>
                <Typography.Title level={2}>Đăng nhập</Typography.Title>
                <Form
                    style={{ width: "100%", padding: "0 20px" }}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 100 }}
                    layout="horizontal"
                    onFinish={hanldeLogin}>
                    <Form.Item
                        name="email"
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập email hoặc tên đăng nhập!',
                            }
                        ]}
                    >
                        <Input placeholder="Email hoặc Tên đăng nhập" size="large" />
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
                    <Flex vertical align="center" justify="center" className="button_group">
                        <Link to={'/forget-password'}>Quên mật khẩu?</Link>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login" loading={isPending}>Đăng nhập</Button>
                        </Form.Item>
                        <Typography.Text>Chưa có tài khoản? <Link to={'/register'}>Đăng ký ngay</Link></Typography.Text>
                    </Flex>
                </Form>
                <Divider>Hoặc</Divider>
                <Flex vertical align="center" className="button_group" gap={'10px'} style={{ paddingLeft: 20, paddingRight: 20, width: "100%", }}>
                    <Button icon={<GoogleOutlined />} className="google" style={{ backgroundColor: "#18228f", lineHeight: "30px", color: "white", width: "100%" }}
                        onClick={loginByGoogle}
                    >Đăng nhập bằng Google</Button>
                    <Flex style={{ width: "100%" }} justify="flex-end">
                        <Button type="link" href="/client" style={{ marginBottom: "20px", fontWeight: 600, fontSize: "14px", paddingRight: 0 }}>Xem sản phẩm của chúng tôi?</Button>
                    </Flex>
                </Flex>

            </Flex>
        </Flex >
    );
}

export default Login;