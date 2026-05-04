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
    Select,
    Switch,
    Typography,
    Upload
} from 'antd';
import Card from "antd/es/card/Card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { queryClient } from '../../../../main';
import { uploadImage } from '../../../../services/upload_service';
import { detailUser, updateUser } from '../../../../services/user_service';
import Notification from '../../../../utils/configToastify';
import './DetailCustomer.css';


export function DetailCustomer() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();

    const { user_id } = useParams()


    const handleChange = async (e) => {
        setFileList(e.fileList.map(file => ({
            ...file,
            status: 'uploading'
        })));

        const formData = new FormData();
        e.fileList.forEach((file) => {
            formData.append('images', file.originFileObj);
        });
        try {
            if (Array.from(formData.entries()).length === 0) return
            const rs = await uploadImage(formData);
            setAvatar(rs.data.images[0].url)
            setFileList(e.fileList.map(file => ({
                ...file,
                status: 'done'
            })));

        } catch (error) {
            setFileList(e.fileList.map(file => ({
                ...file,
                status: 'error'
            })));
            console.log(error.message);
        }
    }

    const { data, isSuccess } = useQuery({
        queryKey: ['customer_admin_detail', user_id],
        queryFn: () => detailUser(user_id),
        enabled: !!user_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật người dùng thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['customers_admin_list'] })
            navigate('/admin/customers', { replace: true })
        },
        onError: () => {
            Notification({ message: "Cập nhật người dùng thất bại!", type: "error" })
        }
    })

    const handleSubmit = (value) => {
        mutate({ ...value, image: avatar, ...(user_id ? { id: user_id } : {}) });
    }


    useEffect(() => {
        if (fileList.length === 0) {
            form.resetFields(['image'])
            setAvatar('')
        }

    }, [fileList.length, form])


    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?._doc
        form.setFieldValue('role', rawData?.role)
        form.setFieldValue('username', rawData?.username)
        form.setFieldValue('email', rawData?.email)
        form.setFieldValue('firstName', rawData?.firstName)
        form.setFieldValue('lastName', rawData?.lastName)
        form.setFieldValue('address', rawData?.address)
        form.setFieldValue('gender', rawData?.gender)
        form.setFieldValue('phone', rawData?.phone)
        form.setFieldValue('isActive', rawData?.isActive)

        if (rawData?.image !== null && rawData?.image !== undefined && rawData?.image !== "") {
            setFileList([{
                uid: '1',
                name: 'image.png',
                url: rawData?.image,
            },])
            setAvatar(rawData?.image)
        }
    }, [data, isSuccess, form])


    return (
        <Flex className="crud_user container" vertical>
            <h2 className='caption'><PlusOutlined />{'Cập nhật khách hàng'}</h2>
            <Card
                title={'Cập nhật khách hàng'}
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
                            >
                                <Upload

                                    beforeUpload={() => false}
                                    listType="picture-circle"
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
                                <Typography.Title level={5}>Email</Typography.Title>
                                <Form.Item
                                    name="email"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập!',
                                        }, {
                                            min: 6,
                                            message: "Tối thiểu 6 ký tự"
                                        },
                                        {
                                            type: 'email',
                                            message: 'Vui lòng nhập đúng định dạng email'
                                        }
                                    ]}

                                >
                                    <Input type="email" placeholder="Email" size="large" disabled />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Tên đăng nhập</Typography.Title>
                                <Form.Item
                                    name="username"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập!',
                                        },
                                        {
                                            min: 1,
                                            message: "Tối thiểu 6 ký tự"
                                        },
                                        {
                                            max: 50,
                                            message: "Tối đa 50 ký tự"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Tên đăng nhập" size="large" disabled />
                                </Form.Item>
                            </Flex>
 
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Họ</Typography.Title>
                                <Form.Item
                                    name="firstName"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập!',
                                        },
                                        {
                                            min: 1,
                                            message: "Tối thiểu 1 ký tự"
                                        },
                                        {
                                            max: 50,
                                            message: "Tối đa 50 ký tự"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Họ" size="large" />
                                </Form.Item>
                            </Flex>
 
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Tên</Typography.Title>
                                <Form.Item
                                    name="lastName"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập!',
                                        },
                                        {
                                            min: 1,
                                            message: "Tối thiểu 1 ký tự"
                                        },
                                        {
                                            max: 50,
                                            message: "Tối đa 50 ký tự"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Tên" size="large" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Số điện thoại</Typography.Title>
                                <Form.Item
                                    name="phone"
                                    hasFeedback
                                    rules={[
                                        {
                                            min: 10,
                                            message: 'Tối thiểu 10 chữ số.',
                                        },
                                        {
                                            max: 13,
                                            message: 'Tối đa 13 chữ số.',
                                        },
                                    ]}
                                >
                                    <Input type="number" style={{ width: '100%' }} placeholder="Số điện thoại" size="large" />
                                </Form.Item>
                            </Flex>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Giới tính</Typography.Title>
                                <Form.Item
                                    name="gender"
                                    rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                                    hasFeedback
                                >
                                    <Select placeholder="Giới tính" size="large">
                                        <Select.Option value="male" >Nam</Select.Option>
                                        <Select.Option value="female">Nữ</Select.Option>
                                        <Select.Option value="other">Khác</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Địa chỉ</Typography.Title>
                                <Form.Item
                                    name="address"
                                    hasFeedback
                                    rules={[
                                        {
                                            min: 1,
                                            message: "Tối thiểu 3 ký tự"
                                        },
                                        {
                                            max: 150,
                                            message: "Tối đa 150 ký tự"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Địa chỉ" size="large" />
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
                                    <Button type="primary" htmlType="submit" >
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