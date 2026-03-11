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
            Notification({ message: "Thanks for using our service", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['order_list_user', 'detail_order_client'] })
        },
        onError: () => Notification({ message: "Something's wrong", type: "error" })
    })

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data
        console.log(rawData);
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
            image: item?.productId?.images,
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

    const options =
        [
            {
                value: 'new',
                label: 'New',
                disabled: true,
            },
            {
                value: 'processing',
                label: 'Processing',
                disabled: true,
            },
            {
                value: 'hold',
                label: "Hold",
                disabled: true,
            },
            {
                value: 'canceled',
                label: 'Canceled',
                disabled: true,
            },
            {
                value: 'done',
                label: "Done",
            },
        ]

    const items = [
        {
            key: '1',
            label: 'Subtotal',
            children: <Typography.Text>{info?.total - info?.tax}$</Typography.Text>,
            span: 3
        },
        {
            key: '2',
            label: 'Tax',
            children: <Typography.Text>{info?.tax}$</Typography.Text>,
            span: 3

        },
        {
            key: '3',
            label: 'Total',
            children: <Typography.Text>{info?.total}$</Typography.Text>,
            span: 3

        }
    ];

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
        document.title = "Order detail"
    }, [])

    return (
        <Flex className="detail_order" vertical align="center">
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={`/client/user/orders/${order_id}`}>ORDER DETAIL</NavLink>,
                    },
                ]}
            />
            <Card>
                <Meta
                    title="Order information"
                    description={
                        <Flex gap={20}>
                            <Flex vertical>
                                <Flex align='center' gap={14}>
                                    <Typography.Title level={5}>Receiver name:</Typography.Title>
                                    <Typography.Text>{info?.receiverName}</Typography.Text>
                                </Flex>
                                <Flex align='center' gap={14}>
                                    <Typography.Title level={5}>Address:</Typography.Title>
                                    <Typography.Text>{info?.address}</Typography.Text>
                                </Flex>
                                <Flex align='center' gap={14}>
                                    <Typography.Title level={5}>Country:</Typography.Title>
                                    <Typography.Text>{info?.country}</Typography.Text>
                                </Flex>
                                <Flex align='center' gap={14}>
                                    <Typography.Title level={5}>Email:</Typography.Title>
                                    <Typography.Text>{info?.email}</Typography.Text>
                                </Flex>
                                <Flex align='center' gap={14}>
                                    <Typography.Title level={5}>Phone:</Typography.Title>
                                    <Typography.Text>{info?.phone}</Typography.Text>
                                </Flex>
                                <Flex align='center' gap={14}>
                                    <Typography.Title level={5}>Date:</Typography.Title>
                                    <Typography.Text>{Date(info?.date)}</Typography.Text>
                                </Flex>
                            </Flex>
                            <Flex gap={14}>
                                <Typography.Title level={5} style={{ width: "100%" }}>Order status:</Typography.Title>
                                <Select
                                    disabled={info?.orderStatus === 'done'}
                                    options={options} value={info?.orderStatus} onChange={(e) => mutate({
                                        id: order_id,
                                        orderStatus: e
                                    })} style={{ width: "100%" }} />
                            </Flex>
                        </Flex>
                    }
                />
                <Table
                    bordered
                    columns={cartColumns}
                    dataSource={products}
                    pagination={{ hideOnSinglePage: true, pageSize: 3, total: total, defaultCurrent: page, onChange: setPage, showSizeChanger: false }}

                />
                <Descriptions bordered items={items} className="sumary" labelStyle={{ fontWeight: 600, color: "black" }} />

            </Card>

        </Flex>
    )
}
