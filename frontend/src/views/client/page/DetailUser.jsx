import {
    CameraOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    IdcardOutlined,
    ManOutlined,
    PhoneOutlined,
    UserOutlined,
    WomanOutlined
} from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import {
    Breadcrumb,
    Button,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Space,
    Typography,
    Upload
} from 'antd'
import { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { queryClient } from '../../../main'
import { uploadImage } from '../../../services/upload_service'
import { updateUser } from '../../../services/user_service'
import { UserContext } from '../../../store/user/provider'
import Notification from '../../../utils/configToastify'
import '../style/DetailUser.css'

const { Title, Text } = Typography;

export const DetailUser = () => {
    const [form] = Form.useForm()
    const { Option } = Select
    const [fileList, setFileList] = useState([])
    const user = useContext(UserContext)
    const { state, dispatch } = user;
    const info = state?.currentUser;
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values) => {
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
            mutate({ ...values, image: finalImage, id: info.user_id || info._id });
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    const navigate = useNavigate()
    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: (response) => {
            Notification({ message: "Cập nhật thông tin thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['getMe'] })
            // Optional: If the API returns the updated user, we could dispatch an update action.
            // But invalidating getMe is broader and ensures all related UI updates.
        },
        onError: () => Notification({ message: "Cập nhật thất bại, vui lòng kiểm tra lại!", type: "error" })
    })

    const handleChange = (e) => {
        setFileList(e.fileList)
    }

    useEffect(() => {
        if (!info) return;
        form.setFieldsValue({
            firstName: info?.firstName,
            lastName: info?.lastName,
            address: info?.address,
            gender: info?.gender,
            phone: info?.phone
        });

        if (info?.image) {
            setFileList([{
                uid: '1',
                name: 'avatar.png',
                url: info?.image,
            }]);
        }
    }, [info, form])

    useEffect(() => {
        document.title = "Thông tin cá nhân"
    }, [])

    return (
        <Flex vertical className='customer'>
            <Breadcrumb
                items={[
                    { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                    { title: <Text>THÔNG TIN CÁ NHÂN</Text> },
                ]}
            />

            <div className='form_wrap'>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Row gutter={[32, 32]}>
                        {/* Sidebar: Profile Photo */}
                        <Col xs={24} lg={8}>
                            <div className="glass-card profile-sidebar-card">
                                <div className="avatar-upload-wrapper">
                                    <Upload
                                        beforeUpload={() => false}
                                        listType="picture-circle"
                                        fileList={fileList}
                                        onChange={handleChange}
                                        maxCount={1}
                                        accept='image/*'
                                        showUploadList={{ showPreviewIcon: false }}
                                    >
                                        {fileList.length < 1 && (
                                            <Flex vertical align="center">
                                                <CameraOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />
                                                <Text type="secondary" style={{ marginTop: 8 }}>Tải ảnh</Text>
                                            </Flex>
                                        )}
                                    </Upload>
                                </div>
                                <Title level={4} className="profile-name">
                                    {info?.firstName} {info?.lastName}
                                </Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                                    {info?.role === 0 ? "Khách hàng thân thiết" : "Thành viên cửa hàng"}
                                </Text>
                                <span className="profile-role-tag">Tài khoản chính thức</span>

                                <Divider className="section-divider" />

                                <Flex vertical align="start" gap={8} style={{ textAlign: 'left' }}>
                                    <Space><IdcardOutlined /> <Text type="secondary">ID: {info?.user_id?.substring(0, 8)}...</Text></Space>
                                    <Space><GlobalOutlined /> <Text type="secondary">Ngôn ngữ: Tiếng Việt</Text></Space>
                                </Flex>
                            </div>
                        </Col>

                        {/* Main Content: Form Editor */}
                        <Col xs={24} lg={16}>
                            <div className="glass-card profile-content-card">
                                <Title level={5} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <IdcardOutlined style={{ color: '#16a34a' }} /> Thông tin định danh
                                </Title>

                                <Row gutter={20}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Họ"
                                            name="firstName"
                                            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                                        >
                                            <Input prefix={<UserOutlined />} placeholder="Nhập họ" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Tên"
                                            name="lastName"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                                        >
                                            <Input prefix={<UserOutlined />} placeholder="Nhập tên" size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={20}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Số điện thoại"
                                            name="phone"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                                { pattern: /^[0-9+]{10,13}$/, message: 'Số điện thoại không hợp lệ!' }
                                            ]}
                                        >
                                            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Giới tính"
                                            name="gender"
                                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                                        >
                                            <Select placeholder="Chọn giới tính" size="large">
                                                <Option value="male"><Space><ManOutlined /> Nam</Space></Option>
                                                <Option value="female"><Space><WomanOutlined /> Nữ</Space></Option>
                                                <Option value="other">Khác</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Divider className="section-divider" />

                                <Title level={5} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <EnvironmentOutlined style={{ color: '#16a34a' }} /> Địa chỉ nhận hàng
                                </Title>

                                <Form.Item
                                    label="Địa chỉ chi tiết"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                >
                                    <Input.TextArea
                                        prefix={<EnvironmentOutlined />}
                                        placeholder="Số nhà, tên đường, phường/xã..."
                                        rows={3}
                                        style={{ borderRadius: 10 }}
                                    />
                                </Form.Item>

                                <div className="button_group">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="update"
                                        loading={isLoading}
                                        block
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Flex>
    )
}


