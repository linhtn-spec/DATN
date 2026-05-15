import {
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
    EnvironmentOutlined,
    SaveOutlined,
    RollbackOutlined,
    ManOutlined,
    WomanOutlined,
    QuestionCircleOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Space,
    Switch,
    Typography,
    Upload,
    Avatar,
    Card as AntdCard
} from 'antd';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { queryClient } from '../../../../main';
import { uploadImage } from '../../../../services/upload_service';
import { detailUser, updateUser } from '../../../../services/user_service';
import Notification from '../../../../utils/configToastify';
import './DetailCustomer.css';
import AdminHeader from "../../components/AdminHeader";

const { Title, Text } = Typography;

export function DetailCustomer() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    const { user_id } = useParams()

    const handleChange = (e) => {
        setFileList(e.fileList);
    }

    const { data, isSuccess } = useQuery({
        queryKey: ['customer_admin_detail', user_id],
        queryFn: () => detailUser(user_id),
        enabled: !!user_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật người dùng thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['customers_admin_list'] })
            navigate('/admin/customers', { replace: true })
        },
        onError: () => {
            Notification({ message: "Cập nhật người dùng thất bại!", type: "error" })
        }
    })

    const handleSubmit = async (value) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            let existingUrl = '';

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                } else if (file.url) {
                    existingUrl = file.url;
                }
            });

            let newUrl = '';
            if (Array.from(formData.entries()).length > 0) {
                const rs = await uploadImage(formData);
                newUrl = rs?.data?.images[0]?.url || '';
            }

            const finalImage = newUrl ? newUrl : existingUrl;
            mutate({ ...value, image: finalImage, ...(user_id ? { id: user_id } : {}) });
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?._doc
        form.setFieldsValue({
            role: rawData?.role,
            username: rawData?.username,
            email: rawData?.email,
            firstName: rawData?.firstName,
            lastName: rawData?.lastName,
            address: rawData?.address,
            gender: rawData?.gender,
            phone: rawData?.phone,
            isActive: rawData?.isActive
        });

        if (rawData?.image) {
            setFileList([{
                uid: '1',
                name: 'image.png',
                url: rawData?.image,
            }]);
        }
    }, [data, isSuccess, form])

    return (
        <Flex className="detail-customer-container" vertical>
            <AdminHeader 
                title="Cập nhật khách hàng" 
                extra={
                    <Space>
                        <Button 
                            icon={<RollbackOutlined />} 
                            onClick={() => navigate(-1)}
                        >
                            Quay lại
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<SaveOutlined />} 
                            loading={isLoading}
                            onClick={() => form.submit()}
                        >
                            Lưu thay đổi
                        </Button>
                    </Space>
                }
            />

            <Form 
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                className="detail-customer-form"
            >
                <Row gutter={[24, 24]}>
                    {/* Left Column: Profile Card */}
                    <Col xs={24} md={8}>
                        <AntdCard className="profile-card glass-card shadow-sm" bordered={false}>
                            <Flex vertical align="center" gap={20}>
                                <div className="avatar-upload-wrapper">
                                    <Form.Item name="image" noStyle>
                                        <Upload
                                            beforeUpload={() => false}
                                            listType="picture-circle"
                                            fileList={fileList}
                                            onChange={handleChange}
                                            maxCount={1}
                                            accept='image/*'
                                            className="avatar-upload"
                                            showUploadList={false}
                                        >
                                            {fileList.length > 0 ? (
                                                <div className="avatar-preview">
                                                    <Avatar 
                                                        src={fileList[0].url || (fileList[0].originFileObj && URL.createObjectURL(fileList[0].originFileObj))} 
                                                        size={120} 
                                                    />
                                                    <div className="upload-overlay">
                                                        <CameraOutlined />
                                                        <span>Thay đổi</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    <UserOutlined style={{ fontSize: 40 }} />
                                                    <span>Tải ảnh</span>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                </div>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {form.getFieldValue('lastName')} {form.getFieldValue('firstName')}
                                    </Title>
                                    <Text type="secondary">{form.getFieldValue('email')}</Text>
                                </div>

                                <Divider style={{ margin: '12px 0' }} />

                                <Flex vertical style={{ width: '100%' }} gap={12}>
                                    <Flex justify="space-between">
                                        <Text type="secondary">Trạng thái:</Text>
                                        <Form.Item name="isActive" valuePropName="checked" noStyle>
                                            <Switch 
                                                checkedChildren="Hoạt động" 
                                                unCheckedChildren="Đã khóa" 
                                            />
                                        </Form.Item>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text type="secondary">Vai trò:</Text>
                                        <Text strong>Khách hàng</Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </AntdCard>
                    </Col>

                    {/* Right Column: Information Sections */}
                    <Col xs={24} md={16}>
                        <AntdCard className="info-card glass-card shadow-sm" bordered={false}>
                            <Title level={5} className="section-title">
                                <IdcardOutlined /> Thông tin cá nhân
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="Họ"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                                    >
                                        <Input placeholder="Họ" prefix={<UserOutlined className="text-muted" />} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                                    >
                                        <Input placeholder="Tên" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
                                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                                    >
                                        <Select placeholder="Chọn giới tính" size="large">
                                            <Select.Option value="male"><ManOutlined /> Nam</Select.Option>
                                            <Select.Option value="female"><WomanOutlined /> Nữ</Select.Option>
                                            <Select.Option value="other"><QuestionCircleOutlined /> Khác</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Số điện thoại"
                                        rules={[
                                            { pattern: /^[0-9]+$/, message: 'Chỉ nhập số!' },
                                            { min: 10, message: 'Tối thiểu 10 chữ số' },
                                            { max: 13, message: 'Tối đa 13 chữ số' }
                                        ]}
                                    >
                                        <Input placeholder="Số điện thoại" prefix={<PhoneOutlined className="text-muted" />} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Title level={5} className="section-title">
                                <SafetyCertificateOutlined /> Tài khoản & Bảo mật
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="username" label="Tên đăng nhập">
                                        <Input prefix={<UserOutlined className="text-muted" />} size="large" disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email">
                                        <Input prefix={<MailOutlined className="text-muted" />} size="large" disabled />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Title level={5} className="section-title">
                                <EnvironmentOutlined /> Địa chỉ giao hàng
                            </Title>
                            <Form.Item
                                name="address"
                                label="Địa chỉ chi tiết"
                                rules={[{ max: 150, message: 'Tối đa 150 ký tự' }]}
                            >
                                <Input.TextArea 
                                    placeholder="Số nhà, tên đường, xã/phường, quận/huyện..." 
                                    rows={3} 
                                    showCount 
                                    maxLength={150} 
                                />
                            </Form.Item>
                        </AntdCard>
                    </Col>
                </Row>
            </Form>
        </Flex>
    );
}