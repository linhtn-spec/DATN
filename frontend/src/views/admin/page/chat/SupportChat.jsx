import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Avatar, Button, Flex, Form, Input, Layout, Result, Typography } from 'antd'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { io } from 'socket.io-client'
import { detail_room, send_message } from '../../../../services/chat_service'
import { UserContext } from '../../../../store/user'
import Notification from '../../../../utils/configToastify'
import { MessageRender } from './MessageRender'
import './SupportChat.css'

const { Header, Footer, Content } = Layout;
const END_POINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:5000";

export const SupportChat = () => {
    const { chat_id } = useParams()
    const [message, setMessage] = useState([])
    const [info, setInfo] = useState({})
    const { state } = useContext(UserContext)
    const [form] = Form.useForm()
    const contentRef = useRef(null);
    const socket = useMemo(() => io(END_POINT), [chat_id]);

    const { data, isSuccess, isLoading } = useQuery({
        queryKey: ['chat_support_admin_detail', chat_id],
        queryFn: () => detail_room(chat_id),
        enabled: !!chat_id
    })

    useEffect(() => {
        if (!isSuccess || !data) return;

        setMessage(data?.data?.message.map(item => ({
            content: item?.content,
            role: item?.userId?.role,
            userId: item?.userId?._id,
            id: item?._id,
            day: item?.day
        })))

        setInfo({
            name: data?.data?.roomId?.firstName + " " + data?.data?.roomId?.lastName,
            role: data?.data?.roomId?.role
        })

        socket.emit("join chat", chat_id);

        return () => {
            setMessage([])
            setInfo({})
        }
    }, [data, isSuccess, chat_id])

    const { mutate } = useMutation({
        mutationFn: (data) => send_message(data),
        onSuccess: (res) => {
            socket.emit("new message", { ...res.data, sender: state?.currentUser?.user_id });
            const newMsg = res.data.message[res.data.message.length - 1];
            const mappedMsg = {
                content: newMsg.content,
                id: newMsg._id,
                userId: newMsg.userId?._id || state?.currentUser?.user_id,
                role: newMsg.userId?.role || state?.currentUser?.role,
                day: newMsg.day
            };
            setUni(prev => [...prev, mappedMsg]);
        },
        onError: () => Notification({ message: "Gửi tin nhắn thất bại", type: "error" })
    })

    const onFinish = (e) => {
        if (!e.content?.trim()) return;
        mutate({ ...e, roomId: chat_id })
        form.resetFields()
    }

    useEffect(() => {
        socket.emit("setup", state?.currentUser?.user_id);
        return () => socket.off();
    }, [state, socket]);

    const [uni, setUni] = useState([])

    useEffect(() => {
        if (contentRef.current) {
            const timer = setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [message, uni]);

    useEffect(() => {
        socket.on("message recieved", (newMessageReceived) => {
            if (newMessageReceived) {
                const rawData = newMessageReceived?.message.map(item => ({
                    content: item?.content,
                    id: item?._id,
                    userId: item?.userId?._id,
                    role: item?.userId?.role,
                    day: item?.day
                }))
                const filteredArr1 = rawData.filter(item => !message.some(m => m.id === item.id));
                setUni(filteredArr1)
            }
        });
        return () => socket.off("message recieved");
    }, [socket, message]);

    if (!chat_id) {
        return (
            <div className="chat-empty-state">
                <Result
                    icon={<UserOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />}
                    title="Select a chat to start messaging"
                />
            </div>
        )
    }

    return (
        <Layout style={{ height: "100%", background: "#fff" }}>
            <Header style={{
                background: "#fff",
                padding: "0 24px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                height: "70px"
            }}>
                <Flex align="center" gap={12} style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar size="large" style={{ backgroundColor: 'var(--primary-color)' }}>
                        {info?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography.Text strong style={{ fontSize: "16px", display: "block", lineHeight: "1.2" }}>
                            {info?.name}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                            Customer
                        </Typography.Text>
                    </div>
                </Flex>
            </Header>

            <Content
                ref={contentRef}
                style={{
                    padding: "24px",
                    overflowY: "auto",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <MessageRender message={message} append={uni} currentUserId={state?.currentUser?.user_id} />
            </Content>

            <Footer style={{ background: "#fff", padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
                <Form onFinish={onFinish} form={form}>
                    <Flex gap={12}>
                        <Form.Item name='content' style={{ flex: 1, margin: 0 }}>
                            <Input
                                placeholder='Type a message...'
                                size="large"
                                style={{ borderRadius: "24px" }}
                            />
                        </Form.Item>
                        <Button
                            htmlType='submit'
                            type="primary"
                            shape="circle"
                            icon={<SendOutlined />}
                            size="large"
                        />
                    </Flex>
                </Form>
            </Footer>
        </Layout>
    )
}
