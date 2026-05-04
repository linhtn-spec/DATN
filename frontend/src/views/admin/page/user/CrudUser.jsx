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
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ROLE } from "../../../../constants/roles";
import { queryClient } from '../../../../main';
import { uploadImage } from '../../../../services/upload_service';
import { createUser, detailUser, updateUser } from '../../../../services/user_service';
import { UserContext } from "../../../../store/user";
import Notification from '../../../../utils/configToastify';
import './CrudUser.css';


export function CrudUser() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const { state } = useContext(UserContext)
    const [fileList, setFileList] = useState([])
    const [form] = Form.useForm();

    const { user_id } = useParams()
    const [isUpdate, setIsUpdate] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    const roles =
        isAdmin ?
            [{ value: 1, label: "Nhân viên" },
            { value: 2, label: "Quản lý" },
            { value: 3, label: "Chủ sở hữu" },
            ]
            : [
                { value: 1, label: "Nhân viên" },
            ]

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
        queryKey: ['user_admin_detail_one', user_id],
        queryFn: () => detailUser(user_id),
        enabled: !!user_id
    })

    const { mutate } = useMutation({
        mutationFn: (data) => isUpdate ? updateUser(data) : createUser(data),
        onSuccess: () => {
            Notification({ message: isUpdate ? "Cập nhật người dùng thành công!" : "Thêm người dùng thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['users_admin_list'] })
            navigate('/admin/users', { replace: true })
        },
        onError: () => {
            Notification({ message: isUpdate ? "Cập nhật người dùng thất bại!" : "Thêm người dùng thất bại!", type: "error" })
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

    useEffect(() => {
        if (user_id) setIsUpdate(true)

        return () => {
            setIsUpdate(false)
        }
    }, [user_id])

    useEffect(() => {
        if (state?.currentUser?.role === ROLE.ADMIN) setIsAdmin(true)
        return () => {
            setIsAdmin(false)
        }
    }, [setIsAdmin, state])

    return (
        <Flex className="crud_user container" vertical>
            <h2 className='caption'><PlusOutlined />{isUpdate ? 'Cập nhật người dùng' : "Thêm người dùng mới"}</h2>
            <Card
                title={isUpdate ? 'Cập nhật người dùng' : "Thêm người dùng mới"}
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
                                <Typography.Title level={5}>Vai trò</Typography.Title>
                                <Form.Item
                                    name="role"
                                >
                                    <Select placeholder="Vai trò" size="large" options={roles} allowClear disabled={form.getFieldValue('role') === ROLE.ADMIN} />
                                </Form.Item>
                            </Flex>


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
                                    <Input type="email" placeholder="Email" size="large" disabled={isUpdate} />
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
                                    <Input type="text" placeholder="Tên đăng nhập" size="large" disabled={isUpdate} />
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
                                            required: true,
                                            message: 'Vui lòng nhập!',
                                        },
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
                                            required: true,
                                            message: 'Vui lòng nhập!',
                                        },
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

                            {isUpdate ? <></> :
                                <Flex vertical style={{ width: "100%" }}>
                                    <Typography.Title level={5}>Mật khẩu</Typography.Title> <Form.Item
                                        name="password"
                                        hasFeedback
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng nhập!',
                                                }, {
                                                    min: 6,
                                                    message: "Tối thiểu 6 ký tự"
                                                }
                                            ]}
                                    >
                                        <Input.Password visibilityToggle placeholder="Mật khẩu" size="large" />
                                    </Form.Item>
                                </Flex>
                            }
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
                                        {isUpdate ? "Cập nhật" : 'Thêm mới'}
                                    </Button>
                                    {isUpdate ? <></> :
                                        <Button htmlType="reset">Nhập lại</Button>
                                    }
                                </Flex>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Flex>
            </Card>
        </Flex >
    );
}