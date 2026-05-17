import {
    CameraOutlined,
    PlusOutlined,
    TagsOutlined,
    NumberOutlined,
    FileTextOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useNavigate, useParams } from "react-router";
import { queryClient } from "../../../../../main";
import { detailCategory, updateCategory } from "../../../../../services/category_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './UpdateCategory.css';
import AdminHeader from "../../../components/AdminHeader";
import CategoryFormSkeleton from "../CategoryFormSkeleton";

function UpdateCategory() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const { category_id } = useParams()
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFileList(e.fileList);
    }
    const { isSuccess, data, isLoading: isFetching } = useQuery({
        queryKey: ['category_detail', category_id],
        queryFn: () => detailCategory(category_id)
    })

    useEffect(() => {
        if (!isSuccess) return
        form.setFieldValue("image", data?.data?.image);
        form.setFieldValue("name", data?.data?.name);
        form.setFieldValue("description", data?.data?.description);
        form.setFieldValue("order", data?.data?.order);
        form.setFieldValue("isActive", data?.data?.isActive);
        setFileList([{
            uid: '1',
            name: 'image.png',
            url: data?.data?.image,
        },])

        return () => {
            setFileList([])
        }
    }, [data, isSuccess, form, setFileList]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateCategory(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật danh mục thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['category_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
        }

    }, [fileList.length, form])

    const handleSubmit = async (e) => {
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
            mutate({ ...e, image: finalImage, id: category_id });
            navigate('/admin/category')
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    const showSkeleton = isFetching || isLoading;

    return (
        <Flex className="update_category_panel container" vertical>
            <AdminHeader title="Cập nhật danh mục" icon={<PlusOutlined />} />
            
            {showSkeleton ? (
                <CategoryFormSkeleton />
            ) : (
                <Form 
                    onFinish={handleSubmit}
                    form={form}
                    layout="vertical"
                    className="premium-form"
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Visuals & Status */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm image-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CameraOutlined /> Hình ảnh danh mục
                                    </Typography.Title>
                                    <Form.Item
                                        name="image"
                                        rules={[{ required: true, message: "Vui lòng tải lên hình ảnh đại diện" }]}
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
                                                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
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
                                        Danh mục bị khóa sẽ không hiển thị trên cửa hàng và các sản phẩm thuộc danh mục này cũng sẽ tạm ẩn.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Detailed Specs */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <TagsOutlined /> Thông tin cơ bản
                                </Typography.Title>
                                
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item 
                                            label="Tên danh mục" 
                                            name="name" 
                                            rules={[
                                                { required: true, message: "Tên danh mục không được để trống" },
                                                { max: 50, message: "Tên danh mục không quá 50 ký tự" }
                                            ]}
                                        >
                                            <Input placeholder="VD: Trái cây tươi, Rau củ hữu cơ..." size="large" prefix={<TagsOutlined style={{color: '#bfbfbf'}} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label="Thứ tự hiển thị" 
                                            name="order" 
                                            rules={[
                                                { required: true, message: "Vui lòng nhập số thứ tự" }
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
                                    <FileTextOutlined /> Mô tả danh mục
                                </Typography.Title>
                                <Form.Item name="description" rules={[{ required: true, message: "Mô tả không được để trống" }]}>
                                    <Input.TextArea 
                                        rows={5} 
                                        placeholder="Nhập mô tả chi tiết về danh mục..." 
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" onClick={() => navigate('/admin/category')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large" 
                                        loading={isLoading}
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        Cập nhật danh mục
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

export default UpdateCategory;