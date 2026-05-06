import {
    PlusOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Flex,
    Form,
    Input,
    InputNumber,
    Switch,
    Typography
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Editor from "../../../../../components/RichTextEditor/Editor";
import { queryClient } from "../../../../../main";
import { detailBlog, updateBlog } from "../../../../../services/blog_service";
import Notification from "../../../../../utils/configToastify";
import AdminHeader from "../../../components/AdminHeader";

function UpdateBlog() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { blog_id } = useParams()
    const [blog, setBlog] = useState('')

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
        setBlog(data?.data?.content)
    }, [data, form, isSuccess]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateBlog(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật bài viết thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })
    const handleSubmit = (e) => {
        mutate({ ...e, id: blog_id });
        navigate('/admin/blog')
    }
    return (
        <Flex className="update_blog_panel container" vertical>
            <AdminHeader title="Cập nhật bài viết" icon={<PlusOutlined />} />
            <Card
                title="Cập nhật bài viết mới"
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form style={{ width: 450 }} onFinish={handleSubmit}
                        form={form}
                    >
                        <Flex vertical align="center" style={{ width: "100%" }}>
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
                                            message: "Minimum 3 character"
                                        },
                                        {
                                            max: 200,
                                            message: "Maximum 200 characters"
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
                                            message: "Minimum 5 character"
                                        },
                                        {
                                            max: 20000,
                                            message: "Maximum 20000 characters"
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
                                                message: "Thứ tự không được để trống hoặc là số âm",
                                                pattern: new RegExp(/^[0-9]+$/)

                                            }
                                        ]}
                                    >
                                        <InputNumber placeholder="Thứ tự" />
                                    </Form.Item>
                                    <Flex gap={10}>
                                        <Form.Item name='isActive'>
                                            <Switch checkedChildren='Bật' unCheckedChildren="Tắt" />
                                        </Form.Item>
                                        <Typography.Title level={5}>Trạng thái</Typography.Title>

                                    </Flex>
                                </Flex>
                            </Flex>
                            <Form.Item>
                                <Flex justify="center" gap={20} className="group_btn">
                                    <Button type="primary" htmlType="submit">
                                        Cập nhật
                                    </Button>
                                    <Button htmlType="reset">Làm mới</Button>
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