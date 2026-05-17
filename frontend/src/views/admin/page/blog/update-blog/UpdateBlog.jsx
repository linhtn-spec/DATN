import {
    PlusOutlined,
    CameraOutlined,
    PictureOutlined,
    SettingOutlined,
    FileTextOutlined,
    FormOutlined,
    EyeOutlined
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
import Editor from "../../../../../components/RichTextEditor/Editor";
import { queryClient } from "../../../../../main";
import { detailBlog, updateBlog } from "../../../../../services/blog_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import AdminHeader from "../../../components/AdminHeader";
import BlogFormSkeleton from "../BlogFormSkeleton";
import '../create-blog/CreateBlog.css';

export function UpdateBlog() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { blog_id } = useParams();
    const [blog, setBlog] = useState('');
    const [fileList, setFileList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { isSuccess, data, isFetching } = useQuery({
        queryKey: ['blog_detail', blog_id],
        queryFn: () => detailBlog(blog_id)
    });

    useEffect(() => {
        if (!isSuccess) return;
        form.setFieldValue("title", data?.data?.title);
        form.setFieldValue("content", data?.data?.content);
        form.setFieldValue("order", data?.data?.order);
        form.setFieldValue("isActive", data?.data?.isActive);
        
        if (data?.data?.image) {
            setFileList([{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: data.data.image,
            }]);
        }
        setBlog(data?.data?.content);
    }, [data, form, isSuccess]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateBlog(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật bài viết thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] });
            navigate('/admin/blog');
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Cập nhật bài viết thất bại!", type: "error" });
        }
    });

    const handleChange = (info) => {
        setFileList(info.fileList);
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            let imageUrl = '';
            if (fileList.length > 0) {
                if (fileList[0].originFileObj) {
                    const formData = new FormData();
                    formData.append('images', fileList[0].originFileObj);
                    const res = await uploadImage(formData);
                    imageUrl = res?.data?.images[0]?.url;
                } else {
                    imageUrl = fileList[0].url;
                }
            }
            
            mutate({ ...values, image: imageUrl, id: blog_id });
        } catch (error) {
            Notification({ message: "Lỗi cập nhật bài viết!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const showSkeleton = isFetching || isLoading;

    return (
        <Flex className="update_blog_panel container" vertical>
            <AdminHeader title="Cập nhật bài viết" icon={<PlusOutlined />} />
            
            {showSkeleton ? (
                <BlogFormSkeleton />
            ) : (
                <Form 
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    className="premium-form"
                    style={{ width: "100%" }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Visual & Display settings */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm media-card">
                                    <Typography.Title level={5} className="section-title">
                                        <PictureOutlined /> Ảnh đại diện bài viết
                                    </Typography.Title>
                                    
                                    <Form.Item
                                        name="image"
                                        style={{ marginBottom: 0 }}
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
                                                    <CameraOutlined />
                                                    <div style={{ marginTop: 8, fontWeight: 600 }}>Tải ảnh bìa (16:9)</div>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                </Card>

                                <Card bordered={false} className="glass-card shadow-sm visibility-card">
                                    <Typography.Title level={5} className="section-title">
                                        <SettingOutlined /> Thiết lập hiển thị
                                    </Typography.Title>
                                    
                                    <Form.Item
                                        name="order"
                                        label="Thứ tự hiển thị"
                                        rules={[
                                            { required: true, message: "Thứ tự không được để trống" }
                                        ]}
                                    >
                                        <InputNumber 
                                            placeholder="Thứ tự (VD: 0, 1, 2)" 
                                            size="large" 
                                            style={{ width: "100%" }}
                                            min={0}
                                        />
                                    </Form.Item>

                                    <Flex justify="space-between" align="center" style={{ padding: '8px 0', marginTop: 12 }}>
                                        <Typography.Text strong><EyeOutlined /> Trạng thái xuất bản</Typography.Text>
                                        <Form.Item name='isActive' valuePropName="checked" style={{ marginBottom: 0 }}>
                                            <Switch checkedChildren='Bật' unCheckedChildren="Tắt" />
                                        </Form.Item>
                                    </Flex>
                                    
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
                                        Khi tắt trạng thái xuất bản, bài viết sẽ được lưu dưới dạng bản nháp và không hiển thị trên blog khách hàng.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Editorial Details */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <FileTextOutlined /> Nội dung bài viết
                                </Typography.Title>

                                <Form.Item
                                    name="title"
                                    label="Tiêu đề bài viết"
                                    rules={[
                                        { required: true, message: "Tiêu đề không được để trống" },
                                        { min: 3, message: "Tối thiểu 3 ký tự" },
                                        { max: 200, message: "Tối đa 200 ký tự" }
                                    ]}
                                >
                                    <Input placeholder="Nhập tiêu đề bài viết..." size="large" prefix={<FormOutlined style={{ color: '#bfbfbf' }} />} />
                                </Form.Item>

                                <Form.Item
                                    name="content"
                                    label="Nội dung chi tiết"
                                    rules={[
                                        { required: true, message: "Nội dung bài viết không được để trống" },
                                        { min: 5, message: "Nội dung quá ngắn (Tối thiểu 5 ký tự)" },
                                        { max: 20000, message: "Nội dung quá dài (Tối đa 20000 ký tự)" }
                                    ]}
                                >
                                    <Editor isFetch={true} value={blog} onChange={setBlog} />
                                </Form.Item>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" onClick={() => navigate('/admin/blog')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large" 
                                        loading={isLoading}
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        Lưu thay đổi
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

export default UpdateBlog;