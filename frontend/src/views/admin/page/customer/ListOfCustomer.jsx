import { 
    EyeOutlined,
    UserOutlined,
    MailOutlined,
    SearchOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Switch, Table, Card, Row, Col, Typography, Avatar } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { queryClient } from '../../../../main';
import { listCustomer, updateUser } from '../../../../services/user_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';
import AdminHeader from "../../components/AdminHeader";
import './ListOfCustomer.css';

const { Text } = Typography;

const statuses = [
    { value: true, label: "Đang hoạt động" },
    { value: false, label: "Ngừng hoạt động" },
];

export const ListOfCustomer = () => {
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);

    const [email, setEmail] = useState("");
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');

    const searchName = useDebounce(name, 500);
    const searchEmail = useDebounce(email, 500);
    const searchStatus = useDebounce(status, 500);

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật trạng thái khách hàng thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['customers_admin_list'] });
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Cập nhật trạng thái thất bại!", type: "error" });
        }
    });

    const { data, isSuccess, isLoading } = useQuery({
        queryKey: ['customers_admin_list', page, searchEmail, searchName, searchStatus],
        queryFn: () => listCustomer(page,
            searchName !== undefined ? searchName : '',
            searchEmail !== undefined ? searchEmail : '',
            searchStatus !== undefined ? searchStatus : ''),
        enabled: true
    });

    useEffect(() => {
        setPage(1);
    }, [searchStatus, searchName, searchEmail]);

    useEffect(() => {
        if (!isSuccess) return;
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                name: (item?.firstName) ? (item?.firstName + " " + item?.lastName) : (item?.name || 'Khách hàng'),
                image: item?.image,
                address: item?.address || 'Chưa cập nhật',
                email: item?.email,
                status: item?.isActive,
            }))
        );
        setTotal(rawData?.totalDocs);
    }, [data, isSuccess]);

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'name',
            width: 260,
            render: (text, row) => (
                <Flex align='center' gap={12}>
                    <Avatar 
                        src={row.image} 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: '#87d068' }}
                    />
                    <Text strong style={{ color: '#1a3353' }}>{text}</Text>
                </Flex>
            )
        },
        {
            title: 'Email liên hệ',
            dataIndex: 'email',
            width: 240,
            render: (text) => (
                <Flex align="center" gap={8}>
                    <MailOutlined style={{ color: '#bfbfbf' }} />
                    <Text>{text}</Text>
                </Flex>
            )
        },
        {
            title: 'Địa chỉ giao hàng mặc định',
            dataIndex: 'address',
            render: (text) => <Text type="secondary" ellipsis>{text}</Text>
        },
        {
            title: 'Trạng thái hoạt động',
            dataIndex: 'status',
            width: 160,
            align: 'center',
            render: (value, row) => (
                <Switch 
                    checked={value} 
                    onChange={(e) => mutate({ id: row.key, isActive: e })} 
                    checkedChildren="Mở"
                    unCheckedChildren="Khóa"
                />
            )
        },
        {
            title: 'Thao tác',
            align: "center",
            width: 100,
            render: (_, row) => (
                <Button 
                    type="primary" 
                    ghost
                    icon={<EyeOutlined />} 
                    onClick={() => onEdit(row.key)} 
                    style={{ borderRadius: 6 }}
                />
            ),
        },
    ];

    const navigate = useNavigate();
    const onEdit = (id) => {
        navigate(`/admin/customers/${id}`);
    };

    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'] || '');
        setEmail(mappedFields['email'] || '');
        setStatus(mappedFields['status'] !== undefined ? mappedFields['status'] : '');
    };

    return (
        <Flex vertical gap={"middle"} className='banner_list customer_list_container'>
            <AdminHeader title="Quản lý khách hàng" icon={<UserOutlined />} />

            {/* Filter section */}
            <Card bordered={false} className="glass-card shadow-sm filter-card">
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="name" style={{ marginBottom: 0 }}>
                                <Input 
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Tìm tên khách hàng..." 
                                    size="large"
                                    className="premium-input"
                                />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="email" style={{ marginBottom: 0 }}>
                                <Input 
                                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Tìm theo Email khách hàng..." 
                                    size="large"
                                    className="premium-input"
                                />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={24} lg={8}>
                            <Form.Item name="status" style={{ marginBottom: 0 }}>
                                <Select 
                                    placeholder="Lọc trạng thái hoạt động" 
                                    options={statuses} 
                                    allowClear 
                                    size="large"
                                    className="premium-select"
                                    suffixIcon={<FilterOutlined />}
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

export default ListOfCustomer;
