import { CommentOutlined, SendOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Flex, FloatButton, Form, Input, Layout, Typography } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { detail_room, send_message } from '../../../../services/chat_service'
import { UserContext } from '../../../../store/user'
import animationData from '../../../../utils/animation.json'
import Notification from '../../../../utils/configToastify'
import './ChatWidget.css'
import { Message } from './Message'
const END_POINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:5000";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

export const ChatWidget = () => {
    const { Footer, Content } = Layout
    const { state } = useContext(UserContext)
    const userId = state?.currentUser?.user_id
    const socket = io(END_POINT);
    const contentRef = useRef(null);
    const [form] = Form.useForm()

    const [typing, setTyping] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [dataReceive, setDataReceive] = useState({})
    const [message, setMessage] = useState([])
    const { data, refetch, isSuccess } = useQuery({
        queryKey: ['chat_user', userId],
        queryFn: () => detail_room(userId),
        enabled: !!userId,
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        if (!isSuccess) {
            setLoading(true)
            return
        }
        else {
            setMessage(data?.data?.message.map(item => ({
                content: item?.content,
                role: item?.userId?.role,
                id: item?._id
            })))
            setLoading(false);
            socket.emit("join chat", userId);
        }
        return () => {
            setMessage([])
        }
    }, [data, isSuccess, userId])

    const { mutate } = useMutation({
        mutationFn: (data) => send_message(data),
        onSuccess: (data) => {
            socket.emit("new message", { ...data.data, sender: userId });
            setDataReceive(data?.data)
        },
        onError: () => Notification({ message: "Send message fail", type: "error" })
    })

    const onFinish = (e) => {
        mutate({ ...e, roomId: userId })
        form.setFieldValue('content', '')
    }


    useEffect(() => {
        socket.emit("setup", userId);
        socket.on("connected", () => setSocketConnected(true));
        return () => socket.off('connected');

    }, [socket, userId]);
    const [uni, setUni] = useState([])


    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight + (68 * uni.length);
        }
    }, [message, uni]);
    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (newMessageRecieved) {
                const rawData = newMessageRecieved?.message.map(item => ({ content: item?.content, id: item?._id, role: item?.userId?.role }))
                const filteredArr1 = rawData.filter(item => !message.includes(item));
                setUni(filteredArr1)
            }
        });
    }, [socket, message]);

    return (
        <FloatButton.Group
            trigger='click'
            style={{ left: "40px", bottom: "20px", margin: 0 }}
            type="primary" icon={<CommentOutlined />}
        >
            <Flex>
                <Layout className='chatbox'>
                    <Flex className='chatbox_header' justify='space-between' align='center'>
                        <Typography.Title level={4} className='chatbox_header--text'>Chatbox</Typography.Title>
                    </Flex>
                    <Content className='chatbox_body' ref={contentRef}>
                        <Message message={message} append={uni} />

                    </Content>
                    <Footer className='chatbox_footer'>
                        <Form onFinish={onFinish} form={form}>
                            <Flex gap={10} style={{ padding: "10px" }}>
                                <Form.Item style={{ width: "80%" }} name={'content'}>
                                    <Input className='chatbox_footer--input' placeholder='Type here' />
                                </Form.Item>
                                <Form.Item>
                                    <Button htmlType='submit' type='primary' icon={<SendOutlined />}>Send</Button>
                                </Form.Item>
                            </Flex>
                        </Form>
                    </Footer>
                </Layout>
            </Flex>
        </FloatButton.Group>

    )
}
