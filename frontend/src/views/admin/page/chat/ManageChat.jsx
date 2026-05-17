import { useQuery } from '@tanstack/react-query'
import { Flex, Typography, Empty, Spin, Input, Badge } from 'antd'
import React, { useEffect, useState, useMemo, useContext } from 'react'
import { list_room } from '../../../../services/chat_service'
import { useNavigate, useParams } from 'react-router'
import { SearchOutlined } from '@ant-design/icons'
import { UserContext } from '../../../../store/user'
import { io } from 'socket.io-client'

const END_POINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:5000";

export const ManageChat = ({ isSidebar = false }) => {
    const navigate = useNavigate()
    const { chat_id } = useParams()
    const [items, setItems] = useState([])
    const [searchText, setSearchText] = useState('')
    const { state } = useContext(UserContext)
    
    const { data, isSuccess, isLoading, refetch } = useQuery({
        queryKey: ['list_chat_admin'],
        queryFn: () => list_room()
    })

    const onSelectRoom = (id) => {
        navigate(`/admin/customer-support/${id}`)
    }

    const socket = useMemo(() => io(END_POINT), []);

    // Refetch room lists periodically or when chat_id changes to keep unread counts updated
    useEffect(() => {
        refetch();
    }, [chat_id, refetch]);

    useEffect(() => {
        socket.on("chat list update", () => {
            refetch();
        });
        return () => socket.off("chat list update");
    }, [socket, refetch]);

    useEffect(() => {
        if (!isSuccess || !data?.data) return
        
        const mappedItems = data.data.map(item => {
            const messages = item?.message || [];
            const lastMsgObj = messages[messages.length - 1];
            
            const unreadCount = messages.filter(msg => {
                const senderId = msg.userId && msg.userId._id ? msg.userId._id.toString() : msg.userId?.toString();
                return !msg.isRead && senderId !== state?.currentUser?.user_id;
            }).length;

            return {
                key: item?._id,
                roomId: item?.roomId?._id,
                customer: item?.roomId?.firstName + " " + item?.roomId?.lastName,
                lastMessage: lastMsgObj?.content || "No messages yet",
                unreadCount: unreadCount,
                lastMessageTime: (lastMsgObj?.createdAt || lastMsgObj?.day) 
                                    ? new Date(lastMsgObj.createdAt || lastMsgObj.day).getTime() 
                                    : 0
            };
        });

        const sortedItems = mappedItems.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        
        setItems(sortedItems);
    }, [isSuccess, data, state?.currentUser?.user_id])

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            item.customer.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [items, searchText])

    if (isLoading) return <Flex justify="center" align="center" style={{ height: "100%" }}><Spin /></Flex>

    return (
        <Flex vertical style={{ height: "100%", background: isSidebar ? "transparent" : "#fff" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #f0f0f0" }}>
                <Typography.Title level={4} style={{ marginBottom: 16 }}>Chats</Typography.Title>
                <Input 
                    placeholder="Search customers..." 
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ borderRadius: '20px' }}
                    allowClear
                />
            </div>
            
            <Flex vertical style={{ overflowY: "auto", flex: 1 }}>
                {filteredItems.length === 0 ? (
                    <Empty description={searchText ? "No matches found" : "No chat rooms found"} style={{ marginTop: 40 }} />
                ) : (
                    filteredItems.map((room) => (
                        <div
                            key={room.key}
                            className={`room-item ${chat_id === room.roomId ? 'active' : ''}`}
                            onClick={() => onSelectRoom(room.roomId)}
                            style={{ position: 'relative' }}
                        >
                            <div className="room-item-avatar">
                                {room.customer.charAt(0).toUpperCase()}
                            </div>
                            <div className="room-item-info">
                                <div className="room-item-name">{room.customer}</div>
                                <div 
                                    className="room-item-last-msg"
                                    style={{
                                        fontWeight: room.unreadCount > 0 ? '700' : '400',
                                        color: room.unreadCount > 0 ? '#1f1f1f' : '#8c8c8c'
                                    }}
                                >
                                    {room.lastMessage}
                                </div>
                            </div>
                            {room.unreadCount > 0 && (
                                <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                                    <Badge count={room.unreadCount} style={{ backgroundColor: '#f5222d' }} />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </Flex>
        </Flex>
    )
}

export default ManageChat;
