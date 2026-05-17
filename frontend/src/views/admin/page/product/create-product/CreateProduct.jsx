import {
    CameraOutlined,
    PlusOutlined,
    ShoppingOutlined,
    TagsOutlined,
    GlobalOutlined,
    FileTextOutlined,
    MoneyCollectOutlined,
    CheckCircleOutlined,
    InboxOutlined
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
    Upload,
    Row,
    Col,
    Divider
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
import ProductFormSkeleton from "../ProductFormSkeleton";

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
    const isFetching = isLoading || queryCountry.isFetching || optionsCategories.isFetching;

    return (
        <Flex className="create-product-container container" vertical>
            <AdminHeader title="Thêm sản phẩm mới" icon={<PlusOutlined />} />

            {isFetching ? (
                <ProductFormSkeleton />
            ) : (
                <Form
                    onFinish={handleSubmit}
                    form={form}
                    layout="vertical"
                    className="premium-form"
                    initialValues={{ isActive: true }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Visuals & Core Info */}
                        <Col xs={24} lg={9}>
                            <Flex vertical gap={24}>
                                <Card bordered={false} className="glass-card shadow-sm image-card">
                                    <Typography.Title level={5} className="section-title">
                                        <CameraOutlined /> Hình ảnh sản phẩm
                                    </Typography.Title>
                                    <Form.Item
                                        name="images"
                                        rules={[{ required: true, message: "Vui lòng tải lên ít nhất 1 hình ảnh" }]}
                                    >
                                        <Upload
                                            beforeUpload={() => false}
                                            listType="picture-card"
                                            fileList={fileList}
                                            onChange={handleChange}
                                            multiple
                                            accept='image/*'
                                            className="premium-upload"
                                        >
                                            {fileList.length < 8 && (
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
                                    <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
                                        Sản phẩm bị khóa sẽ không hiển thị trên cửa hàng và không thể đặt mua.
                                    </Typography.Paragraph>
                                </Card>
                            </Flex>
                        </Col>

                        {/* Right Column: Detailed Specs */}
                        <Col xs={24} lg={15}>
                            <Card bordered={false} className="glass-card shadow-sm details-card">
                                <Typography.Title level={5} className="section-title">
                                    <ShoppingOutlined /> Thông tin cơ bản
                                </Typography.Title>

                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: "Tên không được để trống" }, { max: 200, message: "Tên sản phẩm không quá 200 ký tự" }]}>
                                            <Input placeholder="VD: Sầu riêng Ri6 1kg..." size="large" prefix={<ShoppingOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: "Danh mục không được để trống" }]}>
                                            <Select placeholder="Chọn danh mục" size="large" options={categories} prefix={<TagsOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Xuất xứ" name="origin" rules={[{ required: true, message: "Xuất xứ không được để trống" }]}>
                                            <Select
                                                showSearch
                                                placeholder="Chọn quốc gia"
                                                size="large"
                                                options={options}
                                                prefix={<GlobalOutlined />}
                                                filterOption={(input, option) => (option?.text ?? '').toLowerCase().includes(input.toLowerCase())}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Typography.Title level={5} className="section-title" style={{ marginTop: 24 }}>
                                    <MoneyCollectOutlined /> Giá & Đơn vị
                                </Typography.Title>

                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Giá bán (VNĐ)" name="price" rules={[{ required: true, message: "Giá bán không được để trống" }, { type: 'number', min: 1000, message: "Tối thiểu 1,000 VNĐ" }]}>
                                            <InputNumber
                                                size="large"
                                                style={{ width: '100%' }}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Đơn vị tính" name="unit" rules={[{ required: true, message: "Đơn vị không được để trống" }]}>
                                            <Input placeholder="VD: Chai, Hộp, Cái..." size="large" prefix={<InboxOutlined style={{ color: '#bfbfbf' }} />} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Typography.Title level={5} className="section-title" style={{ marginTop: 24 }}>
                                    <FileTextOutlined /> Mô tả sản phẩm
                                </Typography.Title>
                                <Form.Item name="description" rules={[{ required: true, message: "Mô tả không được để trống" }]}>
                                    <Input.TextArea
                                        rows={6}
                                        placeholder="Nhập mô tả chi tiết về công dụng, thành phần, cách dùng..."
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>

                                <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
                                    <Button size="large" htmlType="reset">
                                        Nhập lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        loading={isLoading}
                                        style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
                                    >
                                        Thêm mới
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
export default CreateProduct;