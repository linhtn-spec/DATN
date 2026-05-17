import {
    MinusCircleOutlined,
    PlusOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    GiftOutlined,
    ShoppingOutlined,
    PercentageOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    ConfigProvider,
    DatePicker,
    Flex,
    Form,
    InputNumber,
    Select,
    Switch,
    Typography,
    Col,
    Row,
    Divider
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import './DetailSale.css';
import AdminHeader from "../../components/AdminHeader";

import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { productAll } from "../../../../services/product_service";
import { addSale, detailSale, updateSale } from "../../../../services/sale_service";
import { queryClient } from "../../../../main";
import Notification from "../../../../utils/configToastify";
import SaleFormSkeleton from "./SaleFormSkeleton";
dayjs.locale('vi')

export function DetailSale() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [condition, setCondition] = useState(false);
    
    const applyDateValue = Form.useWatch('applyDate', form);
    const dueDateValue = Form.useWatch('dueDate', form);
    
    const { sale_id } = useParams();

    const createSaleRequest = useMutation({
        mutationFn: (data) => condition ? updateSale(data) : addSale(data),
        onSuccess: () => {
            Notification({ message: `${condition ? "Cập nhật" : "Tạo"} khuyến mãi thành công!`, type: "success" })
            queryClient.invalidateQueries({ queryKey: ['sales_admin_list'] })
            navigate(`/admin/sales`, { replace: true })
        },
        onError: () => {
            Notification({ message: `${condition ? "Cập nhật" : "Tạo"} khuyến mãi thất bại!`, type: "error" })
        }
    })

    const queryAllProduct = useQuery({
        queryKey: ['product_all'],
        queryFn: () => productAll()
    })

    const querySaleDetail = useQuery({
        queryKey: ['sale_detail_admin', sale_id],
        queryFn: () => detailSale(sale_id),
        enabled: !!sale_id
    })

    useEffect(() => {
        if (!querySaleDetail.isSuccess) return
        const rawData = querySaleDetail.data?.data
        form.setFieldValue('applyDate', dayjs(rawData?.applyDate))
        form.setFieldValue('dueDate', dayjs(rawData?.dueDate))
        form.setFieldValue('isActive', rawData?.isActive)
        form.setFieldValue('products', rawData?.products.map(item => ({ productId: item?.productId?._id, pricePromotion: item?.pricePromotion })))

    }, [querySaleDetail.isSuccess, querySaleDetail.data, form])

    const onFinish = (value) => {
        createSaleRequest.mutate({ ...value, ...(condition ? { id: sale_id } : {}) })
    }

    useEffect(() => {
        if (sale_id) setCondition(true)
        return () => {
            setCondition(false)
        }
    }, [sale_id])

    useEffect(() => {
        if (!queryAllProduct.isSuccess) return
        const rawData = queryAllProduct?.data?.data?.data
        setProducts(rawData?.map(item => ({
            value: item?._id,
            label: item?.name
        })))
    }, [queryAllProduct.data, queryAllProduct.isSuccess])

    const showSkeleton = querySaleDetail.isFetching || queryAllProduct.isLoading || createSaleRequest.isPending;

    return (
        <Flex className="crud_user container" vertical>
            <AdminHeader 
                title={condition ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"} 
                icon={<PlusOutlined />} 
            />
            
            {showSkeleton ? (
                <SaleFormSkeleton />
            ) : (
                <Form 
                    style={{ width: "100%" }}
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    className="premium-form"
                    initialValues={{ isActive: true }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Schedule & Status */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm schedule-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CalendarOutlined /> Thời gian áp dụng
                                    </Typography.Title>
                                    
                                    <ConfigProvider locale={locale}>
                                        <Form.Item
                                            label="Ngày bắt đầu"
                                            name="applyDate"
                                            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                                        >
                                            <DatePicker 
                                                placeholder="Ngày áp dụng"
                                                size="large"
                                                style={{ width: "100%" }}
                                                maxDate={dueDateValue ? dayjs(dueDateValue).subtract(1, 'day') : ''} 
                                            />
                                        </Form.Item>
                                        
                                        <Form.Item
                                            label="Ngày kết thúc"
                                            name="dueDate"
                                            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
                                        >
                                            <DatePicker
                                                placeholder="Ngày kết thúc" 
                                                size="large"
                                                style={{ width: "100%" }}
                                                minDate={applyDateValue ? dayjs(applyDateValue).add(1, 'day') : ''} 
                                            />
                                        </Form.Item>
                                    </ConfigProvider>
                                </Card>

                                <Card bordered={false} className="glass-card shadow-sm status-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CheckCircleOutlined /> Trạng thái kích hoạt
                                    </Typography.Title>
                                    <Flex justify="space-between" align="center" className="status-item">
                                        <Typography.Text strong>Kích hoạt khuyến mãi</Typography.Text>
                                        <Form.Item name='isActive' valuePropName="checked" style={{ marginBottom: 0 }}>
                                            <Switch checkedChildren='Bật' unCheckedChildren="Khóa" />
                                        </Form.Item>
                                    </Flex>
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
                                        Khi tắt trạng thái, tất cả sản phẩm thuộc đợt khuyến mãi này sẽ trở lại giá gốc ngay lập tức.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Products List */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <GiftOutlined /> Danh sách sản phẩm áp dụng
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
                                                <div key={field.key} className="promotion-item">
                                                    <Row gutter={16} align="middle">
                                                        <Col xs={24} sm={2} style={{ marginBottom: { xs: 8, sm: 0 } }}>
                                                            <Typography.Text className="promotion-item-header">
                                                                #{index + 1}
                                                            </Typography.Text>
                                                        </Col>
                                                        
                                                        <Col xs={24} sm={13}>
                                                            <Form.Item
                                                                name={[field.name, "productId"]}
                                                                fieldId={[field.key, "productId"]}
                                                                label="Sản phẩm"
                                                                rules={[{ required: true, message: "Chọn sản phẩm" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Select
                                                                    virtual={false}
                                                                    options={products}
                                                                    showSearch
                                                                    optionFilterProp="label"
                                                                    placeholder="Chọn sản phẩm áp dụng..."
                                                                    size="large"
                                                                    suffixIcon={<ShoppingOutlined />}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        
                                                        <Col xs={20} sm={7}>
                                                            <Form.Item
                                                                name={[field.name, "pricePromotion"]}
                                                                fieldId={[field.key, "pricePromotion"]}
                                                                label="Giảm giá (%)"
                                                                rules={[{ required: true, message: "Nhập % giảm" }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <InputNumber 
                                                                    min={0} 
                                                                    max={100} 
                                                                    placeholder="0 - 100" 
                                                                    step={1} 
                                                                    size="large" 
                                                                    style={{ width: "100%" }}
                                                                    prefix={<PercentageOutlined />}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        
                                                        <Col xs={4} sm={2} className="delete-btn-container" style={{ marginTop: 28 }}>
                                                            <Button 
                                                                type="text"
                                                                danger
                                                                shape="circle"
                                                                icon={<MinusCircleOutlined style={{ fontSize: 20 }} />} 
                                                                onClick={() => remove(field.name)} 
                                                            />
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
                                                    className="btn-add-product"
                                                >
                                                    Thêm sản phẩm khuyến mãi
                                                </Button>
                                            </Form.Item>
                                        </Flex>
                                    )}
                                </Form.List>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" onClick={() => navigate('/admin/sales')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large" 
                                        loading={createSaleRequest.isPending}
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        {condition ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}
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