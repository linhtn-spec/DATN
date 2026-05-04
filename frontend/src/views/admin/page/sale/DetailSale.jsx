import {
    MinusCircleOutlined,
    PlusOutlined
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
    Typography
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import './DetailSale.css';

import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { productAll } from "../../../../services/product_service";
import { addSale, detailSale, updateSale } from "../../../../services/sale_service";
import { queryClient } from "../../../../main";
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

export function DetailSale() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [products, setProducts] = useState([])

    const [condition, setCondition] = useState(false)
    const applyDateValue = Form.useWatch('applyDate', form)
    const dueDateValue = Form.useWatch('dueDate', form)
    const productValues = Form.useWatch('products', form)
    console.log(productValues);

    const { sale_id } = useParams()

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
        console.log(rawData);
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

    return (
        <Flex className="crud_user  container" vertical>
            <h2 className='caption'><PlusOutlined />{condition ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}</h2>
            <Card
                title={condition ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form {...formItemLayout} style={{ width: "100%" }}
                        form={form}
                        onFinish={onFinish}
                    >
                        <Flex vertical>
                            <Flex gap={"80px"}>
                                <ConfigProvider locale={locale} width={"70%"}>
                                    <Form.Item
                                        label={"Ngày áp dụng"}
                                        name="applyDate"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập ngày áp dụng"
                                            }
                                        ]}
                                        style={{ width: "100%" }} required
                                    >
                                        <DatePicker placeholder='Ngày áp dụng'
                                            style={{ width: "100%" }}
                                            maxDate={dueDateValue ? dayjs(dueDateValue).subtract(1, 'day') : ''} />
                                    </Form.Item>
                                    <Form.Item
                                        label={"Ngày kết thúc"}
                                        name="dueDate"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập ngày kết thúc"
                                            }
                                        ]}
                                        style={{ width: "100%" }} required
                                    >
                                        <DatePicker
                                            style={{ width: "100%" }}

                                            placeholder='Ngày kết thúc' minDate={applyDateValue ? dayjs(applyDateValue).add(1, 'day') : ''} />
                                    </Form.Item>
                                </ConfigProvider>
                            </Flex>

                            <Flex gap={10}>
                                <Form.Item name='isActive' label="Trạng thái" required>
                                    <Switch checkedChildren='Hoạt động' unCheckedChildren="Khóa" />
                                </Form.Item>
                            </Flex>
                        </Flex>
                        <Flex>
                            <Form.List name="products" rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn ít nhất một sản phẩm"
                                }
                            ]}>
                                {(fields, { add, remove }) =>
                                (<Flex vertical gap={'20px'} style={{ width: "100%" }}>
                                    {fields.map((field, index) => (
                                        <Flex key={field.key} align="center" gap={'20px'}>
                                            <Typography.Title style={{ marginBottom: 0, fontWeight: 600, fontSize: '18px' }}>{`Sản phẩm ${index + 1}`}</Typography.Title>
                                            <Form.Item
                                                name={[field.name, "productId"]}
                                                fieldId={[field.key, "productId"]}
                                                label="Tên sản phẩm"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Vui lòng chọn sản phẩm"
                                                    }
                                                ]}
                                                style={{ marginBottom: 0, width: "40%" }}
                                            >
                                                <Select
                                                    virtual={false}

                                                    options={products}
                                                    showSearch
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) => (option?.text ?? '').includes(input)}
                                                    filterSort={(optionA, optionB) =>
                                                        (optionA?.text ?? '').toLowerCase().localeCompare((optionB?.text ?? '').toLowerCase())
                                                    }
                                                    placeholder={'Tên sản phẩm'}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name={[field.name, "pricePromotion"]}
                                                fieldId={[field.key, "pricePromotion"]}
                                                label="Giảm giá (%)"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Vui lòng nhập phần trăm giảm giá (0-100)"
                                                    },
                                                ]}
                                                style={{ marginBottom: 0, width: "20%" }}

                                            >
                                                <InputNumber min={0} max={100} placeholder="Giảm giá (0-100)" step={1} />
                                            </Form.Item>
                                            <Flex style={{ width: "10%", marginLeft: "70px" }}>
                                                <MinusCircleOutlined style={{ color: 'red' }} onClick={() => remove(field.name)} />
                                            </Flex>
                                        </Flex>
                                    ))}
                                    <Flex>
                                        <Form.Item>
                                            <Button onClick={() => add()}>Thêm sản phẩm </Button>
                                        </Form.Item>
                                    </Flex>
                                </Flex>)
                                }
                            </Form.List>
                        </Flex>
                        <Form.Item>
                            <Flex justify="center" gap={20} className="group_btn">
                                <Button type="primary" htmlType="submit" >
                                    {condition ? "Cập nhật" : "Thêm mới"}
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}