import {
    PlusOutlined,
    CameraOutlined
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
    Upload
} from 'antd';
import Card from "antd/es/card/Card";
import { useState } from "react";
import { useNavigate } from "react-router";
import Editor from "../../../../../components/RichTextEditor/Editor";
import { queryClient } from "../../../../../main";
import { addBlog } from "../../../../../services/blog_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './CreateBlog.css';
import AdminHeader from "../../../components/AdminHeader";



function CreateBlog() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { mutate } = useMutation({
        mutationFn: (data) => addBlog(data),
        onSuccess: () => {
            Notification({ message: "Thêm bài viết thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
            navigate('/admin/blog', { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Thêm bài viết thất bại!", type: "error" })
        }
    })

    const handleChange = (info) => {
        setFileList(info.fileList);
    }

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            let imageUrl = '';
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const formData = new FormData();
                formData.append('images', fileList[0].originFileObj);
                const res = await uploadImage(formData);
                imageUrl = res?.data?.images[0]?.url;
            }
            
            mutate({ ...values, image: imageUrl });
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh bài viết!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <Flex className="add_blog_panel container" vertical>
            <AdminHeader title="Thêm bài viết mới" icon={<PlusOutlined />} />
            <Card
                title="Tạo bài viết mới"
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form style={{ width: 450 }} onFinish={handleSubmit}
                        form={form}
                    >
                        <Flex vertical align="center" style={{ width: "100%" }}>
                            <Form.Item
                                name="image"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng tải lên ảnh bài viết"
                                    }
                                ]}
                            >
                                <Upload
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={handleChange}
                                    maxCount={1}
                                    accept='image/*'
                                >
                                    {fileList.length < 1 && (
                                        <button
                                            style={{
                                                border: 0,
                                                background: 'none',
                                            }}
                                            type="button"
                                        >
                                            <CameraOutlined style={{ fontSize: "40px", color: 'grey' }} />
                                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                        </button>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Tiêu đề</Typography.Title>
                                <Form.Item
                                    name="title"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Tiêu đề không được để trống"

                                        },
                                        {
                                            min: 1,
                                            message: "Tối thiểu 3 ký tự"
                                        },
                                        {
                                            max: 200,
                                            message: "Tối đa 200 ký tự"
                                        }

                                    ]}
                                >
                                    <Input placeholder="Nhập tiêu đề" />
                                </Form.Item>
                            </Flex>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Nội dung</Typography.Title>
                                <Form.Item
                                    name="content"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Nội dung không được để trống"
                                        },
                                        {
                                            min: 1,
                                            message: "Tối thiểu 5 ký tự"
                                        },
                                        {
                                            max: 20000,
                                            message: "Tối đa 20000 ký tự"
                                        }
                                    ]}
                                    hasFeedback >
                                    <Editor isFetch={false} />

                                </Form.Item>

                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>

                                <Typography.Title level={5}>Thứ tự hiển thị</Typography.Title>
                                <Flex style={{ width: "100%" }} gap={50}>
                                    <Form.Item
                                        hasFeedback
                                        validateDebounce={1500}
                                        name="order"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Thứ tự không được để trống",
                                                pattern: new RegExp(/^[0-9]+$/)

                                            }
                                        ]}
                                    >
                                        <InputNumber placeholder="Thứ tự" />
                                    </Form.Item>
                                    <Flex gap={10}>
                                        <Form.Item name='isActive' valuePropName="checked">
                                            <Switch checkedChildren='Bật' unCheckedChildren="Tắt" />
                                        </Form.Item>
                                        <Typography.Title level={5}>Trạng thái</Typography.Title>

                                    </Flex>
                                </Flex>
                            </Flex>
                            <Form.Item>
                                <Flex justify="center" gap={20} className="group_btn">
                                    <Button type="primary" htmlType="submit" loading={isLoading}>
                                        Thêm mới
                                    </Button>
                                    <Button htmlType="reset" onClick={() => setFileList([])}>Làm mới</Button>
                                </Flex>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}
export default CreateBlog;