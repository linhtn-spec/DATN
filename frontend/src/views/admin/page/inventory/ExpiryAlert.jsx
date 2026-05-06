import { WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Badge, Image, Radio, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { expiringSoon } from '../../../../services/cosignment_service';

const { Title, Text } = Typography;

const colourForDays = (days) => {
    if (days <= 1) return 'red';
    if (days <= 3) return 'orange';
    return 'gold';
};

export const ExpiryAlert = () => {
    const [days, setDays] = useState(7);

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ['expiring_soon', days],
        queryFn: () => expiringSoon(days),
    });

    const rows = isSuccess ? (data?.data || []).map((r, idx) => ({ key: idx, ...r })) : [];

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            render: (p) => p ? (
                <Space>
                    {p.images?.[0] && <Image src={p.images[0]} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />}
                    <Text strong>{p.name}</Text>
                    {p.unit && <Tag>{p.unit}</Tag>}
                </Space>
            ) : <Text type="secondary">—</Text>
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            align: 'center',
            width: 100,
            render: (q, row) => <Text>{q} {row?.product?.unit}</Text>
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'importDate',
            width: 130,
            align: 'center',
            render: (d) => dayjs(d).format('DD/MM/YYYY')
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expireDate',
            width: 130,
            align: 'center',
            render: (d) => <Text type="danger">{dayjs(d).format('DD/MM/YYYY')}</Text>
        },
        {
            title: 'Còn lại',
            dataIndex: 'daysLeft',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.daysLeft - b.daysLeft,
            defaultSortOrder: 'ascend',
            render: (d) => (
                <Tag color={colourForDays(d)} style={{ fontWeight: 700, fontSize: 13 }}>
                    {d <= 0 ? 'Đã hết hạn' : `Còn ${d} ngày`}
                </Tag>
            )
        },
        {
            title: 'Người nhập',
            dataIndex: 'importer',
            width: 150,
            render: (u) => u ? `${u.firstName} ${u.lastName}` : '—'
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space align="center">
                <WarningOutlined style={{ fontSize: 22, color: '#faad14' }} />
                <Title level={4} style={{ margin: 0 }}>Cảnh báo hàng sắp hết hạn</Title>
                {rows.length > 0 && <Badge count={rows.length} style={{ backgroundColor: '#ff4d4f' }} />}
            </Space>

            <Space>
                <Text>Lọc trong vòng:</Text>
                <Radio.Group value={days} onChange={(e) => setDays(e.target.value)} optionType="button" buttonStyle="solid">
                    <Radio.Button value={3}>3 ngày</Radio.Button>
                    <Radio.Button value={7}>7 ngày</Radio.Button>
                    <Radio.Button value={14}>14 ngày</Radio.Button>
                    <Radio.Button value={30}>30 ngày</Radio.Button>
                </Radio.Group>
            </Space>

            <Table
                bordered
                columns={columns}
                dataSource={rows}
                loading={isLoading}
                locale={{ emptyText: <Text type="success">🎉 Không có hàng nào sắp hết hạn trong {days} ngày tới!</Text> }}
                rowClassName={(row) => row.daysLeft <= 3 ? 'expiry-urgent-row' : ''}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
            />
        </Space>
    );
};

export default ExpiryAlert;
