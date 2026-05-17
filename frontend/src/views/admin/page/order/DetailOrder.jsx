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
    const subTotalValue = Form.useWatch('subTotal', form);
    const taxValue = Form.useWatch('tax', form);
    const shippingCostValue = Form.useWatch('shippingCost', form);

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

    useEffect(() => {
        const sub = form.getFieldValue('subTotal') || 0;
        const ship = form.getFieldValue('shippingCost') || 0;
        const tx = form.getFieldValue('tax') || 0;
        form.setFieldValue('total', sub + ship + tx);
    }, [subTotalValue, taxValue, shippingCostValue, form]);

    const isOrderDisabled = data?.data?.orderStatus === 'canceled' || data?.data?.orderStatus === 'done';

    return (
        <Flex className="crud_user order_detail_panel container" vertical gap={24}>
            <AdminHeader title="Chi tiết đơn hàng" icon={<PlusOutlined />} />

            <Form 
                form={form}
                onFinish={handleSubmit}
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
                                
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="firstNameReceiver" label="Họ khách hàng" required>
                                            <Input size="large" disabled prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="lastNameReceiver" label="Tên khách hàng" required>
                                            <Input size="large" disabled prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="phoneReceiver" label="Số điện thoại" required>
                                            <Input size="large" disabled prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="emailReceiver" label="Địa chỉ Email" required>
                                            <Input size="large" disabled prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="countryReceiver" label="Quốc gia" required>
                                            <Select 
                                                placeholder="Quốc gia" 
                                                size="large" 
                                                options={options}
                                                showSearch
                                                virtual={false}
                                                optionFilterProp="children"
                                                filterOption={(input, option) => (option?.text ?? '').includes(input)}
                                                disabled
                                                suffixIcon={<GlobalOutlined />}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="addressReceiver" label="Địa chỉ cụ thể" required>
                                            <Input size="large" disabled prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
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
                                        options={orderStatusOptions} 
                                        disabled={isOrderDisabled}
                                    />
                                </Form.Item>

                                <Form.Item name="shippingStatus" label="Trạng thái giao hàng" required>
                                    <Select 
                                        placeholder="Chọn trạng thái giao" 
                                        size="large" 
                                        options={shippingStatusOptions} 
                                        disabled={isOrderDisabled}
                                    />
                                </Form.Item>

                                <Form.Item name="paymentStatus" label="Trạng thái thanh toán" required>
                                    <Select 
                                        placeholder="Chọn trạng thái thanh toán" 
                                        size="large" 
                                        options={paymentStatusOptions} 
                                        disabled={isOrderDisabled}
                                    />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="shippingMethod" label="P.Thức vận chuyển" required>
                                            <Select placeholder="Chọn p.thức" options={shippingMethodOptions} size="large" disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="paymentMethod" label="P.Thức thanh toán" required>
                                            <Select placeholder="Chọn p.thức" options={paymentMethodOptions} size="large" disabled />
                                        </Form.Item>
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
                                        <Form.Item name="tax" label="Thuế giá trị" required>
                                            <InputNumber 
                                                size="large"
                                                min={0} 
                                                style={{ width: "100%" }}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                disabled={isOrderDisabled}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="shippingCost" label="Phí giao hàng" required>
                                            <InputNumber 
                                                size="large"
                                                min={0} 
                                                style={{ width: "100%" }}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                disabled={isOrderDisabled}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <div className="order-totals-card" style={{ marginTop: 12 }}>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label">Tạm tính:</div>
                                        <div className="total-summary-value">{(subTotalValue || 0).toLocaleString('vi-VN')} ₫</div>
                                    </div>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label">Thuế suất:</div>
                                        <div className="total-summary-value">{(taxValue || 0).toLocaleString('vi-VN')} ₫</div>
                                    </div>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label">Vận chuyển:</div>
                                        <div className="total-summary-value">{(shippingCostValue || 0).toLocaleString('vi-VN')} ₫</div>
                                    </div>
                                    <div className="total-summary-row">
                                        <div className="total-summary-label" style={{ fontSize: 15, color: '#1a3353' }}>TỔNG CỘNG:</div>
                                        <div className="total-summary-value grand-total">
                                            {((subTotalValue || 0) + (taxValue || 0) + (shippingCostValue || 0)).toLocaleString('vi-VN')} ₫
                                        </div>
                                    </div>
                                </div>

                                <Form.Item name="note" label={<span style={{ fontSize: 13, fontWeight: 600, color: '#8c8c8c' }}><FileTextOutlined /> Ghi chú đơn hàng</span>} style={{ marginTop: 16 }}>
                                    <TextArea rows={4} disabled placeholder="Không có ghi chú nào của khách hàng." />
                                </Form.Item>
                            </Card>
                        </Flex>
                    </Col>
                </Row>

                <Flex justify="center" vertical align="center" gap={16} style={{ marginTop: 32 }}>
                    {isOrderDisabled && (
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
                            disabled={isOrderDisabled}
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