import { 
    MinusCircleOutlined, 
    PlusOutlined, 
    ToolOutlined,
    CalendarOutlined,
    ShoppingOutlined,
    FieldNumberOutlined,
    ExceptionOutlined,
    FileTextOutlined,
    WarningOutlined
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button, Col, DatePicker, Flex, Form, InputNumber,
    Row, Select, Space, Typography, Card, Divider, ConfigProvider
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { useNavigate } from 'react-router';
import { queryClient } from '../../../../main';
import { productAll } from '../../../../services/product_service';
import { createAdjustment } from '../../../../services/stock_adjustment_service';
import Notification from '../../../../utils/configToastify';
import AdminHeader from "../../components/AdminHeader";
import AdjustmentFormSkeleton from './AdjustmentFormSkeleton';
import './CreateAdjustment.css';

dayjs.locale('vi');

const REASON_OPTIONS = [
    { value: 'expired', label: '🕐 Hết hạn sử dụng' },
    { value: 'damaged', label: '💥 Hư hỏng / Dập nát' },
    { value: 'lost', label: '🔍 Thất thoát / Mất hàng' },
    { value: 'other', label: '📝 Lý do khác' },
];

export function CreateAdjustment() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { data: productData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products_option_adj'],
        queryFn: () => productAll(),
    });

    const productList = productData?.data?.data || [];
    const productOptions = productList.map(p => ({
        value: p._id,
        label: `${p.name} (${p.unit || 'sản phẩm'}) — Tồn: ${p.quantity?.inTrade ?? 0}`,
    }));

    const { mutate, isPending } = useMutation({
        mutationFn: createAdjustment,
        onSuccess: () => {
            Notification({ message: 'Tạo phiếu kiểm kê thành công!', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
            queryClient.invalidateQueries({ queryKey: ['products_admin'] });
            navigate('/admin/inventory/adjustment');
        },
        onError: (err) => {
            Notification({ message: err?.response?.data?.message || 'Tạo phiếu thất bại!', type: 'error' });
        }
    });

    const onFinish = (values) => {
        const formattedProducts = values.products?.map(p => ({
            ...p,
            note: Array.isArray(p.note) ? p.note.join(', ') : p.note
        }));
        mutate({
            products: formattedProducts,
            adjustmentDate: values.adjustmentDate ? values.adjustmentDate.toISOString() : new Date().toISOString()
        });
    };

    const showSkeleton = isLoadingProducts || isPending;

    return (
        <Flex className="crud_user container" vertical>
            <AdminHeader 
                title="Tạo phiếu kiểm kê / Hủy hàng" 
                icon={<PlusOutlined />} 
            />
            
            {showSkeleton ? (
                <AdjustmentFormSkeleton />
            ) : (
                <Form 
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    className="premium-form"
                    initialValues={{ adjustmentDate: dayjs() }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Info & Action summary */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm schedule-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CalendarOutlined /> Thời gian kiểm kê
                                    </Typography.Title>
                                    
                                    <ConfigProvider locale={locale}>
                                        <Form.Item
                                            label="Ngày thực hiện kiểm kho"
                                            name="adjustmentDate"
                                            rules={[{ required: true, message: "Vui lòng chọn ngày kiểm kho" }]}
                                        >
                                            <DatePicker 
                                                placeholder="Chọn ngày kiểm"
                                                size="large"
                                                style={{ width: "100%" }}
                                            />
                                        </Form.Item>
                                    </ConfigProvider>
                                </Card>

                                <Card bordered={false} className="glass-card shadow-sm status-card">
                                    <Typography.Title level={5} className="section-title" style={{ color: '#fa8c16' }}>
                                        <WarningOutlined /> Lưu ý khi hủy hàng
                                    </Typography.Title>
                                    
                                    <div className="computed-total-widget">
                                        <div className="total-title">Ước tính thiệt hại</div>
                                        <div className="total-val" style={{ fontSize: 16, marginTop: 8 }}>
                                            Hệ thống tự động tính toán
                                        </div>
                                    </div>
                                    
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
                                        Số lượng sản phẩm hủy sẽ bị trừ trực tiếp vào lượng tồn kho thực tế trong hệ thống bán hàng sau khi xác nhận.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Detailed Product Items to Adjust */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <ShoppingOutlined /> Danh sách sản phẩm kiểm kê / hủy
                                </Typography.Title>
                                
                                <Form.List name="products" initialValue={[{}]} rules={[
                                    {
                                        validator: async (_, value) => {
                                            if (!value || value.length < 1) {
                                                return Promise.reject(new Error("Vui lòng thêm ít nhất một sản phẩm cần hủy"));
                                            }
                                        }
                                    }
                                ]}>
                                    {(fields, { add, remove }) => (
                                        <Flex vertical style={{ width: "100%" }}>
                                            {fields.map((field, index) => (
                                                <div key={field.key} className="adjustment-item">
                                                    <div className="delete-btn-container">
                                                        <Button 
                                                            type="text" 
                                                            danger 
                                                            icon={<MinusCircleOutlined />} 
                                                            onClick={() => remove(field.name)}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </div>

                                                    <Typography.Text strong style={{ fontSize: 14, color: '#722ed1', display: 'block', marginBottom: 16 }}>
                                                        Sản phẩm #{index + 1}
                                                    </Typography.Text>

                                                    <Row gutter={[16, 16]}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                name={[field.name, "productId"]}
                                                                fieldId={[field.key, "productId"]}
                                                                label="Tên sản phẩm"
                                                                rules={[{ required: true, message: "Chọn sản phẩm" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Select
                                                                    showSearch
                                                                    optionFilterProp="label"
                                                                    virtual={false}
                                                                    options={productOptions}
                                                                    placeholder="Tìm kiếm và chọn sản phẩm..."
                                                                    size="large"
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={12}>
                                                            <Form.Item
                                                                name={[field.name, "quantity"]}
                                                                fieldId={[field.key, "quantity"]}
                                                                label="Số lượng hủy"
                                                                rules={[{ required: true, message: "Nhập số lượng hủy" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <InputNumber 
                                                                    min={1} 
                                                                    placeholder="VD: 5" 
                                                                    size="large" 
                                                                    style={{ width: "100%" }}
                                                                    prefix={<FieldNumberOutlined style={{color: '#bfbfbf'}} />}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={12}>
                                                            <Form.Item
                                                                name={[field.name, "reason"]}
                                                                fieldId={[field.key, "reason"]}
                                                                label="Lý do hủy"
                                                                rules={[{ required: true, message: "Chọn lý do" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Select
                                                                    placeholder="Chọn lý do hủy..."
                                                                    size="large"
                                                                    options={REASON_OPTIONS}
                                                                    suffixIcon={<ExceptionOutlined />}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col span={24}>
                                                            <Form.Item 
                                                                name={[field.name, 'note']} 
                                                                label={<span style={{ fontSize: 12, color: '#8c8c8c' }}><FileTextOutlined /> Ghi chú cụ thể (Gõ Enter sau mỗi cụm từ)</span>}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Select
                                                                    mode="tags"
                                                                    placeholder="VD: Hộp móp méo, Bao bì rách..."
                                                                    style={{ width: '100%' }}
                                                                    open={false}
                                                                    tokenSeparators={[',']}
                                                                    size="large"
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                            
                                            <Form.Item style={{ marginTop: 8 }}>
                                                <Button 
                                                    type="dashed" 
                                                    onClick={() => add()} 
                                                    block 
                                                    size="large"
                                                    icon={<PlusOutlined />}
                                                    className="btn-add-adjustment"
                                                >
                                                    Thêm sản phẩm cần hủy
                                                </Button>
                                            </Form.Item>
                                        </Flex>
                                    )}
                                </Form.List>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" onClick={() => navigate('/admin/inventory/adjustment')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large" 
                                        loading={isPending}
                                        danger
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        Xác nhận hủy hàng
                                    </Button>
                                </Flex>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            )}
        </Flex >
    );
}

export default CreateAdjustment;
