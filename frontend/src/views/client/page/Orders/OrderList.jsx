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
            date: dayjs(item?.createdAt).format('DD/MM/YYYY HH:mm'),
            total: item?.total
        })))
        return () => {
            setOrders([])
            setTotal(1)
        }
    }, [isSuccess, data])

    const columns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Tên người nhận',
            dataIndex: 'receiverName',
            key: 'receiverName',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Tổng cộng',
            dataIndex: 'total',
            key: 'total',
            align: 'right',
            render: (text) => <Typography.Text>{text?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (value, row) => <Select options={orderOptions} value={value} disabled={value === 'done'} onChange={(e) => mutate({
                id: row?.id,
                orderStatus: e
            })} style={{ width: "100%" }} />
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => navigate(`/client/user/orders/${record.id}`)}>
                    Xem chi tiết
                </Button>
            ),
            align: "center"
        },
    ];

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <Flex className="container order_list_page" vertical gap={24} style={{ padding: '40px 0' }}>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: 'LỊCH SỬ ĐƠN HÀNG',
                    },
                ]}
            />
            <Typography.Title level={2}>Đơn hàng của bạn</Typography.Title>
            <Card>
                <Table
                    bordered
                    columns={columns}
                    dataSource={orders}
                    loading={isFetching}
                    pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, onChange: setPage, showSizeChanger: false }}
                    locale={{ emptyText: <Empty description="Bạn chưa có đơn hàng nào" /> }}
                />
            </Card>
        </Flex>
    )
}
