import {
    CameraOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    IdcardOutlined,
    MailOutlined,
    ManOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    UnlockOutlined,
    UserOutlined,
    WomanOutlined
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
    Upload
} from 'antd';
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ROLE } from "../../../../constants/roles";
import { queryClient } from '../../../../main';
import { uploadImage } from '../../../../services/upload_service';
import { createUser, detailUser, updateUser } from '../../../../services/user_service';
import { UserContext } from "../../../../store/user/provider";
import Notification from '../../../../utils/configToastify';
import AdminHeader from "../../components/AdminHeader";
import './CrudUser.css';

const { Title, Text } = Typography;

export function CrudUser() {
    const navigate = useNavigate();
    const userContext = useContext(UserContext)
    const { state } = userContext;
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    const { user_id } = useParams()
    const [isUpdate, setIsUpdate] = useState(false)
    const isAdmin = state?.currentUser?.role === ROLE.ADMIN;
    // We can still keep the isAdmin boolean for other logic if needed, 
    // but the state was removed in favor of a derived value.


    const currentUserRole = state?.currentUser?.role;

    const roles = useMemo(() => {
        const baseOptions = [
            { value: ROLE.STAFF, label: "Nhân viên" },
            { value: ROLE.MANAGER, label: "Quản lý" },
            { value: ROLE.ADMIN, label: "Chủ sở hữu" },
        ];

        if (currentUserRole === ROLE.ADMIN) {
            return baseOptions;
        } else if (currentUserRole === ROLE.MANAGER) {
            return baseOptions.filter(r => r.value !== ROLE.ADMIN);
        }
        return baseOptions.filter(r => r.value === ROLE.STAFF);
    }, [currentUserRole]);

    const handleChange = (e) => {
        setFileList(e.fileList);
    }

    const { data, isSuccess } = useQuery({
        queryKey: ['user_admin_detail_one', user_id],
        queryFn: () => detailUser(user_id),
        enabled: !!user_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => isUpdate ? updateUser(data) : createUser(data),
        onSuccess: () => {
            Notification({ message: isUpdate ? "Cập nhật người dùng thành công!" : "Thêm người dùng thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['users_admin_list'] })
            queryClient.invalidateQueries({ queryKey: ['user_admin_detail_one', user_id] })

            // If the updated user is the current logged in user, refresh their info
            if (user_id === state?.currentUser?.user_id || user_id === state?.currentUser?._id) {
                queryClient.invalidateQueries({ queryKey: ['getMe'] })
            }
        },
        onError: () => {
            Notification({ message: isUpdate ? "Cập nhật người dùng thất bại!" : "Thêm người dùng thất bại!", type: "error" })
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

            if (isUpdate) {
                // For updates, we send the fields that are allowed to change
                const updatePayload = {
                    ...value,
                    image: finalImage,
                    id: user_id
                };
                mutate(updatePayload);
            } else {
                mutate({ ...value, image: finalImage });
            }
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
        }
    }, [fileList.length, form])

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?._doc ? data.data._doc : data?.data;
        if (!rawData) return;

        form.setFieldsValue({
            role: rawData?.role,
            username: rawData?.username,
            email: rawData?.email,
            firstName: rawData?.firstName,
            lastName: rawData?.lastName,
            address: rawData?.address,
            gender: rawData?.gender,
            phone: rawData?.phone,
            isActive: !!rawData?.isActive
        });

        if (rawData?.image) {
            setFileList([{
                uid: '1',
                name: 'avatar.png',
                url: rawData?.image,
            }]);
        }
    }, [data, isSuccess, form])

    // Sync isUpdate state with user_id and enforce security
    useEffect(() => {
        if (user_id) {
            setIsUpdate(true);

            // Security check: Staff can only access their own profile
            const currentUserId = state?.currentUser?.user_id || state?.currentUser?._id;
            if (state?.currentUser?.role === ROLE.STAFF && user_id !== currentUserId) {
                Notification({ message: "Bạn không có quyền truy cập trang này!", type: "error" });
                navigate('/admin');
            }
        }
        return () => setIsUpdate(false)
    }, [user_id, state?.currentUser, navigate])

    const isActive = Form.useWatch('isActive', form);
    const firstName = Form.useWatch('firstName', form);
    const lastName = Form.useWatch('lastName', form);
    const currentRole = Form.useWatch('role', form);

    const isSelf = user_id === state?.currentUser?.user_id || user_id === state?.currentUser?._id;

    const getRoleLabel = (r) => {
        if (r === ROLE.ADMIN) return "Chủ sở hữu";
        if (r === ROLE.MANAGER) return "Quản lý";
        if (r === ROLE.STAFF) return "Nhân viên";
        return "Khách hàng";
    }

    return (
        <Flex className="crud_user container" vertical gap={24}>
            <AdminHeader
                title={isUpdate ? 'Cập nhật người dùng' : "Thêm người dùng mới"}
                icon={<UserOutlined />}
            />

            <div className="form-container">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ isActive: true }}
                >
                    {/* Hidden field to ensure useWatch works even when toggle is hidden */}
                    <Form.Item name="isActive" valuePropName="checked" hidden>
                        <Switch />
                    </Form.Item>

                    <Row gutter={[32, 24]}>
                        {/* Left Sidebar: Profile Summary */}
                        <Col xs={24} lg={8}>
                            <div className="glass-card profile-sidebar-card">
                                <div className="avatar-upload-section">
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
                                                <Text type="secondary" style={{ marginTop: 8 }}>Ảnh hồ sơ</Text>
                                            </Flex>
                                        )}
                                    </Upload>
                                </div>
                                <div className="profile-main-info">
                                    <Title level={4}>
                                        {firstName || lastName ? `${firstName || ''} ${lastName || ''}` : 'Người dùng mới'}
                                    </Title>
                                    <div className="role-badge">
                                        {getRoleLabel(currentRole)}
                                    </div>
                                    <div className={`status-indicator ${isActive ? 'status-active' : 'status-locked'}`}>
                                        <div className="status-dot" />
                                        <span>{isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
                                    </div>
                                </div>

                                <Divider className="form-divider" />

                                <Flex vertical align="start" gap={12} style={{ textAlign: 'left' }}>
                                    <Space><IdcardOutlined /> <Text type="secondary">Mã định danh: {user_id ? user_id.substring(0, 8) : 'Sẽ tạo mới'}</Text></Space>
                                    <Space><GlobalOutlined /> <Text type="secondary">Truy cập: Toàn hệ thống</Text></Space>
                                </Flex>
                            </div>
                        </Col>

                        {/* Right Content: Form Editor */}
                        <Col xs={24} lg={16}>
                            <div className="glass-card profile-form-card">
                                {/* Section: Identity */}
                                <div className="section-header">
                                    <IdcardOutlined />
                                    <Title level={5}>Thông tin định danh</Title>
                                </div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Họ"
                                            name="firstName"
                                            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                                        >
                                            <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Tên"
                                            name="lastName"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                                        >
                                            <Input prefix={<UserOutlined />} placeholder="Ví dụ: An" size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Số điện thoại"
                                            name="phone"
                                            rules={[{ required: true, message: 'Nhập số điện thoại' }]}
                                        >
                                            <Input prefix={<PhoneOutlined />} placeholder="09xx xxx xxx" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Giới tính"
                                            name="gender"
                                            rules={[{ required: true, message: 'Chọn giới tính' }]}
                                        >
                                            <Select placeholder="Chọn một" size="large">
                                                <Select.Option value="male"><ManOutlined /> Nam</Select.Option>
                                                <Select.Option value="female"><WomanOutlined /> Nữ</Select.Option>
                                                <Select.Option value="other">Khác</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Divider className="form-divider" />

                                {/* Section: Account & Role */}
                                <div className="section-header">
                                    <SafetyCertificateOutlined />
                                    <Title level={5}>Tài khoản & Phân quyền</Title>
                                </div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Vai trò"
                                            name="role"
                                            rules={[{ required: true, message: 'Chọn vai trò' }]}
                                        >
                                            <Select
                                                placeholder="Phân quyền hệ thống"
                                                size="large"
                                                options={roles}
                                                disabled={isSelf}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Trạng thái tài khoản"
                                            name="isActive"
                                            valuePropName="checked"
                                        >
                                            <Switch
                                                checkedChildren={<CheckCircleOutlined />}
                                                unCheckedChildren={<StopOutlined />}
                                                className="status-switch"
                                                disabled={isSelf}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[
                                                { required: true, type: 'email', message: 'Email không hợp lệ' }
                                            ]}
                                        >
                                            <Input prefix={<MailOutlined />} placeholder="email@company.com" size="large" disabled={isUpdate} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Tên đăng nhập"
                                            name="username"
                                            rules={[{ required: true, message: 'Nhập username' }]}
                                        >
                                            <Input prefix={<UnlockOutlined />} placeholder="username" size="large" disabled={isUpdate} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {!isUpdate && (
                                    <Form.Item
                                        label="Mật khẩu khởi tạo"
                                        name="password"
                                        rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}
                                    >
                                        <Input.Password prefix={<UnlockOutlined />} placeholder="Mật khẩu" size="large" />
                                    </Form.Item>
                                )}

                                <Divider className="form-divider" />

                                {/* Section: Address */}
                                <div className="section-header">
                                    <EnvironmentOutlined />
                                    <Title level={5}>Địa chỉ liên lạc</Title>
                                </div>
                                <Form.Item
                                    label="Địa chỉ chi tiết"
                                    name="address"
                                    rules={[{ required: true, message: 'Nhập địa chỉ' }]}
                                >
                                    <Input.TextArea
                                        placeholder="Số nhà, tên đường, khu vực..."
                                        rows={3}
                                        prefix={<EnvironmentOutlined />}
                                        style={{ borderRadius: 10, padding: 12 }}
                                    />
                                </Form.Item>

                                <div className="button-group">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="btn-submit"
                                        loading={isLoading}
                                    >
                                        {isUpdate ? "Cập nhật hồ sơ" : 'Tạo người dùng'}
                                    </Button>
                                    {!isUpdate && (
                                        <Button htmlType="reset" className="btn-reset">Nhập lại</Button>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Flex>
    );
}