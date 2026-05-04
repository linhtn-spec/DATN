import {
    CameraOutlined,
    PlusOutlined,
} from "@ant-design/icons";
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
import { useNavigate } from "react-router";
import { uploadImage } from "../../../../../services/upload_service";
import './CreateCategory.css';
import Notification from "../../../../../utils/configToastify";
import { addCategory } from "../../../../../services/category_service";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../../main";

function CreateCategory() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
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
            setFileList(e.fileList.map(file => ({
                ...file,
                status: 'error'
            })));
            console.log(error.message);
        }
    }
    const { mutate } = useMutation({
        mutationFn: (data) => addCategory(data),
        onSuccess: () => {
            Notification({ message: "Thêm danh mục thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['category_admin'] })
            navigate('/admin/category', { replace: true })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Đã xảy ra lỗi", type: "error" })
        }
    })

    const handleSubmit = (value) => {
        mutate({ ...value, image: avatar })
    }

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
            setAvatar('')
        }

    }, [fileList.length, form])
    return (
        <Flex className="add_category_panel container" vertical>
            <h2 className='caption'><PlusOutlined />Thêm danh mục mới</h2>
            <Card
                title="Thông tin danh mục"
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
                                        message: "Vui lòng tải lên hình ảnh đại diện"
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
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </button>
                                </Upload>
                            </Form.Item>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Tên danh mục</Typography.Title>
                                <Form.Item
                                    name="name"
                                    hasFeedback
                                    validateDebounce={1500}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Tên danh mục không được để trống"

                                        },
                                        {
                                            min: 1,
                                            message: "Tên danh mục quá ngắn"
                                        },
                                        {
                                            max: 50,
                                            message: "Tên danh mục không quá 50 ký tự"
                                        }
                                    ]}
                                >
                                    <Input name="name" placeholder="Nhập tên danh mục" />
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
                                    <Input.TextArea allowClear placeholder="Nhập mô tả danh mục" style={{
                                        height: 120,
                                    }} />
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
                                                message: "Vui lòng nhập số thứ tự",
                                                pattern: new RegExp(/^[0-9]+$/)

                                            }
                                        ]}
                                    >
                                        <InputNumber placeholder="Thứ tự" min={1} />
                                    </Form.Item>
                                    <Flex gap={10} align="center">
                                        <Form.Item name='isActive' valuePropName="checked" style={{ marginBottom: 0 }}>
                                            <Switch checkedChildren='Hiển thị' unCheckedChildren="Ẩn" />
                                        </Form.Item>
                                        <Typography.Title level={5} style={{ margin: 0 }}>Trạng thái</Typography.Title>
                                    </Flex>
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
export default CreateCategory;