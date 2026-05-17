import { CommentOutlined, SendOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Flex, FloatButton, Form, Input, Layout, Typography } from 'antd'
import { useContext, useEffect, useRef, useState, useMemo } from 'react'
import { io } from 'socket.io-client'
import { detail_room, send_message } from '../../../../services/chat_service'
import { UserContext } from '../../../../store/user'
import animationData from '../../../../utils/animation.json'
import Notification from '../../../../utils/configToastify'
import Lottie from 'react-lottie'
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
    const socket = useMemo(() => io(END_POINT), [userId]);
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
                userId: item?.userId?._id,
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
        onSuccess: (res) => {
            socket.emit("new message", { ...res.data, sender: userId });
            const newMsg = res.data.message[res.data.message.length - 1];
            const mappedMsg = {
                content: newMsg.content,
                id: newMsg._id,
                userId: newMsg.userId?._id || userId,
                role: newMsg.userId?.role || state?.currentUser?.role,
                day: newMsg.day
            };
            setUni(prev => [...prev, mappedMsg]);
        },
        onError: () => Notification({ message: "Gửi tin nhắn thất bại!", type: "error" })
    })

    const typingTimeoutRef = useRef(null);

    const typingHandler = () => {
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", userId);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop typing", userId);
            setTyping(false);
        }, 2000);
    };

    const onFinish = (e) => {
        if (!e.content?.trim()) return;
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("stop typing", userId);
        setTyping(false);

        mutate({ ...e, roomId: userId })
        form.setFieldValue('content', '')
    }


    useEffect(() => {
        socket.emit("setup", userId);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
        return () => {
            socket.off('connected');
            socket.off('typing');
            socket.off('stop typing');
        }
    }, [socket, userId]);
    const [uni, setUni] = useState([])


    useEffect(() => {
        if (contentRef.current) {
            // Increased delay to 300ms to ensure all UI animations/renders are complete
            const timer = setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [message, uni, istyping]);
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

    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (open) {
            // Force scroll when widget opens
            setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
            }, 300);
        }
    }

    return (
        <FloatButton.Group
            trigger='click'
            open={isOpen}
            onOpenChange={handleOpenChange}
            style={{ left: "40px", bottom: "20px", margin: 0 }}
            type="primary" 
            icon={<CommentOutlined />}
        >
            <Layout className='chatbox'>
                <div className='chatbox_header'>
                    <Flex align='center' gap={8} style={{ width: "100%" }}>
                        <div className="status-indicator"></div>
                        <div>
                            <Typography.Text className='chatbox_header--text' strong>
                                Support Assistant
                            </Typography.Text>
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", marginTop: "-4px" }}>
                                Online now
                            </div>
                        </div>
                    </Flex>
                </div>
                
                <Content className='chatbox_body' ref={contentRef}>
                    <Message message={message} append={uni} currentUserId={userId} />
                    {istyping && (
                        <Flex justify="flex-start" style={{ padding: "0 10px", marginTop: "8px", marginBottom: "15px" }}>
                            <div className="message-bubble-them" style={{ padding: "4px 14px", display: "flex", alignItems: "center", margin: 0 }}>
                                <Lottie
                                    options={defaultOptions}
                                    width={40}
                                    height={24}
                                    style={{ margin: 0, opacity: 0.6 }}
                                />
                            </div>
                        </Flex>
                    )}
                </Content>
                
                <Footer className='chatbox_footer'>
                    <Form onFinish={onFinish} form={form}>
                        <Flex gap={10} align="center">
                            <Form.Item style={{ flex: 1 }} name={'content'}>
                                <Input 
                                    className='chatbox_footer--input' 
                                    placeholder='Type your message...' 
                                    size="large"
                                    onChange={typingHandler}
                                />
                            </Form.Item>
                            <Button 
                                htmlType='submit' 
                                type='primary' 
                                shape="circle"
                                icon={<SendOutlined />} 
                                size="large"
                            />
                        </Flex>
                    </Form>
                </Footer>
            </Layout>
        </FloatButton.Group>
    )
}
