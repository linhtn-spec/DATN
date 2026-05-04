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
            Notification({ message: "Update user successfully!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['customers_admin_list'] })
            navigate('/admin/customers', { replace: true })
        },
        onError: () => {
            Notification({ message: "Update user unsuccessfully!", type: "error" })
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
            <h2 className='caption'><PlusOutlined />{'Update customer'}</h2>
            <Card
                title={'Update customer'}
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
                                            message: 'Please input!',
                                        }, {
                                            min: 6,
                                            message: "At least 6 characters"
                                        },
                                        {
                                            type: 'email',
                                            message: 'Please input an email address'
                                        }
                                    ]}

                                >
                                    <Input type="email" placeholder="Email" size="large" disabled />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Username</Typography.Title>
                                <Form.Item
                                    name="username"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                        {
                                            min: 1,
                                            message: "At least 6 characters"
                                        },
                                        {
                                            max: 50,
                                            message: "At max 50 characters"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Username" size="large" disabled />
                                </Form.Item>
                            </Flex>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>First name</Typography.Title>
                                <Form.Item
                                    name="firstName"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                        {
                                            min: 1,
                                            message: "At least 3 characters"
                                        },
                                        {
                                            max: 50,
                                            message: "At max 50 characters"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="First name" size="large" />
                                </Form.Item>
                            </Flex>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Last name</Typography.Title>
                                <Form.Item
                                    name="lastName"
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                        {
                                            min: 1,
                                            message: "At least 3 characters"
                                        },
                                        {
                                            max: 50,
                                            message: "At max 50 characters"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Last name" size="large" />
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Phone</Typography.Title>
                                <Form.Item
                                    name="phone"
                                    hasFeedback
                                    rules={[
                                        {
                                            min: 10,
                                            message: 'At least 10 digits long.',
                                        },
                                        {
                                            max: 13,
                                            message: 'Maximum 13 digits long.',
                                        },
                                    ]}
                                >
                                    <Input type="number" style={{ width: '100%' }} placeholder="Phone" size="large" />
                                </Form.Item>
                            </Flex>

                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Gender</Typography.Title>
                                <Form.Item
                                    name="gender"
                                    rules={[{ required: true, message: 'Please select!' }]}
                                    hasFeedback
                                >
                                    <Select placeholder="Gender" size="large">
                                        <Select.Option value="male" >Male</Select.Option>
                                        <Select.Option value="female">Female</Select.Option>
                                        <Select.Option value="other">Other</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Flex>
                            <Flex vertical style={{ width: "100%" }}>
                                <Typography.Title level={5}>Address</Typography.Title>
                                <Form.Item
                                    name="address"
                                    hasFeedback
                                    rules={[
                                        {
                                            min: 1,
                                            message: "At least 3 characters"
                                        },
                                        {
                                            max: 150,
                                            message: "At max 150 characters"
                                        }
                                    ]}
                                >
                                    <Input type="text" placeholder="Address" size="large" />
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
                                    <Button type="primary" htmlType="submit" >
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