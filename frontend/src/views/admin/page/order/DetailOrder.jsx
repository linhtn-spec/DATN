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
            Notification({ message: "Update order successfully!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['orders_admin_list'] })
            navigate('/admin/orders', { replace: true })
        },
        onError: () => {
            Notification({ message: "Update order unsuccessfully!", type: "error" })
        }
    })

    const handleSubmit = (value) => {
        mutate({
            ...value, id: order_id
        });
    }

    const cartColumns = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            width: "80px",
        },
        {
            title: "Image",
            dataIndex: 'image',
            key: 'image',
            hidden: true
        },
        {
            title: 'Name',
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
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (text) => <p>{text}$</p>

        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (text) => <p>{text}$</p>
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
            <h2 className='caption'><PlusOutlined />{"Detail order"}</h2>
            <Card
                title={"Detail order"}
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
                                        label="First name"
                                        hasFeedback
                                        required
                                        name="firstNameReceiver"
                                        rules={[

                                            {
                                                min: 1,
                                                message: "Minimum 1 character"
                                            },
                                            {
                                                max: 50,
                                                message: "Maximum 50 character"
                                            }
                                        ]}

                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Name"
                                        required
                                        hasFeedback
                                        name="lastNameReceiver"
                                        rules={[

                                            {
                                                min: 1,
                                                message: "Minimum 1 character"
                                            },
                                            {
                                                max: 50,
                                                message: "Maximum 50 character"
                                            }
                                        ]}

                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Phone"
                                        hasFeedback
                                        required
                                        name="phoneReceiver"
                                        rules={[

                                            {
                                                min: 1,
                                                message: "Minimum 1 character"
                                            },
                                            {
                                                max: 15,
                                                message: "Maximum 15 character"
                                            }
                                        ]}

                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        required
                                        label="Email"
                                        hasFeedback
                                        name="emailReceiver"
                                        rules={[

                                            {
                                                min: 1,
                                                message: "Minimum 1 character"
                                            },
                                            {
                                                max: 30,
                                                message: "Maximum 30 character"
                                            }
                                        ]}

                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Address"
                                        hasFeedback
                                        required
                                        name="addressReceiver"
                                        rules={[

                                            {
                                                min: 1,
                                                message: "Minimum 1 character"
                                            },
                                            {
                                                max: 50,
                                                message: "Maximum 50 character"
                                            }
                                        ]}

                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Country"
                                        hasFeedback
                                        required
                                        name="countryReceiver"
                                        rules={[

                                            {
                                                min: 1,
                                                message: "Minimum 1 character"
                                            },
                                            {
                                                max: 50,
                                                message: "Maximum 50 character"
                                            }
                                        ]}

                                    >
                                        <Select placeholder="Country" size="small" style={{ height: "31.33px" }} options={options}
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
                                    <Form.Item label="Order status"
                                        hasFeedback
                                        required
                                        name="orderStatus">
                                        <Select placeholder="Order status" size="small" style={{ height: "31.33px" }} options={orderStatusOptions} />
                                    </Form.Item>
                                    <Form.Item label="Shipping status"
                                        hasFeedback
                                        required
                                        name="shippingStatus">
                                        <Select placeholder="Shipping status" size="small" style={{ height: "31.33px" }} options={shippingStatusOptions} />

                                    </Form.Item>
                                    <Form.Item label="Payment status"
                                        hasFeedback
                                        required
                                        name="paymentStatus">
                                        <Select placeholder="Payment status" size="small" style={{ height: "31.33px" }} options={paymentStatusOptions} />

                                    </Form.Item>
                                    <Form.Item label="Shipping method"
                                        hasFeedback
                                        required
                                        name="shippingMethod">
                                        <Select placeholder="Shipping method" options={shippingMethodOptions} disabled />

                                    </Form.Item>
                                    <Form.Item label="Payment method"
                                        hasFeedback
                                        name="paymentMethod">
                                        <Select placeholder="Payment method" options={paymentMethodOptions} disabled />

                                    </Form.Item>
                                    <Form.Item label="Created at"
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
                                            label="Subtotal"
                                            hasFeedback
                                            name="subTotal"
                                            style={{ width: "100%" }}
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Subtotal" min={0} suffix="$" disabled />
                                        </Form.Item>
                                        <Form.Item
                                            label="Tax"
                                            hasFeedback
                                            name="tax"
                                            style={{ width: "100%" }}
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Tax" min={0} suffix="$" />
                                        </Form.Item>
                                        <Form.Item
                                            style={{ width: "100%" }}
                                            label="Shipping cost"
                                            hasFeedback
                                            name="shippingCost"
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Shipping cost" min={0} suffix="$" />
                                        </Form.Item>
                                        <Form.Item
                                            style={{ width: "100%" }}
                                            label="Total"
                                            hasFeedback
                                            name="total"
                                            rules={[
                                                {
                                                    required: true
                                                }
                                            ]}
                                        >
                                            <InputNumber placeholder="Total" min={0} suffix="$" disabled />
                                        </Form.Item>
                                        <Form.Item label="After change"
                                            hasFeedback
                                            required
                                        >
                                            <Typography.Text>{subTotalValue + taxValue + shippingCostlValue}$</Typography.Text>
                                        </Form.Item>

                                    </Flex>


                                    <Divider type="vertical" />
                                    <Flex style={{ width: "50%" }}>
                                        <Form.Item
                                            style={{ width: "100%" }}
                                            label="Note"
                                            name="note"
                                            validateDebounce={1500}
                                            rules={[
                                                {
                                                    min: 1,
                                                    message: "Minimum 1 characters"
                                                },
                                                {
                                                    max: 300,
                                                    message: "Maximum 300 characters"
                                                }
                                            ]}
                                        >
                                            <TextArea name="note" rows={11} disabled />
                                        </Form.Item>

                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex justify="center" vertical align="center" gap="10px">
                            {(data?.data?.orderStatus === 'canceled' || data?.data?.orderStatus === 'done') && (
                                <Typography.Text type="danger">
                                    This order is {data?.data?.orderStatus} and cannot be modified.
                                </Typography.Text>
                            )}
                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    disabled={data?.data?.orderStatus === 'canceled' || data?.data?.orderStatus === 'done'}
                                >
                                    Update
                                </Button>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}