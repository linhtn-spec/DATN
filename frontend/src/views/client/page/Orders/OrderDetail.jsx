import { useMutation, useQuery } from '@tanstack/react-query'
import { Breadcrumb, Button, Card, Col, Divider, Flex, Image, Popconfirm, Row, Steps, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { queryClient } from '../../../../main'
import { detailOrder, editOrder } from '../../../../services/order_service'
import Notification from '../../../../utils/configToastify'
import './OrderDetail.css'


export const OrderDetail = () => {
    const { order_id } = useParams()
    const [products, setProducts] = useState([])
    const [info, setInfo] = useState({})
    const { isSuccess, data, isFetching } = useQuery({
        queryKey: ['detail_order_client', order_id],
        queryFn: () => detailOrder(order_id),
        enabled: !!order_id
    })
    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Cảm ơn bạn đã thao tác", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['order_list_user', 'detail_order_client'] })
        },
        onError: () => Notification({ message: "Đã có lỗi xảy ra", type: "error" })
    })

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data
        setInfo({
            receiverName: rawData?.firstNameReceiver + " " + rawData?.lastNameReceiver,
            orderStatus: rawData?.orderStatus,
            paymentStatus: rawData?.paymentStatus,
            total: rawData?.total,
            tax: rawData?.tax,
            shippingCost: rawData?.shippingCost || 0,
            subTotal: (rawData?.total || 0) - (rawData?.tax || 0) - (rawData?.shippingCost || 0),
            phone: rawData?.phoneReceiver,
            date: rawData?.createdAt,
            address: rawData?.addressReceiver,
            country: rawData?.countryReceiver,
            email: rawData?.emailReceiver
        })

        setProducts(rawData?.products?.map((item, index) => ({
            no: index + 1,
            id: item?._id,
            image: item?.productId?.images?.[0],
            name: item?.productId?.name,
            quantity: item?.quantity,
            price: item?.productId?.price,
            subtotal: item?.subPrice
        })))

        return () => {
            setProducts([])
            setInfo({})
        }

    }, [isSuccess, data, setProducts])

    // Convert orderStatus to Steps current indx
    const getStepCurrent = (status) => {
        if (status === 'canceled') return 3; // Make it jump to end with error
        const map = {
            'new': 0,
            'processing': 1,
            'sending': 2,
            'done': 3
        };
        return map[status] !== undefined ? map[status] : 1;
    }

    const cartColumns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
            width: "80px",
            align: 'center'
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, row) => (
                <Flex align='center' gap={16}>
                    <Image src={row.image} width={64} height={64} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0f0f0' }} />
                    <Typography.Text strong>{text}</Typography.Text>
                </Flex>
            )
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (text) => <Typography.Text>{text?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center'
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            align: 'right',
            render: (text) => <Typography.Text strong>{text?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
        },
    ];

    useEffect(() => {
        document.title = "Chi tiết đơn hàng"
        window.scrollTo(0, 0)
    }, [])

    return (
        <>
            <Flex className='category_page' vertical>
                <Breadcrumb
                    className="custom-breadcrumb"
                    items={[
                        { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                        { title: <NavLink to={`/client/user/orders`}>LỊCH SỬ ĐƠN HÀNG</NavLink> },
                        { title: 'CHI TIẾT ĐƠN HÀNG' },
                    ]}
                />

                <Card className="modern-order-card" bodyStyle={{ padding: '30px' }} bordered={false}>
                    <Flex justify="space-between" align="flex-start" style={{ marginBottom: '30px' }}>
                        <div>
                            <Typography.Title level={3} style={{ margin: 0, color: 'var(--primary-color)' }}>
                                Đơn hàng #{order_id?.slice(-8).toUpperCase()}
                            </Typography.Title>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>
                                Đặt lúc: {dayjs(info?.date).format('DD/MM/YYYY HH:mm')}
                            </span>
                        </div>

                        {info?.orderStatus === 'new' && (
                            <Popconfirm
                                title="Xác nhận hủy đơn"
                                description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
                                onConfirm={() => mutate({ id: order_id, orderStatus: 'canceled' })}
                                okText="Có"
                                cancelText="Không"
                                placement="bottomRight"
                                overlayStyle={{ width: "fit-content", minWidth: "250px" }}
                            >
                                <Button danger size="large" style={{ borderRadius: '6px', fontWeight: 500 }}>
                                    Hủy đơn hàng
                                </Button>
                            </Popconfirm>
                        )}
                    </Flex>

                    <div style={{ padding: '20px 40px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '40px' }}>
                        <Steps
                            current={getStepCurrent(info?.orderStatus)}
                            status={info?.orderStatus === 'canceled' ? 'error' : 'process'}
                            items={[
                                { title: 'Đã đặt hàng', description: 'Đơn hàng mới' },
                                { title: 'Đang xử lý', description: 'Chuẩn bị hàng' },
                                { title: 'Đang giao', description: 'Đang vận chuyển' },
                                { title: 'Hoàn thành', description: info?.orderStatus === 'canceled' ? 'Đã hủy' : 'Giao thành công' },
                            ]}
                        />
                    </div>

                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={12}>
                            <Card title="Địa chỉ giao hàng" bordered={false} className="info-card">
                                <Typography.Paragraph strong style={{ fontSize: '16px', marginBottom: '4px' }}>
                                    {info?.receiverName}
                                </Typography.Paragraph>
                                <Typography.Paragraph style={{ color: '#64748b', marginBottom: '4px' }}>
                                    Số điện thoại: {info?.phone}
                                </Typography.Paragraph>
                                <Typography.Paragraph style={{ color: '#64748b', marginBottom: '4px' }}>
                                    Email: {info?.email}
                                </Typography.Paragraph>
                                <Typography.Paragraph style={{ color: '#64748b', marginBottom: '0' }}>
                                    Địa chỉ: {info?.address}, {info?.country}
                                </Typography.Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="Phương thức thanh toán" bordered={false} className="info-card">
                                <Typography.Paragraph style={{ color: '#64748b', marginBottom: '8px' }}>
                                    Thanh toán: {info?.paymentStatus === 'paid' ? <Tag color="success">Đã thanh toán (VNPAY)</Tag> : <Tag color="warning">Thanh toán khi nhận hàng (COD)</Tag>}
                                </Typography.Paragraph>
                                <Typography.Paragraph style={{ color: '#64748b', marginBottom: '0' }}>
                                    Trạng thái đơn: <Tag color={info?.orderStatus === 'canceled' ? 'error' : 'blue'}>{info?.orderStatus === 'canceled' ? 'Đã hủy' : info?.orderStatus}</Tag>
                                </Typography.Paragraph>
                            </Card>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '40px 0' }} />

                    <Typography.Title level={4} style={{ marginBottom: '20px' }}>Danh sách sản phẩm</Typography.Title>
                    <Table
                        columns={cartColumns}
                        dataSource={products}
                        pagination={false}
                        rowKey="id"
                        className="product-list-table"
                    />

                    <Row justify="end" style={{ marginTop: '30px' }}>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
                                <Flex justify="space-between" style={{ marginBottom: '12px' }}>
                                    <Typography.Text style={{ color: '#64748b' }}>Tạm tính</Typography.Text>
                                    <Typography.Text strong>{info?.subTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between" style={{ marginBottom: '12px' }}>
                                    <Typography.Text style={{ color: '#64748b' }}>Thuế (VAT)</Typography.Text>
                                    <Typography.Text strong>{info?.tax?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
                                </Flex>
                                <Flex justify="space-between" style={{ marginBottom: '12px' }}>
                                    <Typography.Text style={{ color: '#64748b' }}>Phí vận chuyển</Typography.Text>
                                    <Typography.Text strong>{info?.shippingCost?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
                                </Flex>
                                <Divider style={{ margin: '12px 0' }} />
                                <Flex justify="space-between" align="center">
                                    <Typography.Text strong style={{ fontSize: '16px' }}>Tổng thanh toán</Typography.Text>
                                    <Typography.Text strong style={{ color: '#e53e3e', fontSize: '24px' }}>
                                        {info?.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </Typography.Text>
                                </Flex>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Flex>
        </>
    )
}

export default OrderDetail;
