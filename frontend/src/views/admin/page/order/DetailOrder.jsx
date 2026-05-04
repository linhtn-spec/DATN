import {
    PlusOutlined
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
    Typography
} from 'antd';
import Card from "antd/es/card/Card";
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
import './DetailOrder.css';

const formItemLayout = {
    labelCol: {
        xs: { span: 30 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};

export function DetailOrder() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const subTotalValue = Form.useWatch('subTotal', form)
    const taxValue = Form.useWatch('tax', form)
    const shippingCostlValue = Form.useWatch('shippingCost', form)


    const [options, setOptions] = useState([])
    const [products, setProducts] = useState([])
    const [total, setTotal] = useState(1)
    const [page, setPage] = useState(1)

    const { order_id } = useParams()
    const queryCountry = useQuery({
        queryKey: ['countries_product_create'],
        queryFn: () => axios.get('https://countriesnow.space/api/v0.1/countries/capital'),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['detail_order_admin', order_id],
        queryFn: () => detailOrder(order_id),
        enabled: !!order_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật đơn hàng thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['orders_admin_list'] })
            navigate('/admin/orders', { replace: true })
        },
        onError: () => {
            Notification({ message: "Cập nhật đơn hàng thất bại!", type: "error" })
        }
    })

    const handleSubmit = (value) => {
        mutate({
            ...value, id: order_id
        });
    }

    const cartColumns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
            width: "80px",
        },
        {
            title: "Hình ảnh",
            dataIndex: 'image',
            key: 'image',
            hidden: true
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, row) => (
                <Flex align='center' gap={20}>
                    <Typography.Text>{text}</Typography.Text>
                    <Image src={row.image} width={80} height={80} />
                </Flex>
            )
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (text) => <p>{text?.toLocaleString('vi-VN')} ₫</p>

        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (text) => <p>{text?.toLocaleString('vi-VN')} ₫</p>
        },
    ];


    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data

        form.setFieldValue('firstNameReceiver', rawData?.firstNameReceiver)
        form.setFieldValue('lastNameReceiver', rawData?.lastNameReceiver)
        form.setFieldValue('emailReceiver', rawData?.emailReceiver)
        form.setFieldValue('phoneReceiver', rawData?.phoneReceiver)
        form.setFieldValue('paymentMethod', rawData?.paymentMethod)
        form.setFieldValue('countryReceiver', rawData?.countryReceiver)
        form.setFieldValue('paymentStatus', rawData?.paymentStatus)
        form.setFieldValue('shippingMethod', rawData?.shippingMethod)
        form.setFieldValue('addressReceiver', rawData?.addressReceiver)
        form.setFieldValue('paymentStatus', rawData?.paymentStatus)
        form.setFieldValue('orderStatus', rawData?.orderStatus)
        form.setFieldValue('note', rawData?.note)
        form.setFieldValue('orderStatus', rawData?.orderStatus)
        form.setFieldValue('shippingCost', rawData?.shippingCost)
        form.setFieldValue('total', rawData?.total)
        form.setFieldValue('createdAt', rawData?.createdAt)
        form.setFieldValue('tax', rawData?.tax)
        form.setFieldValue('subTotal', rawData?.products.reduce((prev, curr) => prev + curr.subPrice, 0))
        form.setFieldValue('shippingStatus', rawData?.shippingStatus)

        setProducts(rawData?.products?.map((item, index) => ({
            no: index + 1,
            image: item?.productId?.images,
            name: item?.productId?.name,
            quantity: item?.quantity,
            price: item?.productId?.price,
            subtotal: item?.subPrice
        })))

        setTotal(rawData?.products?.length)

        return () => {
            setProducts([])
            setTotal(1)
        }

    }, [isSuccess, data, setProducts, form])

    useEffect(() => {
        if (!queryCountry?.isSuccess) return
        const rawData = queryCountry?.data?.data?.data
        setOptions(rawData?.map(item => ({ value: item?.name, text: item?.name })))

    }, [queryCountry?.isSuccess, queryCountry?.data, setOptions])

    useEffect(() => {
        form.setFieldValue('total', form.getFieldValue('subTotal') + form.getFieldValue('shippingCost') + form.getFieldValue('tax'))
    }, [form])
    return (
        <Flex className="crud_user container" vertical>
            <h2 className='caption'><PlusOutlined />{"Chi tiết đơn hàng"}</h2>
            <Card
                title={"Chi tiết đơn hàng"}
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form {...formItemLayout} style={{ width: "100%" }} onFinish={handleSubmit}
                        form={form}
                    >
                        <Flex vertical>
                            <Flex>
                                <Flex vertical style={{ width: "50%" }}>
                                    <Form.Item
                                        label="Họ"
                                        hasFeedback
                                        required
                                        name="firstNameReceiver"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Tên"
                                        required
                                        hasFeedback
                                        name="lastNameReceiver"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Số điện thoại"
                                        hasFeedback
                                        required
                                        name="phoneReceiver"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        required
                                        label="Email"
                                        hasFeedback
                                        name="emailReceiver"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Địa chỉ"
                                        hasFeedback
                                        required
                                        name="addressReceiver"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Quốc gia"
                                        hasFeedback
                                        required
                                        name="countryReceiver"
                                    >
                                        <Select placeholder="Quốc gia" size="small" style={{ height: "31.33px" }} options={options}
                                            showSearch
                                            virtual={false}
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.text ?? '').includes(input)}
                                            filterSort={(optionA, optionB) =>
                                                (optionA?.text ?? '').toLowerCase().localeCompare((optionB?.text ?? '').toLowerCase())
                                            }
                                            disabled
                                        />
                                    </Form.Item>
                                </Flex>
                                <Divider type="vertical" />
                                <Flex vertical style={{ width: "50%" }}>
                                    <Form.Item label="Trạng thái đơn hàng"
                                        hasFeedback
                                        required
                                        name="orderStatus">
                                        <Select placeholder="Chọn trạng thái" size="small" style={{ height: "31.33px" }} options={orderStatusOptions} />
                                    </Form.Item>
                                    <Form.Item label="Trạng thái giao hàng"
                                        hasFeedback
                                        required
                                        name="shippingStatus">
                                        <Select placeholder="Chọn trạng thái" size="small" style={{ height: "31.33px" }} options={shippingStatusOptions} />

                                    </Form.Item>
                                    <Form.Item label="Trạng thái thanh toán"
                                        hasFeedback
                                        required
                                        name="paymentStatus">
                                        <Select placeholder="Chọn trạng thái" size="small" style={{ height: "31.33px" }} options={paymentStatusOptions} />

                                    </Form.Item>
                                    <Form.Item label="Phương thức giao hàng"
                                        hasFeedback
                                        required
                                        name="shippingMethod">
                                        <Select placeholder="Chọn phương thức" options={shippingMethodOptions} disabled />

                                    </Form.Item>
                                    <Form.Item label="Phương thức thanh toán"
                                        hasFeedback
                                        name="paymentMethod">
                                        <Select placeholder="Chọn phương thức" options={paymentMethodOptions} disabled />

                                    </Form.Item>
                                    <Form.Item label="Ngày tạo"
                                        hasFeedback
                                        required
                                        name="createdAt">
                                        <Typography.Text>{convertToDate(form.getFieldValue('createdAt'))}</Typography.Text>
                                    </Form.Item>
                                </Flex>
                            </Flex>
                            <Flex vertical gap={"20px"}>
                                <Table
                                    bordered
                                    columns={cartColumns}
                                    dataSource={products}
                                    pagination={{ hideOnSinglePage: true, pageSize: 3, total: total, defaultCurrent: page, onChange: setPage, showSizeChanger: false }}

                                />
                                <Flex>
                                    <Flex vertical style={{ width: "50%" }}>
                                        <Form.Item
                                            label="Tạm tính"
                                            hasFeedback
                                            name="subTotal"
                                            style={{ width: "100%" }}
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Tạm tính" min={0} suffix="₫" disabled 
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Thuế"
                                            hasFeedback
                                            name="tax"
                                            style={{ width: "100%" }}
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Thuế" min={0} suffix="₫" 
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            style={{ width: "100%" }}
                                            label="Phí vận chuyển"
                                            hasFeedback
                                            name="shippingCost"
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Phí vận chuyển" min={0} suffix="₫" 
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            style={{ width: "100%" }}
                                            label="Tổng cộng"
                                            hasFeedback
                                            name="total"
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Tổng cộng" min={0} suffix="₫" disabled 
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                        <Form.Item label="Tổng sau thay đổi"
                                            hasFeedback
                                            required
                                        >
                                            <Typography.Text>{((subTotalValue || 0) + (taxValue || 0) + (shippingCostlValue || 0))?.toLocaleString('vi-VN')} ₫</Typography.Text>
                                        </Form.Item>

                                    </Flex>


                                    <Divider type="vertical" />
                                    <Flex style={{ width: "50%" }}>
                                        <Form.Item
                                            style={{ width: "100%" }}
                                            label="Ghi chú"
                                            name="note"
                                            validateDebounce={1500}
                                        >
                                            <TextArea name="note" rows={11} disabled placeholder="Ghi chú đơn hàng" />
                                        </Form.Item>

                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex justify="center" vertical align="center" gap="10px">
                            {(data?.data?.orderStatus === 'canceled' || data?.data?.orderStatus === 'done') && (
                                <Typography.Text type="danger">
                                    Đơn hàng này hiện đang ở trạng thái {getLabelByValue(data?.data?.orderStatus, orderStatusOptions)} và không thể chỉnh sửa.
                                </Typography.Text>
                            )}
                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    disabled={data?.data?.orderStatus === 'canceled' || data?.data?.orderStatus === 'done'}
                                >
                                    Cập nhật
                                </Button>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}