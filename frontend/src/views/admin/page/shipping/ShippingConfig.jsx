import React, { useEffect, useState } from 'react';
import { Table, InputNumber, Button, Typography, Space, Card, message, Breadcrumb } from 'antd';
import { TruckOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { listShippingConfig, updateShippingConfig } from '../../../../services/shipping_service';

const { Title, Text } = Typography;

export const ShippingConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingKey, setEditingKey] = useState('');
    const [editData, setEditData] = useState({});

    const fetchConfigs = async () => {
        setLoading(true);
        const res = await listShippingConfig();
        if (res.status === 200) {
            setConfigs(res.data);
        } else {
            message.error("Không thể tải cấu hình vận chuyển");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const isEditing = (record) => record._id === editingKey;

    const edit = (record) => {
        setEditingKey(record._id);
        setEditData({ fee: record.fee, description: record.description });
    };

    const cancel = () => {
        setEditingKey('');
        setEditData({});
    };

    const save = async (id) => {
        try {
            const res = await updateShippingConfig(id, editData);
            if (res.status === 200) {
                message.success("Cập nhật thành công");
                setEditingKey('');
                fetchConfigs();
            } else {
                message.error("Cập nhật thất bại");
            }
        } catch (err) {
            message.error("Có lỗi xảy ra");
        }
    };

    const columns = [
        {
            title: 'Phương thức',
            dataIndex: 'method',
            width: '20%',
            render: (text) => {
                const labels = {
                    free: 'Miễn phí',
                    standard: 'Tiêu chuẩn',
                    express: 'Hỏa tốc'
                };
                return <Text strong>{labels[text] || text}</Text>;
            }
        },
        {
            title: 'Phí vận chuyển (₫)',
            dataIndex: 'fee',
            width: '25%',
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            value={editData.fee}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            onChange={(val) => setEditData({ ...editData, fee: val })}
                        />
                    );
                }
                return <Text>{text.toLocaleString('vi-VN')} ₫</Text>;
            }
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            width: '40%',
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <textarea
                            className="ant-input"
                            rows={2}
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        />
                    );
                }
                return <Text type="secondary">{text}</Text>;
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'operation',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => save(record._id)}
                        >
                            Lưu
                        </Button>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={cancel}
                        >
                            Hủy
                        </Button>
                    </Space>
                ) : (
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        disabled={editingKey !== ''}
                        onClick={() => edit(record)}
                    >
                        Chỉnh sửa
                    </Button>
                );
            },
        },
    ];

    return (
        <div style={{ padding: '0 20px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Admin</Breadcrumb.Item>
                <Breadcrumb.Item>Cấu hình</Breadcrumb.Item>
                <Breadcrumb.Item>Phí vận chuyển</Breadcrumb.Item>
            </Breadcrumb>

            <Card
                title={
                    <Space>
                        <TruckOutlined />
                        <Title level={4} style={{ margin: 0 }}>Quản lý phí vận chuyển</Title>
                    </Space>
                }
                className="shipping-config-card"
            >
                <Table
                    loading={loading}
                    dataSource={configs}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                    bordered
                />
            </Card>
        </div>
    );
};
