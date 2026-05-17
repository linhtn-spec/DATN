import { 
    CreditCardOutlined, 
    EyeOutlined, 
    MoneyCollectOutlined, 
    ShoppingCartOutlined, 
    TagOutlined, 
    TruckOutlined,
    ShoppingOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Table, Tooltip, Typography, Card, Row, Col, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { orderStatusOptions, paymentStatusOptions, shippingStatusOptions } from '../../../../constants/orderOptions';
import convertToDate from '../../../../functions/convertDate';
import { queryClient } from '../../../../main';
import { editOrder, listOrder } from '../../../../services/order_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';
import AdminHeader from "../../components/AdminHeader";
import './ListOfOrder.css';

const { Text } = Typography;

export const ListOfOrder = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [name, setName] = useState('');
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState('');
    const [shippingStatus, setShippingStatus] = useState('');
    const [sortDate, setSortDate] = useState('');

    const searchName = useDebounce(name, 500);
    const searchOrderStatus = useDebounce(orderStatus, 500);
    const searchPaymentStatus = useDebounce(paymentStatus, 500);
    const searchShippingStatus = useDebounce(shippingStatus, 500);
    const searchSortDate = useDebounce(sortDate, 500);

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([]);

    const { mutate } = useMutation({
        mutationFn: (data) => editOrder(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật trạng thái đơn hàng thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['orders_admin_list'] });
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái đơn hàng thất bại", type: "error" });
        }
    });

    const { data, isSuccess, isLoading } = useQuery({
        queryKey: ['orders_admin_list', page, searchOrderStatus, searchName, searchPaymentStatus, searchShippingStatus, searchSortDate],
        queryFn: () => listOrder(page,
            searchName !== undefined ? searchName : '',
            searchOrderStatus !== undefined ? searchOrderStatus : '',
            searchPaymentStatus !== undefined ? searchPaymentStatus : '',
            searchShippingStatus !== undefined ? searchShippingStatus : '',
            searchSortDate !== undefined ? searchSortDate : ''),
        enabled: true
    });

    useEffect(() => {
        setPage(1);
    }, [searchShippingStatus, searchOrderStatus, searchPaymentStatus, searchSortDate, searchName]);

    useEffect(() => {
        if (!isSuccess) return;
        const rawData = data?.data;
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
        setTotal(rawData?.total);
    }, [data, isSuccess]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'new': return 'status-new';
            case 'processing': return 'status-processing';
            case 'hold': return 'status-hold';
            case 'canceled': return 'status-canceled';
            case 'done': return 'status-done';
            default: return '';
        }
    };

    const columns = [
        {
            title: "Họ tên người nhận",
            dataIndex: 'name',
            render: (text) => <Text strong style={{ color: '#1a3353' }}>{text}</Text>
        },
        {
            title: <Tooltip title={"Tạm tính"}><TagOutlined /></Tooltip>,
            dataIndex: 'subTotal',
            width: 120,
            align: "right",
            render: (value) => <Text>{Number(value || 0).toLocaleString('vi-VN')} ₫</Text>
        },
        {
            title: <Tooltip title={"Thuế"}><ShoppingCartOutlined /></Tooltip>,
            dataIndex: 'tax',
            width: 100,
            align: "right",
            render: (value) => <Text>{Number(value || 0).toLocaleString('vi-VN')} ₫</Text>
        },
        {
            title: <Tooltip title={"Phí vận chuyển"}><TruckOutlined /></Tooltip>,
            dataIndex: 'shippingCost',
            width: 120,
            align: "right",
            render: (value) => <Text>{Number(value || 0).toLocaleString('vi-VN')} ₫</Text>
        },
        {
            title: <Tooltip title={"Tổng cộng"}><MoneyCollectOutlined /></Tooltip>,
            dataIndex: 'total',
            width: 130,
            align: "right",
            render: (value) => <Text type="danger" strong style={{ fontSize: 14 }}>{Number(value || 0).toLocaleString('vi-VN')} ₫</Text>
        },
        {
            title: <Tooltip title={'Phương thức thanh toán'}><CreditCardOutlined /></Tooltip>,
            dataIndex: 'paymentMethod',
            width: 100,
            align: "center",
            render: (value) => (
                <Tag color={value === 'cod' ? 'orange' : 'blue'} style={{ fontWeight: 600 }}>
                    {String(value).toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'orderStatus',
            width: 180,
            render: (text, row) => (
                <Select 
                    placeholder="Trạng thái đơn hàng" 
                    size='middle' 
                    className={`status-select-pill ${getStatusClass(text)}`}
                    style={{ width: "100%" }} 
                    options={orderStatusOptions}
                    value={text} 
                    onChange={(e) => mutate({ id: row.key, orderStatus: e })} 
                />
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 140,
            align: 'center',
            sorter: true,
            render: (value) => <Text type="secondary">{convertToDate(value)}</Text>
        },
        {
            title: 'Hành động',
            align: "center",
            width: 90,
            render: (_, row) => (
                <Button 
                    type="primary" 
                    ghost
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(`/admin/orders/${row.key}`)} 
                    style={{ borderRadius: 6 }}
                />
            ),
        },
    ];

    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'] || '');
        setOrderStatus(mappedFields['orderStatus'] || '');
        setPaymentStatus(mappedFields['paymentStatus'] || '');
        setShippingStatus(mappedFields['shippingStatus'] || '');
    };

    const onChange = (_pagination, _filters, sorter) => {
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
        <Flex vertical gap={"middle"} className='banner_list order_list_container'>
            <AdminHeader title="Quản lý đơn hàng" icon={<ShoppingOutlined />} />

            {/* Filter section */}
            <Card bordered={false} className="glass-card shadow-sm filter-card">
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item name="name" style={{ marginBottom: 0 }}>
                                <Input 
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Tìm tên khách hàng..." 
                                    size="large"
                                    className="premium-input"
                                />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item name="orderStatus" style={{ marginBottom: 0 }}>
                                <Select 
                                    placeholder="Trạng thái đơn hàng" 
                                    options={orderStatusOptions} 
                                    allowClear 
                                    size="large"
                                    className="premium-select"
                                />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item name="paymentStatus" style={{ marginBottom: 0 }}>
                                <Select 
                                    placeholder="Trạng thái thanh toán" 
                                    options={paymentStatusOptions} 
                                    allowClear 
                                    size="large"
                                    className="premium-select"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Form.Item name="shippingStatus" style={{ marginBottom: 0 }}>
                                <Select 
                                    placeholder="Trạng thái giao hàng" 
                                    options={shippingStatusOptions} 
                                    allowClear 
                                    size="large"
                                    className="premium-select"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Table section */}
            <Table
                bordered
                columns={columns}
                dataSource={items}
                loading={isLoading}
                rowHoverable
                onChange={onChange}
                className="premium-table"
                pagination={{ 
                    hideOnSinglePage: true, 
                    pageSize: 6, 
                    total: total, 
                    current: page, 
                    onChange: setPage,
                    showSizeChanger: false
                }}
            />
        </Flex>
    );
};

export default ListOfOrder;
