import { 
    ToolOutlined,
    CalendarOutlined,
    ShoppingOutlined,
    FieldNumberOutlined,
    ExceptionOutlined,
    FileTextOutlined,
    UserOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Button, Col, Flex, Row, Typography, Card, Divider, Tag
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useNavigate, useParams } from 'react-router';
import { detailAdjustment } from '../../../../services/stock_adjustment_service';
import AdminHeader from "../../components/AdminHeader";
import AdjustmentFormSkeleton from './AdjustmentFormSkeleton';
import './DetailAdjustment.css';

dayjs.locale('vi');

const { Text, Title } = Typography;

const REASON_OPTIONS = [
    { value: 'expired', label: '🕐 Hết hạn sử dụng', color: 'red' },
    { value: 'damaged', label: '💥 Hư hỏng / Dập nát', color: 'orange' },
    { value: 'lost', label: '🔍 Thất thoát / Mất hàng', color: 'purple' },
    { value: 'other', label: '📝 Lý do khác', color: 'default' },
];

const reasonTag = (r) => {
    const opt = REASON_OPTIONS.find(o => o.value === r);
    return opt ? <Tag color={opt.color} style={{ fontSize: 13, padding: '4px 10px', borderRadius: 4 }}>{opt.label}</Tag> : <Tag>{r}</Tag>;
};

export function DetailAdjustment() {
    const navigate = useNavigate();
    const { adjustment_id } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['stock_adjustment_detail', adjustment_id],
        queryFn: () => detailAdjustment(adjustment_id),
        enabled: !!adjustment_id
    });

    const rawData = data?.data || {};

    return (
        <Flex className="crud_user container" vertical>
            <AdminHeader 
                title="Chi tiết phiếu kiểm kê / Hủy hàng" 
                icon={<ToolOutlined />} 
            />
            
            {isLoading ? (
                <AdjustmentFormSkeleton />
            ) : (
                <Flex vertical gap={24} style={{ width: '100%' }}>
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Sheet Information & Total Loss */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm schedule-card">
                                    <Title level={5} className="section-title">
                                        <CalendarOutlined /> Thông tin phiếu kiểm
                                    </Title>
                                    
                                    <Flex vertical gap={12}>
                                        <div>
                                            <div className="info-label">Ngày kiểm kê</div>
                                            <div className="info-value">
                                                {rawData?.adjustmentDate ? dayjs(rawData.adjustmentDate).format('DD/MM/YYYY HH:mm') : '—'}
                                            </div>
                                        </div>
                                        
                                        <Divider style={{ margin: '12px 0' }} />
                                        
                                        <div>
                                            <div className="info-label"><UserOutlined /> Người thực hiện</div>
                                            <div className="info-value">
                                                {rawData?.userId ? `${rawData.userId.firstName} ${rawData.userId.lastName}` : 'Hệ thống'}
                                            </div>
                                        </div>
                                    </Flex>
                                </Card>

                                <Card bordered={false} className="glass-card shadow-sm status-card">
                                    <Title level={5} className="section-title">
                                         thiệt hại ghi nhận
                                    </Title>
                                    
                                    <div className="computed-total-widget danger-theme">
                                        <div className="total-title">Tổng giá trị thiệt hại</div>
                                        <div className="total-val">
                                            {rawData?.totalLoss ? rawData.totalLoss.toLocaleString('vi-VN') : '0'} ₫
                                        </div>
                                    </div>
                                    
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', textAlign: 'justify' }}>
                                        Giá trị thiệt hại được tính tự động dựa trên đơn giá nhập của sản phẩm tại thời điểm hủy kho.
                                    </Text>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: List of items destroyed */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Title level={5} className="section-title">
                                    <ShoppingOutlined /> Danh sách sản phẩm hủy kho
                                </Title>
                                
                                <Flex vertical style={{ width: "100%" }}>
                                    {rawData?.products?.map((p, index) => (
                                        <div key={p._id || index} className="read-only-item">
                                            <Typography.Text strong style={{ fontSize: 14, color: '#722ed1', display: 'block', marginBottom: 16 }}>
                                                Sản phẩm #{index + 1}
                                            </Typography.Text>

                                            <Row gutter={[16, 16]}>
                                                <Col span={24}>
                                                    <div className="info-label">Tên sản phẩm</div>
                                                    <div className="info-value" style={{ fontSize: 16 }}>
                                                        {p.productId?.name || 'Sản phẩm đã bị xóa'}
                                                    </div>
                                                </Col>

                                                <Col xs={24} sm={12}>
                                                    <div className="info-label"><FieldNumberOutlined /> Số lượng hủy</div>
                                                    <div className="info-value">
                                                        <Tag color="volcano" style={{ fontSize: 14, padding: '2px 8px', fontWeight: 600 }}>
                                                            -{p.quantity} {p.productId?.unit || 'sản phẩm'}
                                                        </Tag>
                                                    </div>
                                                </Col>

                                                <Col xs={24} sm={12}>
                                                    <div className="info-label"><ExceptionOutlined /> Lý do hủy</div>
                                                    <div style={{ marginTop: 2 }}>
                                                        {reasonTag(p.reason)}
                                                    </div>
                                                </Col>

                                                {p.note && p.note.length > 0 && (
                                                    <Col span={24}>
                                                        <div className="info-label"><FileTextOutlined /> Ghi chú chi tiết</div>
                                                        <Flex gap={8} wrap="wrap" style={{ marginTop: 4 }}>
                                                            {Array.isArray(p.note) ? (
                                                                p.note.map((tag, idx) => (
                                                                    <Tag color="blue" key={idx} style={{ padding: '2px 6px' }}>
                                                                        {tag}
                                                                    </Tag>
                                                                ))
                                                            ) : (
                                                                <Tag color="blue" style={{ padding: '2px 6px' }}>
                                                                    {p.note}
                                                                </Tag>
                                                            )}
                                                        </Flex>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                    ))}
                                </Flex>

                                <Flex justify="flex-end" style={{ marginTop: 32 }}>
                                    <Button 
                                        size="large" 
                                        icon={<ArrowLeftOutlined />} 
                                        onClick={() => navigate('/admin/inventory/adjustment')}
                                        style={{ borderRadius: 8, paddingLeft: 24, paddingRight: 24 }}
                                    >
                                        Quay lại danh sách
                                    </Button>
                                </Flex>
                            </Card>
                        </Col>
                    </Row>
                </Flex>
            )}
        </Flex >
    );
}

export default DetailAdjustment;
