import { Flex, Form, Breadcrumb, Input, Select, Button, Upload, Typography } from 'antd'
import { NavLink, useNavigate } from 'react-router-dom'
import CameraOutlined from '@ant-design/icons/CameraOutlined'
import '../style/DetailUser.css'
import { uploadImage } from '../../../services/upload_service'
import { useContext, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getMe, updateUser } from '../../../services/user_service'
import { UserContext } from '../../../store/user'
import Notification from '../../../utils/configToastify'
// import Notification from '../../../utils/configToastify'

export const DetailUser = () => {
    const [form] = Form.useForm()
    const { Option } = Select
    const [avatar, setAvatar] = useState('');
    const [fileList, setFileList] = useState([])
    const user = useContext(UserContext)
    const info = user?.state?.currentUser;
    const handleSubmit = (e) => {
        mutate({ ...e, image: avatar, id: info.user_id });
    }
    const navigate = useNavigate()
    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            Notification({ message: "Cập nhật thông tin thành công!", type: "success" })
            navigate('/client')
        },
        onError: () => Notification({ message: "Cập nhật thất bại, vui lòng kiểm tra lại!", type: "error" })

    })

    const handleChange = async (e) => {
        setFileList(e.fileList)
        const formData = new FormData();
        e.fileList.forEach((file) => {
            formData.append('images', file.originFileObj);
        });
        try {
            if (Array.from(formData.entries()).length === 0) return
            const rs = await uploadImage(formData);
            setAvatar(rs.data.images[0].url)

        } catch (error) {
            console.log(error.message);
        }
    }
    useEffect(() => {
        form.setFieldValue('firstName', info?.firstName)
        form.setFieldValue('lastName', info?.lastName)
        form.setFieldValue('address', info?.address)
        form.setFieldValue('gender', info?.gender)
        form.setFieldValue('phone', info?.phone)

        if (info?.image !== null && info?.image !== undefined) {
            setFileList([{
                uid: '1',
                name: 'image.png',
                url: info?.image,
            },])
            setAvatar(info?.image)
        }
    }, [info?.firstName, info?.lastName, info?.address, info?.gender, info?.image, form, info?.phone])

    useEffect(() => {
        document.title = "Thông tin cá nhân"
    }, [])


    return (
        <Flex vertical className='customer' align='center'>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/user'}>THÔNG TIN</NavLink>,
                    },
                ]}
            />
            <Flex className='form_wrap'>
                <Form
                    form={form}
                    style={{ width: "100%", padding: "0 20px" }}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 100 }}
                    layout="horizontal"
                    onFinish={handleSubmit}>
                    <Flex vertical >

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
                        <Typography.Title level={3}>Họ</Typography.Title>
                        <Form.Item
                            name="firstName"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập họ!',
                                },
                                {
                                    min: 3,
                                    message: "Tối thiểu 3 ký tự"
                                },
                                {
                                    max: 50,
                                    message: "Tối đa 50 ký tự"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Họ" size="large" />
                        </Form.Item>
                        <Typography.Title level={3}>Tên</Typography.Title>
                        <Form.Item
                            name="lastName"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên!',
                                },
                                {
                                    min: 3,
                                    message: "Tối thiểu 3 ký tự"
                                },
                                {
                                    max: 50,
                                    message: "Tối đa 50 ký tự"
                                }
                            ]}
                        >
                            <Input type="text" placeholder="Tên" size="large" />
                        </Form.Item>
                        <Typography.Title level={3}>Số điện thoại</Typography.Title>
                        <Form.Item
                            name="phone"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại!',
                                },
                                {
                                    min: 10,
                                    message: 'Tối thiểu 10 số.',
                                },
                                {
                                    max: 13,
                                    message: 'Tối đa 13 số.',
                                },
                            ]}
                        >
                            <Input type="number" style={{ width: '100%' }} placeholder="Số điện thoại" size="large" />
                        </Form.Item>

                        <Typography.Title level={3}>Giới tính</Typography.Title>
                        <Form.Item
                            name="gender"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            hasFeedback
                        >
                            <Select placeholder="Giới tính" size="large">
                                <Option value="male" >Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>

                        <Typography.Title level={3}>Địa chỉ</Typography.Title>
                        <Form.Item
                            name="address"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập địa chỉ!',
                                },
                                {
                                    min: 3,
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

                        <Flex vertical align="center" justify="center" className="button_group">
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="update">Cập nhật</Button>
                            </Form.Item>
                        </Flex>
                    </Flex>
                </Form>
            </Flex >
        </Flex >
    )
}


