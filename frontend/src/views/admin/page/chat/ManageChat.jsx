import { useQuery } from '@tanstack/react-query'
import { Flex, Typography, Empty, Spin, Input } from 'antd'
import React, { useEffect, useState, useMemo } from 'react'
import { list_room } from '../../../../services/chat_service'
import { useNavigate, useParams } from 'react-router'
import { SearchOutlined } from '@ant-design/icons'

export const ManageChat = ({ isSidebar = false }) => {
    const navigate = useNavigate()
    const { chat_id } = useParams()
    const [items, setItems] = useState([])
    const [searchText, setSearchText] = useState('')
    const { data, isSuccess, isLoading } = useQuery({
        queryKey: ['list_chat_admin'],
        queryFn: () => list_room()
    })

    const onSelectRoom = (id) => {
        navigate(`/admin/customer-support/${id}`)
    }

    useEffect(() => {
        if (!isSuccess) return
        setItems(data?.data.map(item => ({
            key: item?._id,
            roomId: item?.roomId?._id,
            customer: item?.roomId?.firstName + " " + item?.roomId?.lastName,
            lastMessage: item?.message[item?.message.length - 1]?.content || "No messages yet"
        })))
    }, [isSuccess, data])

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
                        >
                            <div className="room-item-avatar">
                                {room.customer.charAt(0).toUpperCase()}
                            </div>
                            <div className="room-item-info">
                                <div className="room-item-name">{room.customer}</div>
                                <div className="room-item-last-msg">{room.lastMessage}</div>
                            </div>
                        </div>
                    ))
                )}
            </Flex>
        </Flex>
    )
}
