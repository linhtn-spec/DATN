import {
    PlusOutlined
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
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
import { useNavigate } from "react-router";
import Editor from "../../../../../components/RichTextEditor/Editor";
import { queryClient } from "../../../../../main";
import { addBlog } from "../../../../../services/blog_service";
import Notification from "../../../../../utils/configToastify";
import './CreateBlog.css';
import { useState } from "react";
import { markdownToHtml } from "../../../../../components/RichTextEditor/parser";



function CreateBlog() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [value, setValue] = useState('');
    const { mutate } = useMutation({
        mutationFn: (data) => addBlog(data),
        onSuccess: () => {
            Notification({ message: "Add blog successfully!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
            navigate('/admin/blog', { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const handleSubmit = (value) => {
        mutate(value)
        // console.log(value);
    }



    return (
        <Flex className="add_blog_panel container" vertical>
            <h2 className='caption'><PlusOutlined />Add new blog</h2>
            <Card
                title="Create a new blog"
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form style={{ width: 450 }} onFinish={handleSubmit}
                        form={form}
                    >
                        <Flex vertical align="center" style={{ width: "100%" }}>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Title</Typography.Title>
                                <Form.Item
                                    name="title"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Title must be not empty"

                                        },
                                        {
                                            min: 5,
                                            message: "Minimum 5 character"
                                        },

                                    ]}
                                >
                                    <Input name="name" placeholder="Name" />
                                </Form.Item>
                            </Flex>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Content</Typography.Title>
                                <Form.Item
                                    name="content"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Content must be not empty"
                                        },
                                        {
                                            min: 5,
                                            message: "Minimum 5 character"
                                        }
                                    ]}
                                    hasFeedback >
                                    <Editor isFetch={false} />

                                </Form.Item>

                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>

                                <Typography.Title level={5}>Order</Typography.Title>
                                <Flex style={{ width: "100%" }} gap={50}>
                                    <Form.Item
                                        hasFeedback
                                        validateDebounce={1500}
                                        name="order"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Order must be not empty or negative number",
                                                pattern: new RegExp(/^[0-9]+$/)

                                            }
                                        ]}
                                    >
                                        <InputNumber placeholder="Order" />
                                    </Form.Item>
                                    <Flex gap={10}>
                                        <Form.Item name='isActive'>
                                            <Switch checkedChildren='Active' unCheckedChildren="Deactive" />
                                        </Form.Item>
                                        <Typography.Title level={5}>Status</Typography.Title>

                                    </Flex>
                                </Flex>
                            </Flex>
                            <Form.Item>
                                <Flex justify="center" gap={20} className="group_btn">
                                    <Button type="primary" htmlType="submit">
                                        Add new
                                    </Button>
                                    <Button htmlType="reset">Reset</Button>
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