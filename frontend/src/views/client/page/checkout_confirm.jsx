import { CreditCardOutlined, DisconnectOutlined, MoneyCollectOutlined, SendOutlined, TruckOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Descriptions, Flex, Form, Input, InputNumber, Radio, Select, Space, Table, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createBill } from "../../../services/payment_service";
import "../style/checkout_confirm.css";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { OrderContext } from "../../../store/order/provider";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ACTION_ORDER } from "../../../store/order";
import Notification from '../../../utils/configToastify'

import { UserContext } from "../../../store/user";
import { addOrder } from "../../../services/order_service";
function CheckoutConfirm() {
    document.title = "Check out";
    const [form] = Form.useForm()
    const [subTotal, setSubtotal] = useState(0)
    const [products, setProducts] = useState([])

    const [orderId, setOrderId] = useState('')
    const user = useContext(UserContext)
    const cart = useContext(CartContext)
    const order = useContext(OrderContext)

    const [options, setOptions] = useState([])
    useEffect(() => {
        form.setFieldValue("firstNameReceiver", order?.state?.currentOrder?.firstNameReceiver)
        form.setFieldValue("lastNameReceiver", order?.state?.currentOrder?.lastNameReceiver)
        form.setFieldValue("emailReceiver", order?.state?.currentOrder?.emailReceiver)
        form.setFieldValue("phoneReceiver", order?.state?.currentOrder?.phoneReceiver)
        form.setFieldValue("addressReceiver", order?.state?.currentOrder?.addressReceiver)
        form.setFieldValue("countryReceiver", order?.state?.currentOrder?.countryReceiver)
        form.setFieldValue("note", order?.state?.currentOrder?.note)
        form.setFieldValue("paymentMethod", order?.state?.currentOrder?.paymentMethod)
        form.setFieldValue("shippingMethod", order?.state?.currentOrder?.shippingMethod)
    }, [order, form])
    const navigate = useNavigate();
    const navigateCheckout = () => {
        navigate('/client/checkout')
    }

    const { data, isError } = useQuery({
        queryKey: ['countries'],
        queryFn: () => axios.get('https://countriesnow.space/api/v0.1/countries/capital'),
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData
    })

    const isVnpay = useMutation({
        mutationKey: ['create_bill', orderId],
        mutationFn: (data) => createBill(data),
        onSuccess: (res) => window.location.assign(res?.data?.url),
        onError: () => Notification({ message: `Online banking is interupted due to system error!!`, type: "error" })
    })
    const notVnpay = useMutation({
        mutationKey: ['create_order'],
        mutationFn: (data) => addOrder(data),
        onSuccess: (res) => setOrderId(res?.data?.order?._id),
        onError: () => Notification({ message: `Create order not successfully`, type: "error" })

    })

    const navigateEnd = async () => {
        if (order?.state?.currentOrder?.paymentMethod === 'vnpay') {
            notVnpay.mutate({
                ...order?.state?.currentOrder,
                products: cart?.state?.currentCart.map(item => ({
                    productId: item?.id,
                    subPrice: item?.quantityBuy * (item?.pricePromotion ? item?.price * (1 - parseFloat(item?.pricePromotion) / 100) : item?.price),
                    quantity: item?.quantityBuy
                })),
                userId: user?.state?.currentUser?.user_id,
                tax: (subTotal * 0.09).toFixed(2)
            }, {
                onSuccess: (res) => isVnpay.mutate({ amount: (subTotal * 1.09 * 25_410).toFixed(2), language: 'vn', bankCode: "VNBANK", orderId: res?.data?.order?._id, note: res?.data?.order?.note }),
            })
        }
        else {
            notVnpay.mutate({
                ...order?.state?.currentOrder,
                products: cart?.state?.currentCart.map(item => ({
                    productId: item?.id,
                    subPrice: item?.quantityBuy * (item?.pricePromotion ? item?.price * (1 - parseFloat(item?.pricePromotion) / 100) : item?.price),
                    quantity: item?.quantityBuy
                })),
                userId: user?.state?.currentUser?.user_id,
                tax: (subTotal * 0.09).toFixed(2)
            }, {
                onSuccess: () => {
                    Notification({ message: `Create order successfully`, type: "success" })
                    navigate('/client/checkout/success')
                }
            }
            )
        }
    }

    useEffect(() => {
        setProducts(cart?.state?.currentCart?.map(item => ({
            name: item?.name,
            price: item?.pricePromotion ? item?.price * (1 - parseFloat(item?.pricePromotion) / 100) : item?.price,
            quantity: item?.quantityBuy
        })))

        return () => {
            setProducts([])
        }
    }, [setProducts, cart])

    useEffect(() => {
        if (products) {
            const total = products.reduce((acc, product) => acc + product?.price * product?.quantity, 0);
            setSubtotal(total)
        }

        return () => {
            setSubtotal(0)
        }
    }, [products])


    useEffect(() => {
        if (isError) return
        const rawData = data?.data?.data
        setOptions(rawData?.map(item => ({ value: item?.name, label: item?.name })))
    }, [isError, data])

    const cartColumns = [

        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
            render: (text, row) => <p>${Number(row.price * row.quantity).toLocaleString('en-US')}</p>
        },

    ];

    const items = [
        {
            key: '1',
            label: 'Subtotal',
            children: <Typography.Text>{subTotal}$</Typography.Text>,
            span: 3
        },
        {
            key: '2',
            label: 'Tax',
            children: <Typography.Text>${(subTotal * 0.09).toFixed(2)}</Typography.Text>,
            span: 3

        },
        {
            key: '3',
            label: 'Total',
            children: <Typography.Text>${(subTotal * 1.09).toFixed(2)}</Typography.Text>,
            span: 3

        }
    ];



    const formItemLayout = {
        labelCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 6,
            },
        },
        wrapperCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 14,
            },
        },
    };
    const onFinish = () => {
        order?.dispatch({ type: ACTION_ORDER.REMOVE_ORDER })
        cart?.dispatch({ type: ACTION_CART.REMOVE_CART })
    }


    useEffect(() => {
        document.title = "Checkout confirm"
    }, [])
    return (
        <Flex className="checkout_confirm_page container" vertical>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <NavLink to={'/client'}>HOME</NavLink>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <NavLink to={'/client/checkout/confirm'}>CHECKOUT CONFIRM</NavLink>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Flex>
                <Form
                    form={form}
                    {...formItemLayout}
                    style={{
                        width: "100%"
                    }}
                    onFinish={onFinish}
                >
                    <Flex gap='large'>
                        <Flex vertical style={{ width: "50%" }}>
                            <Form.Item
                                label="First name"
                                name="firstNameReceiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    }, {
                                        min: 3,
                                        message: "At least 3 characters"
                                    }
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Last name"
                                name="lastNameReceiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    }, {
                                        min: 3,
                                        message: "At least 3 characters"
                                    }
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                name="emailReceiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                    {
                                        min: 6,
                                        message: "At least 6 characters"
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please input an email address'
                                    }
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Phone number"
                                name="phoneReceiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                    {
                                        min: 10,
                                        message: 'Please input at least 10 numbers!',

                                    },
                                    {
                                        max: 13,
                                        message: 'Please input no more 13 numbers!',

                                    }
                                ]}
                            >
                                <Input
                                    style={{
                                        width: '100%',
                                    }}

                                    disabled
                                />
                            </Form.Item>

                            <Form.Item
                                label="Address"
                                name="addressReceiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    }, {
                                        min: 3,
                                        message: "At least 3 characters"
                                    }
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Country"
                                name="countryReceiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Select options={options} disabled />
                            </Form.Item>
                            <Form.Item
                                label="Note"
                                name="note"
                            >
                                <Input.TextArea disabled />
                            </Form.Item>
                            <Form.Item
                                label="Payment method"
                                name="paymentMethod"
                            >
                                <Radio.Group disabled>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'cod'} className="radio"><MoneyCollectOutlined /><Typography.Text>COD</Typography.Text></Radio>
                                        <Radio value={'vnpay'} className="radio"><CreditCardOutlined /><Typography.Text>VNPAY</Typography.Text></Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item
                                label="Shipping method"
                                name="shippingMethod"
                            >
                                <Radio.Group disabled>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'free'} className="radio"><DisconnectOutlined /><Typography.Text>Free</Typography.Text></Radio>
                                        <Radio value={'standard'} className="radio"><TruckOutlined /><Typography.Text>Standard</Typography.Text></Radio>
                                        <Radio value={'express'} className="radio"><SendOutlined /><Typography.Text>Express</Typography.Text></Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Flex>
                        <Space direction="vertical" style={{ width: "50%" }}>
                            <Table
                                columns={cartColumns}
                                dataSource={products}
                                pagination={{
                                    hideOnSinglePage: true, pageSize: 3, total: cart?.state?.currentCart?.length, defaultCurrent: 1, showSizeChanger: false
                                }}
                            />
                            <Descriptions bordered items={items} className="sumary" />
                            <Flex gap="large" justify="center" className="wrap_btn">
                                <Button type="primary" htmlType="button" onClick={navigateCheckout}>
                                    Back to checkout
                                </Button>
                                <Button type="primary" htmlType="submit" onClick={navigateEnd}>
                                    Place order
                                </Button>
                            </Flex>
                        </Space>
                    </Flex>
                </Form>
            </Flex >

        </Flex >
    );
}

export default CheckoutConfirm; 