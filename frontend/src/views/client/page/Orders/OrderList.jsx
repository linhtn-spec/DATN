import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Card, Empty, Flex, Popconfirm, Table, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
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

    const { isSuccess, data, isFetching } = useQuery({
        queryKey: ['order_list_user', userId, page],
        queryFn: () => orderByUser(userId, page),
    })

    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Thao tác thành công", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['order_list_user'] })
        },
        onError: () => Notification({ message: "Đã có lỗi xảy ra", type: "error" })
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
            total: item?.total,
            productsCount: item?.products?.length || 1
        })))
        return () => {
            setOrders([])
            setTotal(1)
        }
    }, [isSuccess, data])

    const getStatusTag = (status) => {
        switch (status) {
            case 'new': return <Tag color="blue">Mới</Tag>;
            case 'processing': return <Tag color="orange">Đang xử lý</Tag>;
            case 'hold': return <Tag color="default">Tạm giữ</Tag>;
            case 'canceled': return <Tag color="error">Đã hủy</Tag>;
            case 'done': return <Tag color="success">Hoàn thành</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Typography.Text type="secondary">#{text?.slice(-6).toUpperCase()}</Typography.Text>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <Typography.Text strong>{text}</Typography.Text>
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (text) => <Typography.Text strong style={{ color: '#ff4d4f' }}>{text?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (value) => getStatusTag(value)
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Flex justify="center" gap={12} align="center">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            ghost
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/client/user/orders/${record.id}`)}
                            style={{ borderRadius: '6px' }}
                        />
                    </Tooltip>
                    {record.orderStatus === 'new' ? (
                        <Popconfirm
                            title="Xác nhận hủy đơn"
                            description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
                            onConfirm={() => mutate({ id: record.id, orderStatus: 'canceled' })}
                            okText="Có"
                            cancelText="Không"
                            placement="left"
                            overlayStyle={{ width: "fit-content", minWidth: "250px" }}
                        >
                            <Tooltip title="Hủy đơn">
                                <Button danger icon={<DeleteOutlined />} style={{ borderRadius: '6px' }} />
                            </Tooltip>
                        </Popconfirm>
                    ) : (
                        <Button style={{ visibility: 'hidden' }} icon={<DeleteOutlined />} />
                    )}
                </Flex>
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
                className="custom-breadcrumb"
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: 'LỊCH SỬ ĐƠN HÀNG',
                    },
                ]}
                style={{ margin: '0 auto' }}
            />


            <Card className="modern-order-card" bodyStyle={{ padding: '30px' }} bordered={false}>
                <Flex justify="space-between" align="center" style={{ padding: '30px 0' }}>
                    <Typography.Title level={3} style={{ margin: 0, color: 'var(--primary-color)' }}>Đơn hàng của bạn</Typography.Title>
                </Flex>
                <Table
                    columns={columns}
                    dataSource={orders}
                    loading={isFetching}
                    pagination={{
                        hideOnSinglePage: true,
                        pageSize: 6,
                        total: total,
                        current: page,
                        onChange: setPage,
                        showSizeChanger: false,
                        style: { padding: '20px' }
                    }}
                    locale={{ emptyText: <Empty description="Bạn chưa có đơn hàng nào" /> }}
                    rowKey="id"
                />
            </Card>
        </Flex>
    )
}

