import {
    CameraOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Flex,
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    Typography,
    Upload
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { queryClient } from "../../../../../main";
import { optionCategory } from "../../../../../services/category_service";
import { addProduct } from "../../../../../services/product_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './CreateProduct.css';
import axios from "axios";

function CreateProduct() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const [options, setOptions] = useState([])

    const [categories, setCategories] = useState([])
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false)



    const queryCountry = useQuery({
        queryKey: ['countries_product_create'],
        queryFn: () => axios.get('https://countriesnow.space/api/v0.1/countries/capital'),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false
    })

    const optionsCategories = useQuery({
        queryKey: ["categories_option"],
        queryFn: () => optionCategory(),
    })


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
            setAvatar(rs?.data?.images.map(item => (item.url)))
            setFileList(e.fileList.map(file => ({
                ...file,
                status: 'done'
            })));
            setIsLoading(false)

        } catch (error) {
            setFileList(e.fileList.map(file => ({
                ...file,
                status: 'error'
            })));
            console.log(error.message);
        }
    }

    const { mutate } = useMutation({
        mutationFn: (data) => addProduct(data),
        onSuccess: () => {
            Notification({ message: "Add product successfully!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['products_admin'] })
            navigate('/admin/product', { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const handleSubmit = (value) => {
        mutate({ ...value, images: avatar });
    }


    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['images'])
            setAvatar('')
        }

    }, [fileList.length, form])

    useEffect(() => {
        if (!queryCountry?.isSuccess) return
        const rawData = queryCountry?.data?.data?.data
        setOptions(rawData?.map(item => ({ value: item?.name, text: item?.name })))

    }, [queryCountry?.isSuccess, queryCountry?.data, setOptions])

    useEffect(() => {
        if (!optionsCategories?.isSuccess) return
        const rawData = optionsCategories?.data?.data?.data
        setCategories(rawData?.map(item => ({ value: item?._id, label: item?.name })))

    }, [optionsCategories?.isSuccess, optionsCategories?.data, setCategories])
    return (
        <Flex className="add_product_panel container" vertical>
            <h2 className='caption'><PlusOutlined />Add new product</h2>
            <Card
                title="Create a new product"
                bordered={false}
                className="form"
            >
                <Flex justify="center" >
                    <Form style={{ width: 450 }} onFinish={handleSubmit}
                        form={form}
                    >
                        <Flex vertical align="center" style={{ width: "100%" }}>
                            <Form.Item
                                name="images"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: "Please upload an image"
                                    }
                                ]}
                            >
                                <Upload
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={handleChange}
                                    style={{
                                        justifyContent: "center"
                                    }}
                                    multiple
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
                                            message: "Name must be not empty"

                                        },
                                        {
                                            min: 3,
                                            message: "Minimum 3 characters"
                                        },
                                        {
                                            max: 50,
                                            message: "Maximum 50 character"
                                        }
                                    ]}
                                >
                                    <Input placeholder="Name" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Category</Typography.Title>
                                <Form.Item
                                    name="categoryId"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Category must be not empty"

                                        }
                                    ]}
                                >
                                    <Select virtual={false}
                                        placeholder="Category" size="small" style={{ height: "31px" }} options={categories} allowClear />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Origin</Typography.Title>
                                <Form.Item
                                    name="origin"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Origin must be not empty"

                                        }
                                    ]}
                                >
                                    <Select placeholder="Origin" size="small" style={{ height: "31px" }} options={options} allowClear
                                        showSearch
                                        virtual={false}
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.text ?? '').includes(input)}
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.text ?? '').toLowerCase().localeCompare((optionB?.text ?? '').toLowerCase())
                                        }
                                    />
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
                                <Typography.Title level={5}>Unit</Typography.Title>
                                <Form.Item
                                    name="unit"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Unit must be not empty"
                                        },
                                        {
                                            min: 1,
                                            message: "Minimum 1 character"
                                        },
                                        {
                                            max: 20,
                                            message: "Maximum 20 characters"
                                        }
                                    ]}
                                    hasFeedback >
                                    <Input placeholder="Unit" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Price</Typography.Title>
                                <Form.Item
                                    hasFeedback
                                    validateDebounce={1500}
                                    name="price"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Price must be not empty or negative number",
                                            pattern: new RegExp(/^[0-9]+$/)

                                        }
                                    ]}
                                >
                                    <InputNumber placeholder="Price" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Flex gap={10}>
                                    <Form.Item name='isActive'>
                                        <Switch checkedChildren='Active' unCheckedChildren="Deactive" />
                                    </Form.Item>
                                    <Typography.Title level={5}>Status</Typography.Title>

                                </Flex>
                            </Flex>
                            <Form.Item>
                                <Flex justify="center" gap={20} className="group_btn">
                                    <Button type="primary" htmlType="submit" disabled={isLoading} >
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
export default CreateProduct;