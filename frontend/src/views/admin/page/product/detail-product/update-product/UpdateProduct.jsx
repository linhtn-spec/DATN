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
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { queryClient } from "../../../../../../main";
import { optionCategory } from "../../../../../../services/category_service";
import { detailProduct, updateProduct } from "../../../../../../services/product_service";
import { uploadImage } from "../../../../../../services/upload_service";
import Notification from "../../../../../../utils/configToastify";
import './UpdateProduct.css';
import AdminHeader from "../../../../components/AdminHeader";

function UpdateProduct() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const [options, setOptions] = useState([])

    const [categories, setCategories] = useState([])
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false)

    const { product_id } = useParams()


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

    const getProduct = useQuery({
        queryKey: ['product_detail_admin', product_id],
        queryFn: () => detailProduct(product_id),
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
            setAvatar(avatar.concat(rs?.data?.images.map(item => (item.url))))
            setFileList(fileList.concat(rs?.data?.images.map((item, index) => ({
                uid: index, name: `image${index}.png`,
                url: item?.url, status: 'done'
            }))));
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
        mutationFn: (data) => updateProduct(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật sản phẩm thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['products_admin'] })
            navigate('/admin/product', { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })
    const handleSubmit = (value) => {
        if (!isLoading) {
            mutate({ ...value, images: avatar, id: product_id });
        }
    }


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

    useEffect(() => {
        if (!getProduct?.isSuccess) return
        const rawData = getProduct?.data?.data
        form.setFieldValue('images', rawData?.images)
        form.setFieldValue('name', rawData?.name)
        form.setFieldValue('categoryId', rawData?.categoryId?._id)
        form.setFieldValue('origin', rawData?.origin)
        form.setFieldValue('description', rawData?.description)
        form.setFieldValue('isActive', rawData?.isActive)
        form.setFieldValue('unit', rawData?.unit)
        form.setFieldValue('price', rawData?.price)
        form.setFieldValue('importPrice', rawData?.importPrice)
        setFileList(
            rawData?.images.map((item, index) => ({
                uid: `${index}`,
                name: `image${index}.png`,
                url: item,
            })))
        setAvatar(rawData?.images)
        return () => {
            setAvatar([])
            setFileList([])
        }
    }, [getProduct?.isSuccess, getProduct?.data, form])

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
            setAvatar('')
        }

    }, [fileList.length, form])

    return (
        <Flex className="add_product_panel container" vertical>
            <Card
                title="Cập nhật sản phẩm"
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
                                        message: "Vui lòng tải lên hình ảnh"
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
                                <Typography.Title level={5}>Tên sản phẩm</Typography.Title>
                                <Form.Item
                                    name="name"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Tên không được để trống"

                                        },
                                        {
                                            min: 1,
                                            message: "Minimum 3 characters"
                                        },
                                        {
                                            max: 50,
                                            message: "Maximum 50 character"
                                        }
                                    ]}
                                >
                                <Input placeholder="Tên sản phẩm" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Danh mục</Typography.Title>
                                <Form.Item
                                    virtual={false}

                                    name="categoryId"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Danh mục không được để trống"

                                        }
                                    ]}
                                >
                                    <Select
                                        virtual={false}

                                        placeholder="Danh mục" size="small" style={{ height: "31px" }} options={categories} allowClear />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Xuất xứ</Typography.Title>
                                <Form.Item

                                    name="origin"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Xuất xứ không được để trống"

                                        },
                                        {
                                            min: 1,
                                            message: "Origin has at least 5 character"
                                        },
                                        {
                                            max: 300,
                                            message: "Origin has maximum 300 character"
                                        }
                                    ]}
                                >
                                <Select placeholder="Xuất xứ" size="small" style={{ height: "31px" }} options={options} allowClear
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
                                <Typography.Title level={5}>Mô tả</Typography.Title>
                                <Form.Item
                                    name="description"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Mô tả không được để trống"
                                        },
                                        {
                                            min: 1,
                                            message: "Minimum 5 character"
                                        },
                                        {
                                            max: 300,
                                            message: "Maximum 300 character"
                                        }
                                    ]}
                                    hasFeedback >
                                    <Input.TextArea allowClear placeholder="Mô tả" style={{
                                        height: 120,
                                    }} />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Đơn vị</Typography.Title>
                                <Form.Item
                                    name="unit"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Đơn vị không được để trống"
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
                                    <Input placeholder="Đơn vị" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Giá bán (VNĐ)</Typography.Title>
                                <Form.Item
                                    hasFeedback
                                    validateDebounce={1500}
                                    name="price"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Giá không được để trống hoặc là số âm",

                                        },
                                        {
                                            type: 'number',
                                            min: 1000,
                                            message: "Giá phải ít nhất là 1,000 VNĐ"
                                        }
                                    ]}
                                >
                                    <InputNumber 
                                        placeholder="Nhập giá bán" 
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Flex gap={10}>
                                    <Form.Item name='isActive'>
                                        <Switch checkedChildren='Hoạt động' unCheckedChildren="Khóa" />
                                    </Form.Item>
                                    <Typography.Title level={5}>Trạng thái</Typography.Title>

                                </Flex>
                            </Flex>
                            <Form.Item>
                                <Flex justify="center" gap={20} className="group_btn">
                                    <Button type="primary" htmlType="submit" disabled={isLoading} >
                                        Cập nhật
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
export default UpdateProduct;