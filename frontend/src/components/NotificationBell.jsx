import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Popover, List, Typography, Button, Space, message, notification } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import io from 'socket.io-client';
import { notificationService } from '../services/notification_service';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const { Text } = Typography;
const END_POINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:5000";

// NotificationBell component takes an optional userId. If userId is null, it's admin/global.
export default function NotificationBell({ userId }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const socket = useMemo(() => io(END_POINT, { withCredentials: true }), []);

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const res = await notificationService.getNotifications(userId);
            return res.data;
        }
    });

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    useEffect(() => {
        socket.on('new_notification', (payload) => {
            // Need to match payload.userId with this component's userId.
            // If payload has reload=true, meaning global event, or if userId matches.
            if (payload?.reload || payload?.userId === userId || (!payload?.userId && !userId)) {
                queryClient.invalidateQueries(['notifications', userId]);
            }
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket, userId, queryClient]);

    const markAsReadMut = useMutation({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications', userId]);
        }
    });

    const markAllAsReadMut = useMutation({
        mutationFn: () => notificationService.markAllAsRead(userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications', userId]);
        }
    });

    const deleteMut = useMutation({
        mutationFn: (id) => notificationService.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications', userId]);
        }
    });

    const handleNotificationClick = (item) => {
        if (!item.isRead) {
            markAsReadMut.mutate(item._id);
        }
        setOpen(false);
        if (item.link) {
            navigate(item.link);
        }
    };

    const content = (
        <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                <Text strong>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={() => markAllAsReadMut.mutate()} icon={<CheckOutlined />}>
                        Đánh dấu đã đọc tất cả
                    </Button>
                )}
            </div>
            <List
                loading={isLoading}
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            cursor: 'pointer',
                            backgroundColor: item.isRead ? 'transparent' : '#e6f7ff',
                            padding: '10px',
                            borderBottom: '1px solid #f0f0f0',
                            borderRadius: '4px'
                        }}
                        actions={[
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMut.mutate(item._id);
                                }}
                            />
                        ]}
                        onClick={() => handleNotificationClick(item)}
                    >
                        <List.Item.Meta
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong={!item.isRead}>{item.title}</Text>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        {dayjs(item.createdAt).locale('vi').format('DD/MM HH:mm')}
                                    </Text>
                                </div>
                            }
                            description={
                                <Text style={{ fontSize: '13px', color: item.isRead ? '#8c8c8c' : '#595959' }}>
                                    {item.message}
                                </Text>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: 'Không có thông báo nào' }}
            />
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
        >
            <button
                style={{
                    position: 'relative',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'inherit'
                }}
                className="cart" 
                // We use 'cart' class to attempt matching client's header CSS hover effects
            >
                <BellOutlined style={{ fontSize: '18px' }} />
                {unreadCount > 0 && (
                    <div style={{
                        backgroundColor: '#ff4d4f', 
                        borderRadius: '50%',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'white',
                        width: '18px',
                        height: '18px',
                        position: 'absolute',
                        textAlign: 'center',
                        lineHeight: '18px',
                        top: '-10px',
                        right: '-10px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </button>
        </Popover>
    );
}
