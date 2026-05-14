import {
    PlusOutlined,
    CameraOutlined
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
    Upload
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

function UpdateBlog() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { blog_id } = useParams()
    const [blog, setBlog] = useState('')
    const [fileList, setFileList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { isSuccess, data } = useQuery({
        queryKey: ['blog_detail', blog_id],
        queryFn: () => detailBlog(blog_id)
    })


    useEffect(() => {
        if (!isSuccess) return
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
        setBlog(data?.data?.content)
    }, [data, form, isSuccess]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateBlog(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật bài viết thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
            navigate('/admin/blog')
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const handleChange = (info) => {
        setFileList(info.fileList);
    }

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
    }
    return (
        <Flex className="update_blog_panel container" vertical>
            <AdminHeader title="Cập nhật bài viết" icon={<PlusOutlined />} />
            <Card
                title="Sửa nội dung bài viết"
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
                                    <Input placeholder="Tiêu đề" />
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
                                    <Editor isFetch={true} value={blog} onChange={setBlog} />
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
                                        Cập nhật
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
export default UpdateBlog;