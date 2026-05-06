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
import { detailBanner, updateBanner } from "../../../../../services/banner_service";
import { uploadImage } from "../../../../../services/upload_service";
import Notification from "../../../../../utils/configToastify";
import './UpdateBanner.css';
import AdminHeader from "../../../components/AdminHeader";

function UpdateBanner() {
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();
    const { banner_id } = useParams()
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFileList(e.fileList);
    }

    const { isSuccess, data } = useQuery({
        queryKey: ['banner_detail', banner_id],
        queryFn: () => detailBanner(banner_id)
    })

    useEffect(() => {
        if (!isSuccess) return
        form.setFieldValue("image", data?.data?.image);
        form.setFieldValue("title", data?.data?.title);
        form.setFieldValue("description", data?.data?.description);
        form.setFieldValue("order", data?.data?.order);
        form.setFieldValue("isActive", data?.data?.isActive);
        setFileList([{
            uid: '1',
            name: 'image.png',
            url: data?.data?.image,
        },])

        return () => {
            setFileList([])
        }
    }, [data, isSuccess, form, setFileList]);

    const { mutate } = useMutation({
        mutationFn: (data) => updateBanner(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật biểu ngữ thành công", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['banner_admin'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
        }

    }, [fileList.length, form])

    const handleSubmit = async (e) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            let existingUrl = '';
            
            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                } else if (file.url) {
                    existingUrl = file.url;
                }
            });

            let newUrl = '';
            if (Array.from(formData.entries()).length > 0) {
                const rs = await uploadImage(formData);
                newUrl = rs?.data?.images[0]?.url || '';
            }

            const finalImage = newUrl ? newUrl : existingUrl;
            mutate({ ...e, image: finalImage, id: banner_id });
            navigate('/admin/banner')
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Flex className="update_banner_panel container" vertical>
            <AdminHeader title="Cập nhật biểu ngữ" icon={<PlusOutlined />} />
            <Card
                title="Cập nhật biểu ngữ"
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
                                        message: "Vui lòng tải lên hình ảnh"
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
                                            max: 50,
                                            message: "Maximum 50 character"
                                        }
                                    ]}
                                >
                                    <Input name="title" placeholder="Tiêu đề" />
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

                                <Typography.Title level={5}>Thứ tự</Typography.Title>
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
                                            <Switch checkedChildren='Hoạt động' unCheckedChildren="Khóa" />
                                        </Form.Item>
                                        <Typography.Title level={5}>Trạng thái</Typography.Title>

                                    </Flex>
                                </Flex>
                            </Flex>
                            <Form.Item>
                                <Flex justify="center" gap={10} className="group_btn">
                                    <Button type="primary" htmlType="submit" disabled={isLoading}>
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
export default UpdateBanner;