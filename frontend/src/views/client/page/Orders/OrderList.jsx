import { EyeOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Select, Table, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { queryClient } from "../../../../main";
import { editOrder, orderByUser } from "../../../../services/order_service";
import { UserContext } from "../../../../store/user";
import Notification from "../../../../utils/configToastify";
import './OrderList.css';
export const OrderList = () => {
    const [orders, setOrders] = useState([])
    const [total, setTotal] = useState(1)
    const [page, setPage] = useState(1)
    const user = useContext(UserContext)
    const userId = user?.state?.currentUser?.user_id
    const navigate = useNavigate()

    const onDetail = (id) => {
        navigate(`/client/user/orders/${id}`)
    }

    const { isSuccess, data } = useQuery({
        queryKey: ['order_list_user', userId, page],
        queryFn: () => orderByUser(userId, page),
    })

    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Thanks for using our service", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['order_list_user'] })
        },
        onError: () => Notification({ message: "Something's wrong", type: "error" })
    })

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.docs
        setOrders(rawData?.map((item, index) => ({
            no: index + 1,
            id: item?._id,
            receiverName: item?.firstNameReceiver + " " + item?.lastNameReceiver,
            orderStatus: item?.orderStatus,
            date: item?.createdAt,
            total: item?.total
        })))
        return () => {
            setOrders([])
            setTotal(1)
        }
    }, [isSuccess, data])


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

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            hidden: true
        },
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Receiver name',
            dataIndex: 'receiverName',
            key: 'receiverName',

        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <Typography.Text>{Date(text)}</Typography.Text>
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: "150px",
            align: 'right',
            render: (text) => <Typography.Text>{text}$</Typography.Text>

        },
        {
            title: 'Order status',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            width: "250px",
            render: (value, row) => <Select options={options} value={value} disabled={value === 'done'} onChange={(e) => mutate({
                id: row?.id,
                orderStatus: e
            })} style={{ width: "100%" }} />
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (value, row) => <Flex justify='center'>
                <Button icon={<EyeOutlined />} onClick={() => onDetail(row.id)} />
            </Flex>,
            width: "80px",
            align: "center"
        },
    ];
    useEffect(() => {
        document.title = "List order"
    }, [])

    return (
        <Flex className="order_list" vertical align="center">
            <Breadcrumb>
                <Breadcrumb.Item>
                    <NavLink to={'/client'}>HOME</NavLink>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <NavLink to={`/client/user/orders`}>ORDERS</NavLink>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Table
                bordered
                columns={columns}
                dataSource={orders}
                pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, onChange: setPage, showSizeChanger: false }}

            />
        </Flex>
    )
}
