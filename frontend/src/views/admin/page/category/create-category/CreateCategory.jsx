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
    Upload,
    Skeleton
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './CreateCategory.css';
import AdminHeader from "../../../components/AdminHeader";
import { addCategory } from "../../../../../services/category_service";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../../main";

function CreateCategory() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFileList(e.fileList);
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

    const handleSubmit = async (value) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            let finalImageUrl = ''; // Expecting maximum 1 image for Category
            if (Array.from(formData.entries()).length > 0) {
                const rs = await uploadImage(formData);
                finalImageUrl = rs?.data?.images[0]?.url || '';
            }

            mutate({ ...value, image: finalImageUrl });
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
        }

    }, [fileList.length, form])
    return (
        <Flex className="add_category_panel container" vertical>
            <AdminHeader title="Thêm danh mục mới" icon={<PlusOutlined />} />
            <Card
                title="Thông tin danh mục"
                bordered={false}
                className="form"
            >
                {isLoading ? (
                    <Flex justify="center">
                        <Flex vertical align="center" style={{ width: 450 }}>
                            <div style={{ marginBottom: 24 }}>
                                <Skeleton.Node active style={{ width: 104, height: 104 }}>
                                    <CameraOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                                </Skeleton.Node>
                            </div>
                            <Flex vertical style={{ width: "100%", marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 8 }} />
                                <Skeleton.Input active block />
                            </Flex>
                            <Flex vertical style={{ width: "100%", marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 60, marginBottom: 8 }} />
                                <Skeleton.Node active style={{ width: '100%', height: 120 }} />
                            </Flex>
                            <Flex vertical style={{ width: "100%", marginBottom: 24 }}>
                                <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 8 }} />
                                <Flex style={{ width: "100%" }} gap={50} align="center">
                                    <Skeleton.Input active style={{ width: 90 }} />
                                    <Flex gap={10} align="center">
                                        <Skeleton.Button active size="small" shape="round" style={{ width: 44 }} />
                                        <Skeleton.Input active size="small" style={{ width: 80 }} />
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Flex justify="center" gap={20} style={{ width: '100%', marginTop: 24 }}>
                                <Skeleton.Button active size="large" style={{ width: 120 }} />
                                <Skeleton.Button active size="large" style={{ width: 120 }} />
                            </Flex>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex justify="center" >
                    <Form style={{ width: 450 }} onFinish={handleSubmit}
                        form={form}
                        initialValues={{ isActive: true }}
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
                                    <Button type="primary" htmlType="submit" disabled={isLoading} loading={isLoading} size="large" style={{ minWidth: 120 }}>
                                        Thêm mới
                                    </Button>
                                    <Button htmlType="reset" size="large" style={{ minWidth: 120 }}>Nhập lại</Button>
                                </Flex>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Flex>
                )}
            </Card>
        </Flex >
    );
}
export default CreateCategory;