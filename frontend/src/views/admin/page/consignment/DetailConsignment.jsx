import {
    MinusCircleOutlined,
    PlusOutlined,
    CalendarOutlined,
    DollarOutlined,
    ShoppingOutlined,
    DashboardOutlined,
    FieldNumberOutlined,
    InteractionOutlined
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    ConfigProvider,
    DatePicker,
    Flex,
    Form,
    InputNumber,
    Select,
    Typography,
    Col,
    Row,
    Divider
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import './DetailConsignment.css';
import AdminHeader from "../../components/AdminHeader";

import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { queryClient } from "../../../../main";
import { addConsignment, detailConsignment, updateConsignment } from "../../../../services/cosignment_service";
import { productAll } from "../../../../services/product_service";
import Notification from "../../../../utils/configToastify";
import ConsignmentFormSkeleton from "./ConsignmentFormSkeleton";
dayjs.locale('vi')

export function DetailConsignment() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [products, setProducts] = useState([])
    const [condition, setCondition] = useState(false)

    const { consignment_id } = useParams()

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => condition ? updateConsignment(data) : addConsignment(data),
        onSuccess: () => {
            Notification({ message: condition ? `Cập nhật phiếu nhập kho thành công!` : "Tạo phiếu nhập kho thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['consignment_admin_list'] })
            navigate(`/admin/consignment`, { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Đã xảy ra lỗi!", type: "error" })
        }
    })

    const queryAllProduct = useQuery({
        queryKey: ['product_all'],
        queryFn: () => productAll(),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false
    })

    const queryConsignmentDetail = useQuery({
        queryKey: ['consignment_detail_admin', consignment_id],
        queryFn: () => detailConsignment(consignment_id),
        enabled: !!consignment_id
    })

    useEffect(() => {
        if (!queryConsignmentDetail.isSuccess) return
        const rawData = queryConsignmentDetail.data?.data
        form.setFieldValue('importDate', dayjs(rawData?.importDate))
        form.setFieldValue('money', rawData?.money)
        form.setFieldValue('products', rawData?.products.map(item => ({
            productId: item?.productId?._id,
            expireDate: dayjs(item?.expireDate),
            importMoney: item?.importMoney,
            quantity: item?.quantity
        })))

    }, [queryConsignmentDetail.isSuccess, queryConsignmentDetail.data, form])

    const watchedProducts = Form.useWatch('products', form);
    const [calculatedMoney, setCalculatedMoney] = useState(0);

    useEffect(() => {
        if (watchedProducts && Array.isArray(watchedProducts)) {
            const sum = watchedProducts.reduce((acc, curr) => {
                const qty = curr?.quantity || 0;
                const price = curr?.importMoney || 0;
                return acc + (qty * price);
            }, 0);
            setCalculatedMoney(sum);
            form.setFieldValue('money', sum);
        }
    }, [watchedProducts, form]);

    const onFinish = (value) => {
        mutate({
            ...value, ...(condition ? { id: consignment_id } : {})
        })
    }

    useEffect(() => {
        if (!queryAllProduct.isSuccess) return
        const rawData = queryAllProduct?.data?.data?.data
        setProducts(rawData?.map(item => ({
            value: item?._id,
            label: `${item?.name} (${item?.unit || 'Sản phẩm'})`
        })))
        return () => {
            setProducts([])
        }
    }, [queryAllProduct.data, queryAllProduct.isSuccess])

    useEffect(() => {
        if (consignment_id) setCondition(true)
        return () => {
            setCondition(false)
        }
    }, [consignment_id])

    const showSkeleton = queryConsignmentDetail.isFetching || queryAllProduct.isLoading || isPending;

    return (
        <Flex className="crud_user container" vertical>
            <AdminHeader 
                title={condition ? "Cập nhật phiếu nhập kho" : "Tạo phiếu nhập kho"} 
                icon={<PlusOutlined />} 
            />
            
            {showSkeleton ? (
                <ConsignmentFormSkeleton />
            ) : (
                <Form 
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    className="premium-form"
                    initialValues={{ money: 0 }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Consignment Info & Valuation */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm schedule-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CalendarOutlined /> Thông tin phiếu nhập
                                    </Typography.Title>
                                    
                                    <ConfigProvider locale={locale}>
                                        <Form.Item
                                            label="Ngày nhập kho"
                                            name="importDate"
                                            rules={[{ required: true, message: "Vui lòng chọn ngày nhập kho" }]}
                                        >
                                            <DatePicker 
                                                placeholder="Chọn ngày nhập"
                                                size="large"
                                                style={{ width: "100%" }}
                                            />
                                        </Form.Item>
                                    </ConfigProvider>
                                </Card>

                                <Card bordered={false} className="glass-card shadow-sm status-card">
                                    <Typography.Title level={5} className="section-title">
                                        <DollarOutlined /> Giá trị lô hàng nhập
                                    </Typography.Title>
                                    
                                    <div className="computed-total-widget">
                                        <div className="total-title">Tổng tiền hàng</div>
                                        <div className="total-val">
                                            {calculatedMoney.toLocaleString('vi-VN')} ₫
                                        </div>
                                    </div>
                                    <Form.Item name="money" style={{ display: 'none' }}>
                                        <InputNumber />
                                    </Form.Item>
                                    
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
                                        Số tiền này được tự động tính dựa trên số lượng và đơn giá nhập của từng sản phẩm bên phải.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Detailed Product Items */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <ShoppingOutlined /> Danh sách sản phẩm nhập kho
                                </Typography.Title>
                                
                                <Form.List name="products" rules={[
                                    {
                                        validator: async (_, value) => {
                                            if (!value || value.length < 1) {
                                                return Promise.reject(new Error("Vui lòng thêm ít nhất một sản phẩm"));
                                            }
                                        }
                                    }
                                ]}>
                                    {(fields, { add, remove }) => (
                                        <Flex vertical style={{ width: "100%" }}>
                                            {fields.map((field, index) => (
                                                <div key={field.key} className="consignment-item">
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

                                                    <Typography.Title level={5} className="consignment-item-header" style={{ marginBottom: 16 }}>
                                                        <DashboardOutlined /> Sản phẩm #{index + 1}
                                                    </Typography.Title>

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
                                                                    options={products}
                                                                    placeholder="Tìm kiếm và chọn sản phẩm..."
                                                                    size="large"
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={12}>
                                                            <Form.Item
                                                                name={[field.name, "quantity"]}
                                                                fieldId={[field.key, "quantity"]}
                                                                label="Số lượng"
                                                                rules={[{ required: true, message: "Nhập số lượng" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <InputNumber 
                                                                    min={1} 
                                                                    placeholder="VD: 100" 
                                                                    size="large" 
                                                                    style={{ width: "100%" }}
                                                                    prefix={<FieldNumberOutlined style={{color: '#bfbfbf'}} />}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={12}>
                                                            <Form.Item
                                                                name={[field.name, "importMoney"]}
                                                                fieldId={[field.key, "importMoney"]}
                                                                label="Đơn giá nhập"
                                                                rules={[{ required: true, message: "Nhập đơn giá" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <InputNumber 
                                                                    min={0} 
                                                                    placeholder="VD: 15,000" 
                                                                    suffix="₫" 
                                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                    size="large" 
                                                                    style={{ width: "100%" }}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={12}>
                                                            <ConfigProvider locale={locale}>
                                                                <Form.Item
                                                                    label="Hạn sử dụng (HSD)"
                                                                    name={[field.name, "expireDate"]}
                                                                    fieldId={[field.key, "expireDate"]}
                                                                    rules={[{ required: true, message: "Chọn hạn sử dụng" }]}
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <DatePicker 
                                                                        placeholder="Chọn ngày hết hạn" 
                                                                        size="large"
                                                                        style={{ width: "100%" }} 
                                                                    />
                                                                </Form.Item>
                                                            </ConfigProvider>
                                                        </Col>

                                                        <Col xs={24} sm={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                            <Form.Item
                                                                shouldUpdate={(prevValues, currentValues) => {
                                                                    const prev = prevValues.products?.[field.name];
                                                                    const curr = currentValues.products?.[field.name];
                                                                    return prev?.quantity !== curr?.quantity || prev?.importMoney !== curr?.importMoney;
                                                                }}
                                                                style={{ marginBottom: 0, width: '100%' }}
                                                            >
                                                                {({ getFieldValue }) => {
                                                                    const qty = getFieldValue(['products', field.name, 'quantity']) || 0;
                                                                    const price = getFieldValue(['products', field.name, 'importMoney']) || 0;
                                                                    return (
                                                                        <div className="item-computed-box">
                                                                            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                                                                                <InteractionOutlined /> Thành tiền:
                                                                            </Typography.Text>
                                                                            <Typography.Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                                                                {(qty * price).toLocaleString('vi-VN')} ₫
                                                                            </Typography.Text>
                                                                        </div>
                                                                    )
                                                                }}
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
                                                    className="btn-add-consignment"
                                                >
                                                    Thêm sản phẩm nhập kho
                                                </Button>
                                            </Form.Item>
                                        </Flex>
                                    )}
                                </Form.List>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" onClick={() => navigate('/admin/consignment')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large" 
                                        loading={isPending}
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        {condition ? "Lưu thay đổi" : "Lưu phiếu nhập"}
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

export default DetailConsignment;