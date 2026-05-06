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
import AdminHeader from "../../../components/AdminHeader";

function CreateProduct() {
    const navigate = useNavigate();

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


    const handleChange = (e) => {
        setFileList(e.fileList);
    }

    const { mutate } = useMutation({
        mutationFn: (data) => addProduct(data),
        onSuccess: () => {
            Notification({ message: "Thêm sản phẩm thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['products_admin'] })
            navigate('/admin/product', { replace: true })
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

            let finalImages = [];
            if (Array.from(formData.entries()).length > 0) {
                const rs = await uploadImage(formData);
                finalImages = rs?.data?.images.map(item => item.url);
            }

            mutate({ ...value, images: finalImages });
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['images'])
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
            <AdminHeader title="Thêm sản phẩm mới" icon={<PlusOutlined />} />
            <Card
                title="Thông tin sản phẩm"
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
                                        message: "Vui lòng tải lên ít nhất một hình ảnh"
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
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
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
                                            message: "Tên sản phẩm không được để trống"

                                        },
                                        {
                                            min: 1,
                                            message: "Tên sản phẩm quá ngắn"
                                        },
                                        {
                                            max: 100,
                                            message: "Tên sản phẩm không quá 100 ký tự"
                                        }
                                    ]}
                                >
                                    <Input placeholder="Nhập tên sản phẩm" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Danh mục</Typography.Title>
                                <Form.Item
                                    name="categoryId"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn danh mục"

                                        }
                                    ]}
                                >
                                    <Select virtual={false}
                                        placeholder="Chọn danh mục" size="small" style={{ height: "31px" }} options={categories} allowClear />
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
                                            message: "Vui lòng chọn xuất xứ"

                                        }
                                    ]}
                                >
                                    <Select placeholder="Chọn quốc gia" size="small" style={{ height: "31px" }} options={options} allowClear
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
                                        }
                                    ]}
                                    hasFeedback >
                                    <Input.TextArea allowClear placeholder="Nhập mô tả sản phẩm" style={{
                                        height: 120,
                                    }} />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Đơn vị tính</Typography.Title>
                                <Form.Item
                                    name="unit"
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Đơn vị tính không được để trống"
                                        }
                                    ]}
                                    hasFeedback >
                                    <Input placeholder="Ví dụ: kg, hộp, túi..." />
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
                                            message: "Giá bán không được để trống",
                                        },
                                        {
                                            type: 'number',
                                            min: 1000,
                                            message: "Giá bán tối thiểu là 1,000 VNĐ"
                                        }
                                    ]}
                                >
                                    <InputNumber 
                                        placeholder="Nhập giá" 
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Flex gap={10} align="center">
                                    <Form.Item name='isActive' valuePropName="checked" style={{ marginBottom: 0 }}>
                                        <Switch checkedChildren='Đang bán' unCheckedChildren="Ngừng bán" />
                                    </Form.Item>
                                    <Typography.Title level={5} style={{ margin: 0 }}>Trạng thái kinh doanh</Typography.Title>
                                </Flex>
                            </Flex>
                            <Form.Item style={{ marginTop: 24, width: '100%' }}>
                                <Flex justify="center" gap={20} className="group_btn">
                                    <Button type="primary" htmlType="submit" disabled={isLoading} size="large" style={{ minWidth: 120 }}>
                                        Thêm mới
                                    </Button>
                                    <Button htmlType="reset" size="large" style={{ minWidth: 120 }}>Nhập lại</Button>
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