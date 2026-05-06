import { CreditCardOutlined, DisconnectOutlined, MoneyCollectOutlined, SendOutlined, TruckOutlined } from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Descriptions, Flex, Form, Input, Radio, Select, Space, Table, Typography } from "antd";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createBill } from "../../../services/payment_service";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { ACTION_ORDER } from "../../../store/order";
import { OrderContext } from "../../../store/order/provider";
import Notification from '../../../utils/configToastify';
import "../style/checkout_confirm.css";

import { addOrder } from "../../../services/order_service";
import { listShippingConfig } from "../../../services/shipping_service";
import { UserContext } from "../../../store/user";
function CheckoutConfirm() {
    document.title = "Xác nhận đặt hàng";
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
        onError: () => Notification({ message: `Thanh toán trực tuyến bị gián đoạn do lỗi hệ thống!`, type: "error" })
    })
    const notVnpay = useMutation({
        mutationKey: ['create_order'],
        mutationFn: (data) => addOrder(data),
        onSuccess: (res) => setOrderId(res?.data?.order?._id),
        onError: () => Notification({ message: `Tạo đơn hàng thất bại, vui lòng thử lại!`, type: "error" })

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
                onSuccess: (res) => isVnpay.mutate({ amount: ((subTotal * 1.09 + currentShippingFee) * 25_410).toFixed(2), language: 'vn', bankCode: "VNBANK", orderId: res?.data?.order?._id, note: res?.data?.order?.note }),
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
                    Notification({ message: `Đặt hàng thành công!`, type: "success" })
                    navigate('/client/checkout/success')
                }
            }
            )
        }
    }

    const [shippingFees, setShippingFees] = useState({
        free: 0,
        standard: 30000,
        express: 50000
    });

    useEffect(() => {
        const fetchFees = async () => {
            const res = await listShippingConfig();
            if (res.status === 200) {
                const fees = {};
                res.data.forEach(item => {
                    fees[item.method] = item.fee;
                });
                setShippingFees(fees);
            }
        };
        fetchFees();
    }, []);

    const currentShippingFee = shippingFees[order?.state?.currentOrder?.shippingMethod] || 0;

    useEffect(() => {
        setProducts(cart?.state?.currentCart?.map(item => ({
            id: item?.id,
            name: item?.name,
            originalPrice: item?.price,
            pricePromotion: item?.pricePromotion,
            price: item?.pricePromotion ? item?.price * (1 - parseFloat(item?.pricePromotion) / 100) : item?.price,
            quantity: item?.quantityBuy,
            unit: item?.unit
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
            title: 'Sản phẩm',
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
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            align: 'center',
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
            key: '4',
            label: 'Phí vận chuyển',
            children: <Typography.Text style={{ whiteSpace: 'nowrap' }}>{currentShippingFee.toLocaleString('vi-VN')}&nbsp;₫</Typography.Text>,
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
            children: <Typography.Text style={{ whiteSpace: 'nowrap' }}>{(subTotal * 1.09 + currentShippingFee).toLocaleString('vi-VN')}&nbsp;₫</Typography.Text>,
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
        document.title = "Xác nhận đặt hàng"
    }, [])
    return (
        <Flex className="checkout_confirm_page container" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/checkout/confirm'}>XÁC NHẬN ĐẶT HÀNG</NavLink>,
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
                    <Flex gap='large'>
                        <Flex vertical style={{ width: "50%" }}>
                            <Form.Item
                                label="Họ"
                                name="firstNameReceiver"
                                rules={[{ required: true, message: 'Vui lòng nhập!' }]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Tên"
                                name="lastNameReceiver"
                                rules={[{ required: true, message: 'Vui lòng nhập!' }]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                name="emailReceiver"
                                rules={[{ required: true, message: 'Vui lòng nhập email hợp lệ!' }]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Số điện thoại"
                                name="phoneReceiver"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input style={{ width: '100%' }} disabled />
                            </Form.Item>

                            <Form.Item label="Địa chỉ" name="addressReceiver" rules={[{ required: true, message: 'Vui lòng nhập!' }]}>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Quốc gia" name="countryReceiver" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                                <Select options={options} disabled />
                            </Form.Item>
                            <Form.Item label="Ghi chú" name="note">
                                <Input.TextArea disabled />
                            </Form.Item>
                            <Form.Item label="Phương thức thanh toán" name="paymentMethod">
                                <Radio.Group disabled>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'cod'} className="radio"><MoneyCollectOutlined /><Typography.Text>Tiền mặt (COD)</Typography.Text></Radio>
                                        <Radio value={'vnpay'} className="radio"><CreditCardOutlined /><Typography.Text>VNPAY</Typography.Text></Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="Phương thức vận chuyển" name="shippingMethod">
                                <Radio.Group disabled>
                                    <Space direction='horizontal' wrap={true}>
                                        <Radio value={'free'} className="radio"><DisconnectOutlined /><Typography.Text>Miễn phí</Typography.Text></Radio>
                                        <Radio value={'standard'} className="radio"><TruckOutlined /><Typography.Text>Tiêu chuẩn</Typography.Text></Radio>
                                        <Radio value={'express'} className="radio"><SendOutlined /><Typography.Text>Nhanh</Typography.Text></Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Flex>
                        <Space direction="vertical" style={{ width: "50%" }}>
                            <Table
                                rowKey="id"
                                columns={cartColumns}
                                dataSource={products}
                                pagination={{
                                    hideOnSinglePage: true, pageSize: 3, total: cart?.state?.currentCart?.length, defaultCurrent: 1, showSizeChanger: false
                                }}
                            />
                            <Descriptions bordered items={items} className="sumary" />
                            <Flex gap="large" justify="center" className="wrap_btn">
                                <Button type="primary" htmlType="button" onClick={navigateCheckout}>
                                    Quay lại
                                </Button>
                                <Button type="primary" htmlType="submit" onClick={navigateEnd}>
                                    Đặt hàng
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