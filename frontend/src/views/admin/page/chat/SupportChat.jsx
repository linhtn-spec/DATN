import { SendOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Card, Flex, Form, Input, Layout } from 'antd'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { io } from 'socket.io-client'
import { detail_room, send_message } from '../../../../services/chat_service'
import { UserContext } from '../../../../store/user'
import Notification from '../../../../utils/configToastify'
import { MessageRender } from './MessageRender'
import './SupportChat.css'
const END_POINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:5000";
export const SupportChat = () => {
    const { Footer, Content } = Layout
    const { chat_id } = useParams()
    const [message, setMessage] = useState([])
    const [info, setInfo] = useState({})
    const [typing, setTyping] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [dataReceive, setDataReceive] = useState({})
    const [receiveMessage, setReceiveMessage] = useState({})
    const { state } = useContext(UserContext)
    const [form] = Form.useForm()
    const contentRef = useRef(null);

    const { data, refetch, isSuccess } = useQuery({
        queryKey: ['chat_support_admin_detail', chat_id],
        queryFn: () => detail_room(chat_id),
    })
    const socket = io(END_POINT);

    useEffect(() => {
        if (!isSuccess) {
            setLoading(true)
            return
        }
        setMessage(data?.data?.message.map(item => ({
            content: item?.content,
            role: item?.userId?.role,
            id: item?._id
        })))

        setInfo({ name: data?.data?.roomId?.firstName + " " + data?.data?.roomId?.lastName })
        setLoading(false)
        socket.emit("join chat", chat_id);

        return () => {
            setMessage([])
            setInfo({})
        }
    }, [data, isSuccess])

    const { mutate } = useMutation({
        mutationFn: (data) => send_message(data),
        onSuccess: (data) => {
            socket.emit("new message", { ...data.data, sender: state?.currentUser?.user_id })
            setDataReceive(data?.data)
        },
        onError: () => Notification({ message: "Gửi tin nhắn thất bại", type: "error" })
    })


    const onFinish = (e) => {
        mutate({ ...e, roomId: chat_id })
        form.setFieldValue('content', '')

    }


    useEffect(() => {
        socket.emit("setup", state?.currentUser?.user_id);
        socket.on("connected", () => setSocketConnected(true));
        return () => socket.off('connected');

    }, [state, socket]);
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
    useEffect(() => {
        document.title = "Hỗ trợ"

    }, [])
    return (
        <Flex className='admin_chat_box'>
            <Card title={info?.name} style={{ width: "100%" }}>
                <Layout>

                    <Content className='chatbox_body' ref={contentRef}>
                        <MessageRender message={message} append={uni} />
                    </Content>
                    <Footer className='_footer'>
                        <Form onFinish={onFinish} form={form}>
                            <Flex gap={10} style={{ padding: "10px" }} justify='space-between'>
                                <Form.Item style={{ width: "90%" }} name='content'>
                                    <Input className='chatbox_footer--input' placeholder='Nhập nội dung...' />
                                </Form.Item>
                                <Form.Item>
                                    <Button htmlType='submit' type='primary' icon={<SendOutlined />}>Gửi</Button>
                                </Form.Item>
                            </Flex>
                        </Form>
                    </Footer>
                </Layout>
            </Card>
        </Flex>
    )
}
