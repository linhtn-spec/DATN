import { Breadcrumb, Button, Descriptions, Flex, Form, Input, Radio, Select, Space, Table, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/checkout.css";

import { CreditCardOutlined, DisconnectOutlined, MoneyCollectOutlined, SendOutlined, TruckOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CartContext } from "../../../store/cart";
import { ACTION_ORDER } from "../../../store/order";
import { OrderContext } from "../../../store/order/provider";
function Checkout() {
    document.title = "Checkout";
    const [form] = Form.useForm()

    const cart = useContext(CartContext)
    const order = useContext(OrderContext)

    const [subTotal, setSubtotal] = useState(0)
    const [options, setOptions] = useState([])
    const [products, setProducts] = useState([])

    const { data, isError } = useQuery({
        queryKey: ['countries'],
        queryFn: () => axios.get('https://countriesnow.space/api/v0.1/countries/capital'),
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData
    })

    useEffect(() => {
        if (isError) return
        const rawData = data?.data?.data
        setOptions(rawData?.map(item => ({ value: item?.name, label: item?.name })))
    }, [isError, data])

    useEffect(() => {
        form.setFieldValue("paymentMethod", "cod")
        form.setFieldValue("shippingMethod", "free")
    }, [form])
    useEffect(() => {
        if (order?.state?.currentOrder) {
            form.setFieldValue("firstNameReceiver", order?.state?.currentOrder?.firstNameReceiver)
            form.setFieldValue("lastNameReceiver", order?.state?.currentOrder?.lastNameReceiver)
            form.setFieldValue("emailReceiver", order?.state?.currentOrder?.emailReceiver)
            form.setFieldValue("phoneReceiver", order?.state?.currentOrder?.phoneReceiver)
            form.setFieldValue("addressReceiver", order?.state?.currentOrder?.addressReceiver)
            form.setFieldValue("countryReceiver", order?.state?.currentOrder?.countryReceiver)
            form.setFieldValue("note", order?.state?.currentOrder?.note)
            form.setFieldValue("paymentMethod", order?.state?.currentOrder?.paymentMethod)
            form.setFieldValue("shippingMethod", order?.state?.currentOrder?.shippingMethod)
        }
    }, [order, form])

    const navigateConfirm = () => {
        navigate('/client/checkout/confirm')
    }
    const navigateCart = () => {
        navigate('/client/cart')
    }

    const navigate = useNavigate();
    useEffect(() => {
        setProducts(cart?.state?.currentCart?.map(item => ({
            id: item?.id,
            name: item?.name,
            originalPrice: item?.price,
            pricePromotion: item?.pricePromotion,
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
            render: (text, row) => (
                <Flex vertical>
                    <Typography.Text className="promotion">
                        {Number(text).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        })}
                    </Typography.Text>
                    {row.pricePromotion > 0 && (
                        <Typography.Text className="price">
                            {Number(row.originalPrice).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            })}
                        </Typography.Text>
                    )}
                </Flex>
            )
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
            render: (text, row) => (
                <Typography.Text style={{ fontWeight: 600 }}>
                    {(row.price * row.quantity).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    })}
                </Typography.Text>
            )
        },

    ];

    const items = [
        {
            key: '1',
            label: 'Subtotal',
            children: <Typography.Text>{subTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Typography.Text>,
            span: 3
        },
        {
            key: '2',
            label: 'Tax',
            children: <Typography.Text>{(subTotal * 0.09).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Typography.Text>,
            span: 3

        },
        {
            key: '3',
            label: 'Total',
            children: <Typography.Text>{(subTotal * 1.09).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Typography.Text>,
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
    const onFinish = (value) => {
        order?.dispatch({ type: ACTION_ORDER.ADD_ORDER, payload: value })
        navigateConfirm()
    }
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        document.title = "Checkout"
    }, [])
    return (
        <Flex className="checkout_page container" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/checkout'}>CHECKOUT</NavLink>,
                    },
                ]}
            />
            <Flex>
                <Form
                    form={form}
                    {...formItemLayout}
                    style={{
                        width: "100%"
                    }}
                    onFinish={onFinish}
                >
                    <Flex gap='large' wrap='wrap'>
                        <Flex vertical style={{ flex: '1 1 300px', width: "100%" }}>
                            <Form.Item
                                label="First name"
                                name="firstNameReceiver"
                                hasFeedback
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
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Last name"
                                name="lastNameReceiver"
                                hasFeedback
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
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                name="emailReceiver"
                                hasFeedback
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
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Phone number"
                                name="phoneReceiver"
                                hasFeedback
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

                                />
                            </Form.Item>

                            <Form.Item
                                label="Address"
                                name="addressReceiver"
                                hasFeedback
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
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Country"
                                name="countryReceiver"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Select
                                    virtual={false}

                                    showSearch
                                    options={options}
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label="Note"
                                name="note"
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item
                                label="Payment method"
                                name="paymentMethod"
                            >
                                <Radio.Group>
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
                                <Radio.Group>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'free'} className="radio"><DisconnectOutlined /><Typography.Text>Free</Typography.Text></Radio>
                                        <Radio value={'standard'} className="radio"><TruckOutlined /><Typography.Text>Standard</Typography.Text></Radio>
                                        <Radio value={'express'} className="radio"><SendOutlined /><Typography.Text>Express</Typography.Text></Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Flex>
                        <Space direction="vertical" style={{ flex: '1 1 300px', width: "100%" }}>
                            <Table
                                rowKey="id"
                                columns={cartColumns}
                                dataSource={products}
                                scroll={{ x: 'max-content' }}
                                pagination={{
                                    hideOnSinglePage: true, pageSize: 3, total: cart?.state?.currentCart?.length, defaultCurrent: 1, showSizeChanger: false
                                }}
                            />
                            <Descriptions bordered items={items} className="sumary" />
                            <Flex gap="large" justify="center" className="wrap_btn">
                                <Button type="primary" htmlType="button" onClick={navigateCart}>
                                    Back to cart
                                </Button>
                                <Button type="primary" htmlType="submit" >
                                    Checkout
                                </Button>
                            </Flex>
                        </Space>
                    </Flex>
                </Form>
            </Flex >

        </Flex >
    );
}


export default Checkout; 