import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Card, Empty, Flex, Modal, Pagination, Table, Tag, Tooltip, Typography } from "antd";
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
            Notification({ message: "Hủy đơn hàng thành công", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['order_list_user'] })
        },
        onError: () => Notification({ message: "Đã có lỗi xảy ra", type: "error" })
    })

    const showCancelConfirm = (orderId) => {
        Modal.confirm({
            title: 'Xác nhận hủy đơn hàng',
            content: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
            centered: true,
            okText: 'Có, hủy đơn',
            cancelText: 'Không',
            okButtonProps: { danger: true },
            onOk() {
                mutate({ id: orderId, orderStatus: 'canceled' })
            }
        });
    }

    useEffect(() => {
        if (!isSuccess) return
        const responseData = data?.data
        const rawData = responseData?.docs || []
        
        setOrders(rawData?.map((item, index) => ({
            no: index + 1,
            id: item?._id,
            receiverName: item?.firstNameReceiver + " " + item?.lastNameReceiver,
            orderStatus: item?.orderStatus,
            date: dayjs(item?.createdAt).format('DD/MM/YYYY HH:mm'),
            total: item?.total,
            productsCount: item?.products?.length || 1
        })))
        
        // Cập nhật tổng số lượng đơn hàng để phân trang hoạt động
        setTotal(responseData?.totalDocs || 0)
        
        return () => {
            setOrders([])
            setTotal(0)
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
                        <Tooltip title="Hủy đơn">
                            <Button danger icon={<DeleteOutlined />} style={{ borderRadius: '6px' }} onClick={() => showCancelConfirm(record.id)} />
                        </Tooltip>
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
        <>
            <Flex className='category_page' vertical>
                <Breadcrumb
                    className="custom-breadcrumb"
                    items={[
                        { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                        { title: 'LỊCH SỬ ĐƠN HÀNG' },
                    ]}
                />

                <Card className="modern-order-card" bodyStyle={{ padding: '30px' }} bordered={false}>
                    <Flex justify="space-between" align="center" style={{ padding: '0 0 24px' }}>
                        <Typography.Title level={3} style={{ margin: 0, color: 'var(--primary-color)' }}>Đơn hàng của bạn</Typography.Title>
                    </Flex>

                    {/* ── Desktop: Table ── */}
                    <div className="order-list-desktop">
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
                                style: { padding: '20px 0' }
                            }}
                            locale={{ emptyText: <Empty description="Bạn chưa có đơn hàng nào" /> }}
                            rowKey="id"
                        />
                    </div>

                    {/* ── Mobile: Card List ── */}
                    <div className="order-list-mobile">
                        {orders.length === 0 ? (
                            <Empty description="Bạn chưa có đơn hàng nào" />
                        ) : (
                            orders.map((record) => (
                                <div key={record.id} className="order-card-mobile">
                                    <div className="order-card-header">
                                        <Typography.Text strong style={{ fontSize: 14 }}>
                                            #{record.id?.slice(-6).toUpperCase()}
                                        </Typography.Text>
                                        {getStatusTag(record.orderStatus)}
                                    </div>
                                    <div className="order-card-row">
                                        <span className="label">Ngày đặt</span>
                                        <Typography.Text>{record.date}</Typography.Text>
                                    </div>
                                    <div className="order-card-row">
                                        <span className="label">Người nhận</span>
                                        <Typography.Text>{record.receiverName}</Typography.Text>
                                    </div>
                                    <div className="order-card-row">
                                        <span className="label">Tổng tiền</span>
                                        <Typography.Text strong style={{ color: '#ff4d4f' }}>
                                            {record.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </Typography.Text>
                                    </div>
                                    <div className="order-card-footer">
                                        <Button
                                            type="primary" ghost size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => navigate(`/client/user/orders/${record.id}`)}
                                        >
                                            Chi tiết
                                        </Button>
                                        {record.orderStatus === 'new' && (
                                            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => showCancelConfirm(record.id)}>
                                                Hủy đơn
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Pagination for mobile */}
                        {total > 6 && (
                            <Flex justify="center" style={{ paddingTop: 16 }}>
                                <Pagination
                                    current={page}
                                    total={total}
                                    pageSize={6}
                                    onChange={setPage}
                                    showSizeChanger={false}
                                    size="small"
                                />
                            </Flex>
                        )}
                    </div>
                </Card>
            </Flex>
        </>
    )
}

