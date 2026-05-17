import { 
    PlusOutlined, 
    ToolOutlined,
    FilterOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Button, Col, Flex, Row, Select, Space, Table, Tag, Typography
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { listAdjustments } from '../../../../services/stock_adjustment_service';
import './StockAdjustment.css';

dayjs.locale('vi');

const { Title, Text } = Typography;

const REASON_OPTIONS = [
    { value: 'expired', label: '🕐 Hết hạn sử dụng', color: 'red' },
    { value: 'damaged', label: '💥 Hư hỏng / Dập nát', color: 'orange' },
    { value: 'lost', label: '🔍 Thất thoát / Mất hàng', color: 'purple' },
    { value: 'other', label: '📝 Lý do khác', color: 'default' },
];

const reasonTag = (r) => {
    const opt = REASON_OPTIONS.find(o => o.value === r);
    return opt ? <Tag color={opt.color} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4 }}>{opt.label}</Tag> : <Tag>{r}</Tag>;
};

export const StockAdjustment = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [reasonFilter, setReasonFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['stock_adjustments', page, reasonFilter],
        queryFn: () => listAdjustments(page, reasonFilter),
    });

    const docs = data?.data?.docs || [];
    const total = data?.data?.totalDocs || 0;

    const columns = [
        {
            title: '#',
            align: 'center',
            width: 60,
            render: (_, __, idx) => (page - 1) * 8 + idx + 1
        },
        {
            title: 'Ngày kiểm kê',
            dataIndex: 'adjustmentDate',
            width: 140,
            align: 'center',
            render: (d) => <Text strong>{dayjs(d).format('DD/MM/YYYY')}</Text>
        },
        {
            title: 'Sản phẩm hủy',
            dataIndex: 'products',
            render: (products) => (
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    {products?.map((p, i) => (
                        <Flex key={i} align="center" gap={8}>
                            <Text strong style={{ color: '#1a3353' }}>{p.productId?.name || 'Sản phẩm đã bị xóa'}</Text>
                            <Tag color="volcano" style={{ fontWeight: 600 }}>-{p.quantity} {p.productId?.unit}</Tag>
                            {reasonTag(p.reason)}
                        </Flex>
                    ))}
                </Space>
            )
        },
        {
            title: 'Ước tính thiệt hại',
            dataIndex: 'totalLoss',
            width: 180,
            align: 'right',
            render: (v) => <Text type="danger" strong style={{ fontSize: 15 }}>{v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
        },
        {
            title: 'Người lập',
            dataIndex: 'userId',
            width: 160,
            render: (u) => u ? <Text style={{ color: '#595959' }}>{`${u.firstName} ${u.lastName}`}</Text> : '—'
        },
        {
            title: 'Thao tác',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <Button 
                    type="link" 
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(`/admin/inventory/adjustment/${record._id}`)}
                    style={{ fontWeight: 600 }}
                >
                    Chi tiết
                </Button>
            )
        }
    ];

    return (
        <Flex vertical gap={24} className="stock-adjustment-container">
            {/* Header section */}
            <Flex justify="space-between" align="center" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
                <Space align="center" size={12}>
                    <div style={{ background: '#f9f0ff', padding: '8px 12px', borderRadius: 8 }}>
                        <ToolOutlined style={{ fontSize: 22, color: '#722ed1' }} />
                    </div>
                    <Flex vertical>
                        <Title level={4} style={{ margin: 0, color: '#1a3353' }}>Phiếu kiểm kê & Hủy hàng</Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>Quản lý thất thoát, hư hỏng và điều chỉnh số lượng tồn kho</Text>
                    </Flex>
                </Space>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => navigate('/admin/inventory/adjustment/create')} 
                    size="large" 
                    style={{ borderRadius: 8, background: '#722ed1', borderColor: '#722ed1' }}
                >
                    Tạo phiếu hủy hàng
                </Button>
            </Flex>

            {/* Filter section */}
            <Flex align="center" gap={12} style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                <Space>
                    <FilterOutlined style={{ color: '#8c8c8c' }} />
                    <Text strong>Bộ lọc lý do:</Text>
                </Space>
                <Select
                    allowClear
                    placeholder="Tất cả lý do hủy"
                    style={{ width: 240 }}
                    size="large"
                    options={REASON_OPTIONS}
                    onChange={(v) => { setReasonFilter(v || ''); setPage(1); }}
                />
            </Flex>

            {/* Table section */}
            <Table
                bordered
                rowKey="_id"
                columns={columns}
                dataSource={docs}
                loading={isLoading}
                pagination={{ current: page, total, pageSize: 8, onChange: setPage, hideOnSinglePage: true }}
                locale={{ emptyText: <Text type="secondary">Chưa có phiếu kiểm kê nào.</Text> }}
            />
        </Flex>
    );
};

export default StockAdjustment;
