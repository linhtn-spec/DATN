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
    document.title = "Thanh toán";
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
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (text, row) => (
                <Flex vertical>
                    <Typography.Text className="promotion" style={{ whiteSpace: 'nowrap' }}>
                        {Number(text).toLocaleString('vi-VN')}&nbsp;₫
                    </Typography.Text>
                    {row.pricePromotion > 0 && (
                        <Typography.Text className="price" style={{ whiteSpace: 'nowrap' }}>
                            {Number(row.originalPrice).toLocaleString('vi-VN')}&nbsp;₫
                        </Typography.Text>
                    )}
                </Flex>
            )
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
            render: (text, row) => (
                <Typography.Text style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {(row.price * row.quantity).toLocaleString('vi-VN')}&nbsp;₫
                </Typography.Text>
            )
        },

    ];

    const items = [
        {
            key: '1',
            label: 'Tạm tính',
            children: <Typography.Text style={{ whiteSpace: 'nowrap' }}>{subTotal.toLocaleString('vi-VN')}&nbsp;₫</Typography.Text>,
            span: 3
        },
        {
            key: '2',
            label: 'Thuế (9%)',
            children: <Typography.Text style={{ whiteSpace: 'nowrap' }}>{(subTotal * 0.09).toLocaleString('vi-VN')}&nbsp;₫</Typography.Text>,
            span: 3

        },
        {
            key: '3',
            label: 'Tổng cộng',
            children: <Typography.Text style={{ whiteSpace: 'nowrap' }}>{(subTotal * 1.09).toLocaleString('vi-VN')}&nbsp;₫</Typography.Text>,
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
        document.title = "Thanh toán"
    }, [])
    return (
        <Flex className="checkout_page container" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/checkout'}>THANH TOÁN</NavLink>,
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
                                label="Họ"
                                name="firstNameReceiver"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập họ!',
                                    }, {
                                        min: 2,
                                        message: "Tối thiểu 2 ký tự"
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Tên"
                                name="lastNameReceiver"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên!',
                                    }, {
                                        min: 2,
                                        message: "Tối thiểu 2 ký tự"
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
                                        message: 'Vui lòng nhập email!',
                                    },
                                    {
                                        min: 6,
                                        message: "Tối thiểu 6 ký tự"
                                    },
                                    {
                                        type: 'email',
                                        message: 'Vui lòng nhập đúng định dạng email'
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Số điện thoại"
                                name="phoneReceiver"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số điện thoại!',

                                    },
                                    {
                                        min: 10,
                                        message: 'Vui lòng nhập ít nhất 10 số!',

                                    },
                                    {
                                        max: 13,
                                        message: 'Vui lòng nhập không quá 13 số!',

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
                                label="Địa chỉ"
                                name="addressReceiver"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập địa chỉ!',
                                    }, {
                                        min: 3,
                                        message: "Tối thiểu 3 ký tự"
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Quốc gia"
                                name="countryReceiver"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn quốc gia!',
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
                                label="Ghi chú"
                                name="note"
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item
                                label="Phương thức thanh toán"
                                name="paymentMethod"
                            >
                                <Radio.Group>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'cod'} className="radio"><MoneyCollectOutlined /><Typography.Text>COD (Thanh toán khi nhận hàng)</Typography.Text></Radio>
                                        <Radio value={'vnpay'} className="radio"><CreditCardOutlined /><Typography.Text>VNPAY</Typography.Text></Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item
                                label="Phương thức vận chuyển"
                                name="shippingMethod"
                            >
                                <Radio.Group>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'free'} className="radio"><DisconnectOutlined /><Typography.Text>Miễn phí</Typography.Text></Radio>
                                        <Radio value={'standard'} className="radio"><TruckOutlined /><Typography.Text>Tiêu chuẩn</Typography.Text></Radio>
                                        <Radio value={'express'} className="radio"><SendOutlined /><Typography.Text>Hỏa tốc</Typography.Text></Radio>
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
                                    Quay lại giỏ hàng
                                </Button>
                                <Button type="primary" htmlType="submit" >
                                    Thanh toán
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