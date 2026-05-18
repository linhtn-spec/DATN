import {
    PlusOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    SettingOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    CreditCardOutlined,
    ArrowLeftOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Divider,
    Flex,
    Form,
    Image,
    Input,
    InputNumber,
    Select,
    Table,
    Typography,
    Card,
    Row,
    Col,
    Tag
} from 'antd';
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { orderStatusOptions, paymentMethodOptions, paymentStatusOptions, shippingMethodOptions, shippingStatusOptions } from "../../../../constants/orderOptions";
import convertToDate from "../../../../functions/convertDate";
import { queryClient } from '../../../../main';
import { detailOrder, editOrder } from "../../../../services/order_service";
import Notification from '../../../../utils/configToastify';
import { getLabelByValue } from "../../../../utils/getLabelByValue";
import AdminHeader from "../../components/AdminHeader";
import './DetailOrder.css';

const { Text, Title } = Typography;

export function DetailOrder() {
    const navigate = useNavigate();
    const [form] = Form.useForm();



    const [options, setOptions] = useState([]);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(1);
    const [page, setPage] = useState(1);

    const { order_id } = useParams();

    const queryCountry = useQuery({
        queryKey: ['countries_product_create'],
        queryFn: () => axios.get('https://countriesnow.space/api/v0.1/countries/capital'),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false
    });

    const { data, isSuccess, isLoading } = useQuery({
        queryKey: ['detail_order_admin', order_id],
        queryFn: () => detailOrder(order_id),
        enabled: !!order_id
    });

    const tax = data?.data?.tax || 0;
    const shippingCost = data?.data?.shippingCost || 0;
    const subTotal = data?.data?.products?.reduce((prev, curr) => prev + curr.subPrice, 0) || 0;

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật đơn hàng thành công!", type: "success" });
            queryClient.invalidateQueries({ queryKey: ['orders_admin_list'] });
            navigate('/admin/orders', { replace: true });
        },
        onError: () => {
            Notification({ message: "Cập nhật đơn hàng thất bại!", type: "error" });
        }
    });

    const handleValuesChange = (changedValues, allValues) => {
        let updates = {};

        // 1. Order Status changed
        if (changedValues.orderStatus) {
            if (changedValues.orderStatus === 'done') {
                updates.shippingStatus = 'sent';
                updates.paymentStatus = 'paid';
                Notification({ message: 'Tự động cập nhật Đã vận chuyển & Đã thanh toán để khớp trạng thái Hoàn thành', type: 'info' });
            } else if (changedValues.orderStatus === 'canceled') {
                if (allValues.shippingStatus !== 'sent') {
                    updates.shippingStatus = 'not_sent';
                }
            } else if (changedValues.orderStatus === 'processing') {
                if (allValues.shippingStatus === 'not_sent') {
                    updates.shippingStatus = 'sending';
                }
            }
        }

        // 2. Shipping Status changed
        if (changedValues.shippingStatus) {
            if (changedValues.shippingStatus === 'sent') {
                if (data?.data?.paymentMethod === 'cod' && allValues.paymentStatus !== 'paid') {
                    updates.paymentStatus = 'paid';
                    Notification({ message: 'Đơn hàng COD giao thành công, tự động ghi nhận Đã thanh toán', type: 'info' });
                }
                const isPaid = updates.paymentStatus === 'paid' || allValues.paymentStatus === 'paid';
                if (isPaid && allValues.orderStatus !== 'done') {
                    updates.orderStatus = 'done';
                    Notification({ message: 'Đã nhận hàng thành công, tự động đổi trạng thái đơn thành Hoàn Thành!', type: 'success' });
                }
            } else if (changedValues.shippingStatus === 'sending' && allValues.orderStatus === 'new') {
                updates.orderStatus = 'processing';
            }
        }

        // Apply updates if there are any
        if (Object.keys(updates).length > 0) {
            form.setFieldsValue(updates);
        }
    };

    const handleSubmit = (value) => {
        mutate({
            ...value, id: order_id
        });
    };

    const cartColumns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
            width: "60px",
            align: 'center'
        },
        {
            title: 'Sản phẩm đặt mua',
            dataIndex: 'name',
            key: 'name',
            render: (text, row) => (
                <Flex align='center' gap={16}>
                    <Image 
                        src={row.image} 
                        width={60} 
                        height={60} 
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        fallback="https://via.placeholder.com/60"
                    />
                    <Text strong style={{ color: '#1a3353' }}>{text}</Text>
                </Flex>
            )
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            width: 120,
            render: (text) => <Text>{text?.toLocaleString('vi-VN')} ₫</Text>
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 60,
            render: (v) => <Text strong>{v}</Text>
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            align: 'right',
            width: 140,
            render: (text) => <Text strong type="danger">{text?.toLocaleString('vi-VN')} ₫</Text>
        },
    ];

    useEffect(() => {
        if (!isSuccess) return;
        const rawData = data?.data;

        form.setFieldValue('firstNameReceiver', rawData?.firstNameReceiver);
        form.setFieldValue('lastNameReceiver', rawData?.lastNameReceiver);
        form.setFieldValue('emailReceiver', rawData?.emailReceiver);
        form.setFieldValue('phoneReceiver', rawData?.phoneReceiver);
        form.setFieldValue('paymentMethod', rawData?.paymentMethod);
        form.setFieldValue('countryReceiver', rawData?.countryReceiver);
        form.setFieldValue('paymentStatus', rawData?.paymentStatus);
        form.setFieldValue('shippingMethod', rawData?.shippingMethod);
        form.setFieldValue('addressReceiver', rawData?.addressReceiver);
        form.setFieldValue('orderStatus', rawData?.orderStatus);
        form.setFieldValue('note', rawData?.note);
        form.setFieldValue('shippingCost', rawData?.shippingCost);
        form.setFieldValue('total', rawData?.total);
        form.setFieldValue('createdAt', rawData?.createdAt);
        form.setFieldValue('tax', rawData?.tax);
        form.setFieldValue('subTotal', rawData?.products.reduce((prev, curr) => prev + curr.subPrice, 0));
        form.setFieldValue('shippingStatus', rawData?.shippingStatus);

        setProducts(rawData?.products?.map((item, index) => ({
            no: index + 1,
            image: item?.productId?.images,
            name: item?.productId?.name,
            quantity: item?.quantity,
            price: item?.productId?.price,
            subtotal: item?.subPrice
        })));

        setTotal(rawData?.products?.length);

        return () => {
            setProducts([]);
            setTotal(1);
        };
    }, [isSuccess, data, form]);

    useEffect(() => {
        if (!queryCountry?.isSuccess) return;
        const rawData = queryCountry?.data?.data?.data;
        setOptions(rawData?.map(item => ({ value: item?.name, text: item?.name })));
    }, [queryCountry?.isSuccess, queryCountry?.data]);

    const orderStatusValue = Form.useWatch('orderStatus', form);
    const shippingStatusValue = Form.useWatch('shippingStatus', form);
    const paymentStatusValue = Form.useWatch('paymentStatus', form);

    // Is disabled because it was already saved as terminal in database
    const isOrderSavedAsTerminal = data?.data?.orderStatus === 'canceled' || data?.data?.orderStatus === 'done';
    
    // Is disabled because user currently selected a terminal state in the UI (but hasn't saved yet)
    const isFormVisuallyTerminal = orderStatusValue === 'canceled' || orderStatusValue === 'done';

    // The order status dropdown itself only locks if it's ALREADY saved as terminal. 
    // This allows undoing a misclick before saving.
    const isOrderStatusDisabled = isOrderSavedAsTerminal;

    // The other fields lock instantly if the form says done/canceled, so users don't manually edit them against logic
    const areOtherFieldsDisabled = isOrderSavedAsTerminal || isFormVisuallyTerminal;

    return (
        <Flex className="crud_user order_detail_panel container" vertical gap={24}>
            <AdminHeader title="Chi tiết đơn hàng" icon={<PlusOutlined />} />

            <Form 
                form={form}
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                layout="vertical"
                className="premium-form"
                style={{ width: "100%" }}
            >
                <Row gutter={[24, 24]}>
                    {/* Left Column: Customer and Cargo Products List */}
                    <Col xs={24} lg={14}>
                        <Flex vertical gap={24}>
                            {/* Card 1: Customer info */}
                            <Card bordered={false} className="glass-card shadow-sm info-card">
                                <Title level={5} className="section-title">
                                    <UserOutlined /> Thông tin khách hàng & Giao nhận
                                </Title>
                                
                                <Row gutter={[16, 24]}>
                                    <Col xs={24} sm={12}>
                                        <Flex vertical gap={4}>
                                            <Text type="secondary">Họ khách hàng</Text>
                                            <Text strong style={{ fontSize: 16 }}><UserOutlined style={{ marginRight: 8, color: '#bfbfbf' }} /> {data?.data?.firstNameReceiver || '---'}</Text>
                                        </Flex>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Flex vertical gap={4}>
                                            <Text type="secondary">Tên khách hàng</Text>
                                            <Text strong style={{ fontSize: 16 }}><UserOutlined style={{ marginRight: 8, color: '#bfbfbf' }} /> {data?.data?.lastNameReceiver || '---'}</Text>
                                        </Flex>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Flex vertical gap={4}>
                                            <Text type="secondary">Số điện thoại</Text>
                                            <Text strong style={{ fontSize: 16 }}><PhoneOutlined style={{ marginRight: 8, color: '#bfbfbf' }} /> {data?.data?.phoneReceiver || '---'}</Text>
                                        </Flex>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Flex vertical gap={4}>
                                            <Text type="secondary">Địa chỉ Email</Text>
                                            <Text strong style={{ fontSize: 16 }}><MailOutlined style={{ marginRight: 8, color: '#bfbfbf' }} /> {data?.data?.emailReceiver || '---'}</Text>
                                        </Flex>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Flex vertical gap={4}>
                                            <Text type="secondary">Quốc gia</Text>
                                            <Text strong style={{ fontSize: 16 }}><GlobalOutlined style={{ marginRight: 8, color: '#bfbfbf' }} /> {data?.data?.countryReceiver || '---'}</Text>
                                        </Flex>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Flex vertical gap={4}>
                                            <Text type="secondary">Địa chỉ cụ thể</Text>
                                            <Text strong style={{ fontSize: 16 }}><EnvironmentOutlined style={{ marginRight: 8, color: '#bfbfbf' }} /> {data?.data?.addressReceiver || '---'}</Text>
                                        </Flex>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Card 2: Cart Products List */}
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Title level={5} className="section-title">
                                    <ShoppingOutlined /> Danh sách sản phẩm mua
                                </Title>
                                
                                <Table
                                    bordered
                                    columns={cartColumns}
                                    dataSource={products}
                                    rowKey="no"
                                    pagination={{ 
                                        hideOnSinglePage: true, 
                                        pageSize: 3, 
                                        total: total, 
                                        current: page, 
                                        onChange: setPage, 
                                        showSizeChanger: false 
                                    }}
                                />
                            </Card>
                        </Flex>
                    </Col>

                    {/* Right Column: Status controllers and Receipt summary */}
                    <Col xs={24} lg={10}>
                        <Flex vertical gap={24}>
                            {/* Card 3: Logistics and Payment statuses */}
                            <Card bordered={false} className="glass-card shadow-sm status-card">
                                <Title level={5} className="section-title">
                                    <SettingOutlined /> Cài đặt & Vận hành
                                </Title>
                                
                                <Form.Item name="orderStatus" label="Trạng thái đơn hàng" required>
                                    <Select 
                                        placeholder="Chọn trạng thái đơn" 
                                        size="large" 
                                        options={orderStatusOptions.map(opt => ({
                                            ...opt,
                                            // Optional: Disable going backward from 'processing' to 'new'
                                            disabled: (data?.data?.orderStatus === 'processing' && opt.value === 'new')
                                        }))} 
                                        disabled={isOrderStatusDisabled}
                                    />
                                </Form.Item>

                                <Form.Item name="shippingStatus" label="Trạng thái giao hàng" required>
                                    <Select 
                                        placeholder="Chọn trạng thái giao" 
                                        size="large" 
                                        options={shippingStatusOptions.map(opt => ({
                                            ...opt,
                                            // Can't revert sent to not_sent/sending
                                            disabled: (data?.data?.shippingStatus === 'sent' && opt.value !== 'sent')
                                        }))} 
                                        disabled={areOtherFieldsDisabled}
                                    />
                                </Form.Item>

                                <Form.Item name="paymentStatus" label="Trạng thái thanh toán" required>
                                    <Select 
                                        placeholder="Chọn trạng thái thanh toán" 
                                        size="large" 
                                        options={paymentStatusOptions.map(opt => ({
                                            ...opt,
                                            // Can't revert paid to unpaid
                                            disabled: (data?.data?.paymentStatus === 'paid' && opt.value !== 'paid')
                                        }))} 
                                        disabled={areOtherFieldsDisabled}
                                    />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Flex vertical gap={4} style={{ marginBottom: 16 }}>
                                            <Text type="secondary">P.Thức vận chuyển</Text>
                                            <Text strong style={{ fontSize: 15, padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, border: '1px solid #d9d9d9', color: '#1a3353' }}>
                                                {getLabelByValue(data?.data?.shippingMethod, shippingMethodOptions) || '---'}
                                            </Text>
                                        </Flex>
                                    </Col>
                                    <Col span={12}>
                                        <Flex vertical gap={4} style={{ marginBottom: 16 }}>
                                            <Text type="secondary">P.Thức thanh toán</Text>
                                            <Text strong style={{ fontSize: 15, padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, border: '1px solid #d9d9d9', color: '#1a3353' }}>
                                                {getLabelByValue(data?.data?.paymentMethod, paymentMethodOptions) || '---'}
                                            </Text>
                                        </Flex>
                                    </Col>
                                </Row>

                                <Divider style={{ margin: '12px 0' }} />
                                
                                <Flex justify="space-between" align="center">
                                    <Text type="secondary">Ngày tạo hóa đơn</Text>
                                    <Text strong>{convertToDate(form.getFieldValue('createdAt'))}</Text>
                                </Flex>
                            </Card>

                            {/* Card 4: Invoice Calculations and notes */}
                            <Card bordered={false} className="glass-card shadow-sm invoice-calc-card">
                                <Title level={5} className="section-title">
                                    <CreditCardOutlined /> Thanh toán hóa đơn
                                </Title>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Flex vertical gap={4} style={{ marginBottom: 16 }}>
                                            <Text type="secondary">Thuế giá trị</Text>
                                            <Text strong style={{ fontSize: 16, color: '#1a3353' }}>{data?.data?.tax?.toLocaleString('vi-VN')} ₫</Text>
                                        </Flex>
                                    </Col>
                                    <Col span={12}>
                                        <Flex vertical gap={4} style={{ marginBottom: 16 }}>
                                            <Text type="secondary">Phí giao hàng</Text>
                                            <Text strong style={{ fontSize: 16, color: '#1a3353' }}>{data?.data?.shippingCost?.toLocaleString('vi-VN')} ₫</Text>
                                        </Flex>
                                    </Col>
                                </Row>

                                <div className="order-totals-card" style={{ marginTop: 12 }}>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label">Tạm tính:</div>
                                        <div className="total-summary-value">{subTotal.toLocaleString('vi-VN')} ₫</div>
                                    </div>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label">Thuế suất:</div>
                                        <div className="total-summary-value">{tax.toLocaleString('vi-VN')} ₫</div>
                                    </div>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label">Vận chuyển:</div>
                                        <div className="total-summary-value">{shippingCost.toLocaleString('vi-VN')} ₫</div>
                                    </div>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label" style={{ fontSize: 15, color: '#1a3353' }}>TỔNG CỘNG:</div>
                                        <div className="total-summary-value grand-total">
                                            {(subTotal + tax + shippingCost).toLocaleString('vi-VN')} ₫
                                        </div>
                                    </div>
                                </div>

                                <Flex vertical gap={8} style={{ marginTop: 24, marginBottom: 8 }}>
                                    <Text type="secondary" strong><FileTextOutlined /> Ghi chú đơn hàng</Text>
                                    <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, border: '1px solid #e8e8e8', minHeight: 80 }}>
                                        <Text style={{ color: data?.data?.note ? '#1a3353' : '#bfbfbf', fontStyle: data?.data?.note ? 'normal' : 'italic' }}>
                                            {data?.data?.note || "Không có ghi chú nào của khách hàng."}
                                        </Text>
                                    </div>
                                </Flex>
                            </Card>
                        </Flex>
                    </Col>
                </Row>

                <Flex justify="center" vertical align="center" gap={16} style={{ marginTop: 32 }}>
                    {isOrderSavedAsTerminal && (
                        <Typography.Text type="danger" strong style={{ fontSize: 14 }}>
                            ⚠️ Đơn hàng này đang ở trạng thái {getLabelByValue(data?.data?.orderStatus, orderStatusOptions)} và không được sửa đổi thêm.
                        </Typography.Text>
                    )}
                    
                    <Flex gap={16}>
                        <Button 
                            size="large" 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/admin/orders')}
                            style={{ borderRadius: 8, paddingLeft: 24, paddingRight: 24 }}
                        >
                            Quay lại danh sách
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            size="large" 
                            icon={<SaveOutlined />}
                            loading={isPending}
                            disabled={isOrderSavedAsTerminal}
                            style={{ borderRadius: 8, paddingLeft: 32, paddingRight: 32 }}
                        >
                            Lưu thay đổi đơn hàng
                        </Button>
                    </Flex>
                </Flex>
            </Form>
        </Flex >
    );
}

export default DetailOrder;