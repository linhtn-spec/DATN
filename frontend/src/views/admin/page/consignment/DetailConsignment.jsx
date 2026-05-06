import {
    MinusCircleOutlined,
    PlusOutlined
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
    Typography
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
dayjs.locale('vi')

const formItemLayout = {
    labelCol: {
        xs: { span: 100 },
        sm: { span: 60 },
    },
    wrapperCol: {
        xs: { span: 90 },
        sm: { span: 40 },
    },
};

export function DetailConsignment() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [products, setProducts] = useState([])
    const [condition, setCondition] = useState(false)

    const { consignment_id } = useParams()

    const { mutate } = useMutation({
        mutationFn: (data) => condition ? updateConsignment(data) : addConsignment(data),
        onSuccess: () => {
            Notification({ message: condition ? `Cập nhật phiếu nhập kho thành công!` : "Tạo phiếu nhập kho thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['ratings_admin_list'] })
            navigate(`/admin/consignment`, { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
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
    useEffect(() => {
        if (watchedProducts && Array.isArray(watchedProducts)) {
            const sum = watchedProducts.reduce((acc, curr) => {
                const qty = curr?.quantity || 0;
                const price = curr?.importMoney || 0;
                return acc + (qty * price);
            }, 0);
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

    return (
        <Flex className="crud_user  container" vertical>
            <AdminHeader 
                title={condition ? "Cập nhật phiếu nhập kho" : "Tạo phiếu nhập kho"} 
                icon={<PlusOutlined />} 
            />
            <Card
                title={condition ? "Cập nhật phiếu nhập kho" : "Tạo phiếu nhập kho"}
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form {...formItemLayout} style={{ width: "100%" }}
                        form={form}
                        onFinish={onFinish}
                    >
                        <Flex vertical style={{ width: "100%" }}>
                            <Flex gap={"0px"} style={{ width: "100%" }}>
                                <ConfigProvider locale={locale} width={"40%"}>
                                    <Form.Item
                                        label={"Ngày nhập"}
                                        name="importDate"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập ngày nhập"
                                            }
                                        ]}
                                        style={{ width: "90%" }} required
                                    >
                                        <DatePicker placeholder='Ngày nhập'
                                            style={{ width: "80%" }}
                                        />
                                    </Form.Item>
                                </ConfigProvider>
                                <Form.Item
                                    label={"Tổng tiền nhập"}
                                    name="money"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Chưa có dữ liệu tiền nhập!"
                                        }
                                    ]}
                                    style={{ width: "100%" }} required
                                >
                                    <InputNumber 
                                        min={0} 
                                        placeholder="Tổng báo giá (Tự động)" 
                                        suffix="₫" 
                                        style={{ width: "50%", color: "#f5222d", fontWeight: "bold" }} 
                                        readOnly
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    />
                                </Form.Item>
                            </Flex>
                        </Flex>
                        <Flex>
                            <Form.List name="products" rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập ít nhất một sản phẩm"
                                }
                            ]}>
                                {(fields, { add, remove }) =>
                                (<Flex vertical gap={'40px'} style={{ width: "100%" }}>
                                    {fields.map((field, index) => (
                                        <Flex key={field.key} align="flex-start" gap={'20px'} style={{ padding: "20px", border: "1px dashed #d9d9d9", borderRadius: "8px", position: "relative" }}>
                                            <Typography.Title level={5} style={{ marginBottom: 0, fontWeight: 600, fontSize: '18px', width: "20%" }}>{`Sản phẩm ${index + 1}`}</Typography.Title>
                                            <Flex vertical style={{ width: "75%" }} gap={"20px"}>
                                                <Flex style={{ width: "100%" }} gap={"16px"} vertical>
                                                    <Form.Item
                                                        name={[field.name, "productId"]}
                                                        fieldId={[field.key, "productId"]}
                                                        label="Tên sản phẩm"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "Vui lòng nhập tên sản phẩm"
                                                            }
                                                        ]}
                                                        style={{ marginBottom: 0, width: "100%" }}                                                    >
                                                        <Select
                                                            showSearch
                                                            optionFilterProp="label"
                                                            virtual={false}
                                                            options={products}
                                                            placeholder={'Chọn tên sản phẩm'}
                                                        />
                                                    </Form.Item>

                                                    <Flex gap="16px">
                                                        <Form.Item
                                                            name={[field.name, "quantity"]}
                                                            fieldId={[field.key, "quantity"]}
                                                            label="Số lượng"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Vui lòng nhập số lượng"
                                                                },
                                                            ]}
                                                            style={{ marginBottom: 0, flex: 1 }}
                                                        >
                                                            <InputNumber min={1} placeholder="Số lượng" step={1} style={{ width: "100%" }} />
                                                        </Form.Item>

                                                        <Form.Item
                                                            name={[field.name, "importMoney"]}
                                                            fieldId={[field.key, "importMoney"]}
                                                            label="Đơn giá nhập"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Vui lòng nhập đơn giá"
                                                                },
                                                            ]}
                                                            style={{ marginBottom: 0, flex: 1 }}
                                                        >
                                                            <InputNumber 
                                                                min={0} 
                                                                placeholder="Đơn giá (VD: 10,000)" 
                                                                suffix="₫" 
                                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                style={{ width: "100%" }}
                                                            />
                                                        </Form.Item>
                                                    </Flex>

                                                    <Flex gap="16px" align="center">
                                                        <ConfigProvider locale={locale}>
                                                            <Form.Item
                                                                label={"Ngày hết hạn"}
                                                                name={[field.name, "expireDate"]}
                                                                fieldId={[field.key, "expireDate"]}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: "Vui lòng chọn ngày"
                                                                    }
                                                                ]}
                                                                style={{ margin: 0, flex: 1 }} required
                                                            >
                                                                <DatePicker placeholder='Hệ thống theo dõi HSD' style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </ConfigProvider>
                                                        
                                                        <Form.Item
                                                            shouldUpdate={(prevValues, currentValues) => {
                                                                const prev = prevValues.products?.[field.name];
                                                                const curr = currentValues.products?.[field.name];
                                                                return prev?.quantity !== curr?.quantity || prev?.importMoney !== curr?.importMoney;
                                                            }}
                                                            style={{ margin: 0, flex: 1, paddingLeft: "10px" }}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const qty = getFieldValue(['products', field.name, 'quantity']) || 0;
                                                                const price = getFieldValue(['products', field.name, 'importMoney']) || 0;
                                                                return (
                                                                    <div style={{ padding: "4px 12px", background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: "4px" }}>
                                                                        <Typography.Text>Thành tiền: </Typography.Text>
                                                                        <Typography.Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                                                                            {(qty * price).toLocaleString('vi-VN')} ₫
                                                                        </Typography.Text>
                                                                    </div>
                                                                )
                                                            }}
                                                        </Form.Item>
                                                    </Flex>

                                                </Flex>
                                            </Flex>
                                            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                                                <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(field.name)}>Xóa</Button>
                                            </div>
                                        </Flex>
                                    ))}
                                    <Flex justify="center" style={{ marginTop: "10px" }}>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ height: "40px" }}>
                                            Thêm sản phẩm nhập kho
                                        </Button>
                                    </Flex>
                                </Flex>)
                                }
                            </Form.List>
                        </Flex>
                        <Form.Item style={{ marginTop: "30px" }}>
                            <Flex justify="center" gap={20} className="group_btn">
                                <Button type="default" onClick={() => navigate('/admin/consignment')} style={{ width: "120px" }}>
                                    Hủy bỏ
                                </Button>
                                <Button type="primary" htmlType="submit" style={{ width: "120px", background: "#1890ff" }}>
                                    {condition ? "Lưu thay đổi" : "Lưu phiếu nhập"}
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}

export default DetailConsignment;