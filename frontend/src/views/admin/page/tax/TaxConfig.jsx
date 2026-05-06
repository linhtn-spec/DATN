import React, { useEffect, useState } from 'react';
import { Table, InputNumber, Input, Button, Typography, Space, Card, message, Breadcrumb } from 'antd';
import { PercentageOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { getTaxConfig, updateTaxConfig } from '../../../../services/tax_service';

const { Title, Text } = Typography;

export const TaxConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await getTaxConfig();
            if (res.status === 200) {
                setConfig(res.data);
            } else {
                message.error("Không thể tải cấu hình thuế");
            }
        } catch (error) {
            message.error("Lỗi khi kết nối đến máy chủ");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const edit = () => {
        setEditing(true);
        setEditData({ label: config.label, rate: config.rate, description: config.description });
    };

    const cancel = () => {
        setEditing(false);
        setEditData({});
    };

    const save = async () => {
        try {
            const res = await updateTaxConfig(config._id, editData);
            if (res.status === 200) {
                message.success("Cập nhật thuế thành công");
                setEditing(false);
                fetchConfig();
            } else {
                message.error("Cập nhật thất bại");
            }
        } catch (err) {
            message.error("Có lỗi xảy ra");
        }
    };

    const columns = [
        {
            title: 'Tên hiển thị',
            dataIndex: 'label',
            width: '25%',
            render: (text) => {
                if (editing) {
                    return (
                        <Input
                            value={editData.label}
                            onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                        />
                    );
                }
                return <Text strong>{text}</Text>;
            }
        },
        {
            title: 'Tỷ lệ thu thuế (%)',
            dataIndex: 'rate',
            width: '20%',
            render: (text) => {
                if (editing) {
                    return (
                        <InputNumber
                            min={0}
                            max={100}
                            formatter={value => `${value}`}
                            parser={value => value.replace('%', '')}
                            style={{ width: '100%' }}
                            value={editData.rate * 100}
                            onChange={(val) => setEditData({ ...editData, rate: val / 100 })}
                        />
                    );
                }
                return <Text>{(text * 100).toFixed(0)} %</Text>;
            }
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            width: '35%',
            render: (text) => {
                if (editing) {
                    return (
                        <Input.TextArea
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
            render: () => {
                return editing ? (
                    <Space>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={save}
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
                        onClick={edit}
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
                <Breadcrumb.Item>Mức Thuế (VAT)</Breadcrumb.Item>
            </Breadcrumb>

            <Card
                title={
                    <Space>
                        <PercentageOutlined />
                        <Title level={4} style={{ margin: 0 }}>Quản lý thuế (Tax/VAT)</Title>
                    </Space>
                }
            >
                <Table
                    loading={loading}
                    dataSource={config ? [config] : []}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                    bordered
                />
            </Card>
        </div>
    );
};
