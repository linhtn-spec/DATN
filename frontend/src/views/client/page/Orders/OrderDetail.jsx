import { useMutation, useQuery } from '@tanstack/react-query'
import { Breadcrumb, Card, Descriptions, Flex, Image, Select, Table, Typography } from 'antd'
import Meta from 'antd/es/card/Meta'
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
    const { isSuccess, data } = useQuery({
        queryKey: ['detail_order_client', order_id],
        queryFn: () => detailOrder(order_id),
        enabled: !!order_id
    })
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(1)
    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!", type: "success" })
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
            total: rawData?.total,
            tax: rawData?.tax,
            phone: rawData?.phoneReceiver,
            date: rawData?.createdAt,
            address: rawData?.addressReceiver,
            country: rawData?.countryReceiver,
            email: rawData?.emailReceiver
        })

        setProducts(rawData?.products?.map((item, index) => ({
            no: index + 1,
            image: item?.productId?.images?.[0],
            name: item?.productId?.name,
            quantity: item?.quantity,
            price: item?.productId?.price,
            subtotal: item?.subPrice
        })))

        setTotal(rawData?.products?.length)
        return () => {
            setProducts([])
            setInfo({})
            setTotal(1)
        }

    }, [isSuccess, data, setProducts])

    // Order status options handled by orderOptions from OrderList or re-defined here
    const statusOptions = [
        { value: 'new', label: 'Mới' },
        { value: 'processing', label: 'Đang xử lý' },
        { value: 'hold', label: 'Tạm giữ' },
        { value: 'canceled', label: 'Đã hủy' },
        { value: 'done', label: 'Hoàn thành' },
    ];

    const items = [
        {
            key: '1',
            label: 'Tạm tính',
            children: <Typography.Text>{(info?.total - info?.tax)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>,
            span: 3
        },
        {
            key: '2',
            label: 'Thuế (VAT)',
            children: <Typography.Text>{info?.tax?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>,
            span: 3
        },
        {
            key: '3',
            label: 'Tổng cộng',
            children: <Typography.Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>{info?.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>,
            span: 3
        }
    ];

    const cartColumns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
            width: "80px",
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, row) => (
                <Flex align='center' gap={20}>
                    <Image src={row.image} width={60} height={60} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                    <Typography.Text strong>{text}</Typography.Text>
                </Flex>
            )
        },
        {
            title: 'Giá',
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
            render: (text) => <Typography.Text strong>{text?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
        },
    ];

    useEffect(() => {
        document.title = "Chi tiết đơn hàng"
        window.scrollTo(0, 0)
    }, [])

    return (
        <Flex className="container detail_order_page" vertical gap={24} style={{ padding: '40px 0' }}>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={`/client/user/orders`}>LỊCH SỬ ĐƠN HÀNG</NavLink>,
                    },
                    {
                        title: 'CHI TIẾT ĐƠN HÀNG',
                    },
                ]}
            />
            
            <Card title={<Typography.Title level={3} style={{ margin: 0 }}>Chi tiết đơn hàng #{order_id?.slice(-8).toUpperCase()}</Typography.Title>}>
                <Flex vertical gap={32}>
                    <Descriptions title="Thông tin người nhận" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                        <Descriptions.Item label="Họ tên">{info?.receiverName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{info?.phone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>{info?.address}, {info?.country}</Descriptions.Item>
                        <Descriptions.Item label="Email">{info?.email}</Descriptions.Item>
                        <Descriptions.Item label="Ngày đặt">{dayjs(info?.date).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Select
                                disabled={info?.orderStatus === 'done'}
                                options={statusOptions} 
                                value={info?.orderStatus} 
                                onChange={(e) => mutate({
                                    id: order_id,
                                    orderStatus: e
                                })} 
                                style={{ width: "100%" }} 
                            />
                        </Descriptions.Item>
                    </Descriptions>

                    <Table
                        bordered
                        columns={cartColumns}
                        dataSource={products}
                        pagination={false}
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={4} align='right'>
                                        <Typography.Text strong>Tổng thanh toán:</Typography.Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>
                                        <Typography.Text strong type="danger">
                                            {info?.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </Typography.Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </Flex>
            </Card>
        </Flex>
    )
}
