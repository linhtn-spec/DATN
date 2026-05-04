import { CreditCardOutlined, EyeOutlined, MoneyCollectOutlined, ShoppingCartOutlined, TagOutlined, TruckOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Table, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// import { updateProduct } from '../../../../../services/product_service';
import { orderStatusOptions, paymentStatusOptions, shippingStatusOptions } from '../../../../constants/orderOptions';
import convertToDate from '../../../../functions/convertDate';
import { queryClient } from '../../../../main';
import { editOrder, listOrder } from '../../../../services/order_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';
import './ListOfOrder.css';



export const ListOfOrder = () => {

    const [form] = Form.useForm()
    const [page, setPage] = useState(1);
    const [name, setName] = useState('')
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState('')
    const [shippingStatus, setShippingStatus] = useState('')
    const [sortDate, setSortDate] = useState('')

    const searchName = useDebounce(name, 500)
    const searchOrderStatus = useDebounce(orderStatus, 500)
    const searchPaymentStatus = useDebounce(paymentStatus, 500)
    const searchShippingStatus = useDebounce(shippingStatus, 500)
    const searchSortDate = useDebounce(sortDate, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])


    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật trạng thái đơn hàng thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['orders_admin_list'] })
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái đơn hàng thất bại", type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['orders_admin_list', page, searchOrderStatus, searchName, searchPaymentStatus, searchShippingStatus, searchSortDate],
        queryFn: () => listOrder(page,
            searchName !== undefined ? searchName : '',
            searchOrderStatus !== undefined ? searchOrderStatus : '',
            searchPaymentStatus !== undefined ? searchPaymentStatus : '',
            searchShippingStatus !== undefined ? searchShippingStatus : '',
            searchSortDate !== undefined ? searchSortDate : ''),
        enabled: !!searchShippingStatus || !!searchName || !!page || !!searchOrderStatus || !!searchPaymentStatus || !!searchSortDate
    })



    useEffect(() => {
        setPage(1)

        return () => {
            setPage(1)
        }
    }, [searchShippingStatus, searchOrderStatus, searchPaymentStatus, searchSortDate, searchName])

    console.log(searchSortDate);

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data;
        console.log(rawData);
        setItems(
            rawData?.paginatedResults?.map((item) => ({
                key: item?._id,
                name: item?.firstNameReceiver + " " + item?.lastNameReceiver,
                subTotal: item?.products?.reduce((prev, curr) => prev + curr.subPrice, 0),
                tax: item?.tax,
                shippingCost: item?.shippingCost,
                total: item?.total,
                paymentMethod: item?.paymentMethod,
                orderStatus: item?.orderStatus,
                createdAt: item?.createdAt
            }))
        );

        setTotal(rawData?.total)

        return () => {
            setItems([])
        }

    }, [data, isSuccess]);



    const columns = [
        {
            title: "Họ tên",
            dataIndex: 'name',
        },
        {
            title: < Tooltip title={"Tạm tính"} > < TagOutlined /></Tooltip >,
            dataIndex: 'subTotal',
            ellipsis: true,
            width: 120,
            align: "center",
            render: (value) => <Typography.Text>{Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>

        },
        {
            title: <Tooltip title={"Thuế"}> <ShoppingCartOutlined /></Tooltip>,
            dataIndex: 'tax',
            ellipsis: true,
            width: 100,
            align: "center",
            render: (value) => <Typography.Text>{Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>

        },
        {
            title: <Tooltip title={"Phí vận chuyển"}> <TruckOutlined /></Tooltip>,
            dataIndex: 'shippingCost',
            width: 120,
            align: "center",
            ellipsis: true,
            render: (value) => <Typography.Text>{Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>

        },
        {
            title: <Tooltip title={"Tổng cộng"}><MoneyCollectOutlined /></Tooltip>,
            dataIndex: 'total',
            ellipsis: true,
            width: 120,
            align: "center",
            render: (value) => <Typography.Text>{Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography.Text>

        },
        {
            title: <Tooltip title={'Phương thức thanh toán'}>< CreditCardOutlined /></Tooltip>,
            dataIndex: 'paymentMethod',
            ellipsis: true,
            width: 100,
            align: "center",
            render: (value) => <Typography.Text>{String(value).toUpperCase()}</Typography.Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            width: 150,
            render: (text, row) => <Select placeholder="Trạng thái đơn hàng" size='middle' style={{ width: "100%" }} options={orderStatusOptions}
                value={text} onChange={(e) => mutate({ id: row.key, orderStatus: e })} />

        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            sorter: true,
            render: (value) => <Typography.Text>{convertToDate(value)}</Typography.Text>
        },
        {
            title: 'Hành động',
            align: "center",
            key: 'x',
            width: 75,
            render: (text, row) => <Flex justify='center' className='delete' gap={5}>
                <Button icon={<EyeOutlined />} onClick={() => onEdit(row.key)} />
            </Flex>,
        },
    ];

    const navigate = useNavigate()

    const onEdit = (id) => {
        navigate(`/admin/orders/${id}`)
    }


    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'])
        setOrderStatus(mappedFields['orderStatus'])
        setPaymentStatus(mappedFields['paymentStatus'])
        setShippingStatus(mappedFields['shippingStatus'])
    };
    const onChange = (_pagination, _filters, sorter, _extra) => {
        const { field, order } = sorter;
        let newSortDate = '';
        if (order !== undefined) {
            if (field === 'createdAt') {
                newSortDate = order;
            }
        }
        setSortDate(newSortDate);
    };
    return (
        <Flex vertical gap={"middle"} className='banner_list'>
            <Flex>
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Flex gap={'middle'} width="100%">
                        <Form.Item
                            name="name"
                            style={{ width: "33%" }}
                        >
                            <Input type="text" placeholder="Họ tên" />
                        </Form.Item>
                        <Form.Item
                            style={{ width: "51%" }}
                            name="orderStatus"
                        >
                            <Select placeholder="Trạng thái đơn hàng" options={orderStatusOptions} allowClear />
                        </Form.Item>
                        <Form.Item
                            style={{ width: "51%" }}
                            name="paymentStatus"
                        >
                            <Select placeholder="Trạng thái thanh toán" options={paymentStatusOptions} allowClear />
                        </Form.Item>
                        <Form.Item
                            style={{ width: "51%" }}
                            name="shippingStatus"
                        >
                            <Select placeholder="Trạng thái giao hàng" options={shippingStatusOptions} allowClear />
                        </Form.Item>
                    </Flex>

                </Form>
            </Flex>
            <Table
                bordered
                columns={columns}
                dataSource={items}
                loading={!isSuccess}
                rowHoverable
                onChange={onChange}
                pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, current: page, showSizeChanger: false, onChange: setPage }}
            />

        </Flex>
    )
}
