import {
    CameraOutlined,
    PlusOutlined,
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
import { queryClient } from "../../../../../main";
import { detailCategory, updateCategory } from "../../../../../services/category_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './UpdateCategory.css';

function UpdateCategory() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const { category_id } = useParams()
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = async (e) => {

        setFileList(e.fileList.map(file => ({
            ...file,
            status: 'uploading'
        })));
        setIsLoading(true)
        const formData = new FormData();
        e.fileList.forEach((file) => {
            formData.append('images', file.originFileObj);
        });
        try {
            if (Array.from(formData.entries()).length === 0) return
            const rs = await uploadImage(formData);
            setAvatar(rs?.data?.images[0]?.url)

            setFileList(e.fileList.map(file => ({
                ...file,
                status: 'done'
            })));
            setIsLoading(false)
        } catch (error) {
            console.log(error.message);
        }
    }
    const { isSuccess, data } = useQuery({
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
        setAvatar(data?.data?.image)

        return () => {
            setFileList([])
            setAvatar('')
        }
    }, [data, isSuccess, form, setFileList]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateCategory(data),
        onSuccess: () => {
            Notification({ message: "Update category sucessfully", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['category_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
            setAvatar('')
        }

    }, [fileList.length, form])

    const handleSubmit = (e) => {
        if (!isLoading) {
            mutate({ ...e, image: avatar, id: category_id });
            navigate('/admin/category')
        }
        return
    }

    return (
        <Flex className="update_category_panel container" vertical>
            <h2 className='caption'><PlusOutlined />Update a category</h2>
            <Card
                title="Update a category"
                bordered={false}
            >
                <Flex justify="center">
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
                                        message: "Please upload an image"
                                    }
                                ]}
                                style={{ width: "auto" }}
                            >
                                <Upload
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={handleChange}
                                    style={{
                                        justifyContent: "center"
                                    }}
                                    maxCount={1}
                                    accept='image/*'
                                >
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        <CameraOutlined style={{ fontSize: "40px", color: 'grey' }} />
                                    </button>
                                </Upload>
                            </Form.Item>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Name</Typography.Title>
                                <Form.Item
                                    name="name"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "name must be not empty"

                                        },
                                        {
                                            min: 3,
                                            message: "Minimum 3 character"
                                        },
                                        {
                                            max: 50,
                                            message: "Maximum 50 character"
                                        }
                                    ]}
                                >
                                    <Input name="name" placeholder="Name" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Description</Typography.Title>
                                <Form.Item
                                    name="description"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Description must be not empty"
                                        },
                                        {
                                            min: 5,
                                            message: "Minimum 5 character"
                                        },
                                        {
                                            max: 300,
                                            message: "Maximum 300 character"
                                        }
                                    ]}
                                    hasFeedback >
                                    <Input.TextArea allowClear placeholder="Description" style={{
                                        height: 120,
                                    }} />
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
                                <Flex justify="center" gap={10} className="group_btn">
                                    <Button type="primary" htmlType="submit" disabled={isLoading}>
                                        Update
                                    </Button>
                                </Flex>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}
export default UpdateCategory;