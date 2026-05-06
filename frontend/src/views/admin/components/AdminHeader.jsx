import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

/**
 * Reusable Header component for Admin pages
 * Includes a Back button and a Title
 */
const AdminHeader = ({ title, icon, showBack = true, onBack, extra }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <Flex justify="space-between" align="center" style={{ marginBottom: 24 }} className="admin-header">
            <Flex align="center" gap={12}>
                {showBack && (
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={handleBack}
                        type="text"
                        style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}
                    />
                )}
                <Typography.Title level={2} style={{ margin: 0, fontSize: '24px' }}>
                    {icon} <span style={{ marginLeft: 8 }}>{title}</span>
                </Typography.Title>
            </Flex>
            <div className="admin-header-extra">
                {extra}
            </div>
        </Flex>
    );
};

export default AdminHeader;
