import {
    CameraOutlined,
    PlusOutlined,
    FontColorsOutlined,
    NumberOutlined,
    FileTextOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
    Button,
    Flex,
    Form,
    Input,
    InputNumber,
    Switch,
    Typography,
    Upload,
    Col,
    Row,
    Divider
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { queryClient } from "../../../../../main";
import { addBanner } from "../../../../../services/banner_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './CreateBanner.css';
import AdminHeader from "../../../components/AdminHeader";
import BannerFormSkeleton from "../BannerFormSkeleton";

function CreateBanner() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFileList(e.fileList);
    }
    const { mutate } = useMutation({
        mutationFn: (data) => addBanner(data),
        onSuccess: () => {
            Notification({ message: "Thêm biểu ngữ thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['banner_admin'] })
            navigate('/admin/banner', { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Đã xảy ra lỗi", type: "error" })
        }
    })

    const handleSubmit = async (value) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            let finalImageUrl = ''; // Expecting maximum 1 image for Banner
            if (Array.from(formData.entries()).length > 0) {
                const rs = await uploadImage(formData);
                finalImageUrl = rs?.data?.images[0]?.url || '';
            }

            mutate({ ...value, image: finalImageUrl });
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

    return (
        <Flex className="add_banner_panel container" vertical>
            <AdminHeader title="Thêm biểu ngữ mới" icon={<PlusOutlined />} />
            
            {isLoading ? (
                <BannerFormSkeleton />
            ) : (
                <Form 
                    onFinish={handleSubmit}
                    form={form}
                    layout="vertical"
                    className="premium-form"
                    initialValues={{ isActive: true }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Visuals & Status */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm image-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CameraOutlined /> Hình ảnh biểu ngữ
                                    </Typography.Title>
                                    <Form.Item
                                        name="image"
                                        rules={[{ required: true, message: "Vui lòng tải lên hình ảnh biểu ngữ" }]}
                                    >
                                        <Upload
                                            beforeUpload={() => false}
                                            listType="picture-card"
                                            fileList={fileList}
                                            onChange={handleChange}
                                            maxCount={1}
                                            accept='image/*'
                                            className="premium-upload"
                                        >
                                            {fileList.length < 1 && (
                                                <div className="upload-placeholder">
                                                    <PlusOutlined />
                                                    <div style={{ marginTop: 8 }}>Tải ảnh biểu ngữ</div>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                </Card>

                                <Card bordered={false} className="glass-card shadow-sm status-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CheckCircleOutlined /> Trạng thái & Hiển thị
                                    </Typography.Title>
                                    <Flex justify="space-between" align="center" className="status-item">
                                        <Typography.Text strong>Trạng thái hoạt động</Typography.Text>
                                        <Form.Item name='isActive' valuePropName="checked" style={{ marginBottom: 0 }}>
                                            <Switch checkedChildren='Bật' unCheckedChildren="Khóa" />
                                        </Form.Item>
                                    </Flex>
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
                                        Biểu ngữ bị khóa sẽ không hiển thị trên trang chủ của khách hàng.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Detailed Specs */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <FontColorsOutlined /> Thông tin cơ bản
                                </Typography.Title>
                                
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item 
                                            label="Tiêu đề biểu ngữ" 
                                            name="title" 
                                            rules={[
                                                { required: true, message: "Tiêu đề không được để trống" },
                                                { max: 50, message: "Tiêu đề không quá 50 ký tự" }
                                            ]}
                                        >
                                            <Input placeholder="VD: Khuyến mãi mùa hè, Trái cây nhập khẩu..." size="large" prefix={<FontColorsOutlined style={{color: '#bfbfbf'}} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label="Thứ tự hiển thị" 
                                            name="order" 
                                            rules={[
                                                { required: true, message: "Thứ tự không được để trống" }
                                            ]}
                                        >
                                            <InputNumber 
                                                placeholder="VD: 1, 2, 3..." 
                                                size="large" 
                                                style={{ width: '100%' }} 
                                                min={1}
                                                prefix={<NumberOutlined style={{color: '#bfbfbf'}} />} 
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Typography.Title level={5} className="section-title" style={{ marginTop: 24 }}>
                                    <FileTextOutlined /> Mô tả biểu ngữ
                                </Typography.Title>
                                <Form.Item name="description" rules={[{ required: true, message: "Mô tả không được để trống" }]}>
                                    <Input.TextArea 
                                        rows={5} 
                                        placeholder="Nhập mô tả chi tiết cho chương trình ưu đãi hoặc thông điệp biểu ngữ..." 
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" onClick={() => navigate('/admin/banner')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large" 
                                        loading={isLoading}
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        Thêm mới
                                    </Button>
                                </Flex>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            )}
        </Flex >
    );
}

export default CreateBanner;