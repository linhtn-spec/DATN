import { Flex } from 'antd'
import React from 'react'
import './Message.css'
import Typography from 'antd/es/typography/Typography'
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons'
export const Message = ({ message, append, currentUserId }) => {
    const formatTime = (time) => {
        if (!time) return "";
        const date = new Date(time);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const combinedMessages = (message || []).concat(append || []);
    const uniqueMessages = Array.from(new Map(combinedMessages.filter(item => item && item.id).map(item => [item.id, item])).values());

    return (
        <Flex vertical className='message-list' gap={'12px'} style={{ padding: "0 10px" }}>
            {uniqueMessages.map((item, index) => {
                const isMe = item?.userId === currentUserId;
                const isLastMyMessage = isMe && uniqueMessages.slice(index + 1).findIndex(m => m.userId === currentUserId) === -1;

                return (
                    <Flex vertical align={isMe ? 'flex-end' : 'flex-start'} key={item?.id}>
                        <div className={isMe ? 'message-bubble-me' : 'message-bubble-them'}>
                            <Typography.Text className="message-content">{item?.content}</Typography.Text>
                            {item?.day && (
                                <div className="message-time">
                                    {formatTime(item.day)}
                                </div>
                            )}
                        </div>
                        {isLastMyMessage && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {item?.isRead ? (
                                    <>
                                        <EyeOutlined style={{ fontSize: '12px' }} />
                                        <span>Đã xem</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleOutlined style={{ fontSize: '11px' }} />
                                        <span>Đã gửi</span>
                                    </>
                                )}
                            </div>
                        )}
                    </Flex>
                )
            })}
        </Flex>
    )
}
