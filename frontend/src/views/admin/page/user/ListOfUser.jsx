import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Switch, Table, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// import { updateProduct } from '../../../../../services/product_service';
import { ROLE } from '../../../../constants/roles';
import { queryClient } from '../../../../main';
import { listUser, updateUser } from '../../../../services/user_service';
import { UserContext } from '../../../../store/user';
import Notification from '../../../../utils/configToastify';
import { getLabelByValue } from '../../../../utils/getLabelByValue';
import useDebounce from '../../../../utils/useDebounce';
import './ListOfUser.css';





const statuses = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
]

export const ListOfUser = () => {
    const { state } = useContext(UserContext)

    const [isAdmin, setIsAdmin] = useState(false)

    const roles =
        isAdmin ?
            [{ value: 1, label: "Staff" },
            { value: 2, label: "Manager" },
            { value: 3, label: "Owner" },
            ]
            : [
                { value: 1, label: "Staff" },
                { value: 2, label: "Manager" }
            ]

    const [form] = Form.useForm()
    const [page, setPage] = useState(1);

    const [email, setEmail] = useState("");
    const [name, setName] = useState('')
    const [status, setStatus] = useState('')
    const [role, setRole] = useState('')

    const searchName = useDebounce(name, 500)
    const searchEmail = useDebounce(email, 500)
    const searchStatus = useDebounce(status, 500)
    const searchRole = useDebounce(role, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])


    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            Notification({ message: "Update status of user sucessfully", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['users_admin_list'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['users_admin_list', page, searchEmail, searchName, searchStatus, searchRole],
        queryFn: () => listUser(page,
            searchRole !== undefined ? searchRole : '',
            searchName !== undefined ? searchName : '',
            searchEmail !== undefined ? searchEmail : '',
            searchStatus !== undefined ? searchStatus : ''),
        enabled: !!searchStatus || !!searchName || !!page || !!searchEmail || !!searchRole
    })

    console.log(name);
    useEffect(() => {
        setPage(1)

        return () => {
            setPage(1)
        }
    }, [])

    useEffect(() => {
        setPage(1)

        return () => {
            setPage(1)
        }
    }, [searchStatus, searchName, searchEmail])
    useEffect(() => {
        if (state?.currentUser?.role === ROLE.ADMIN) setIsAdmin(true)
        return () => {
            setIsAdmin(false)
        }
    }, [setIsAdmin, state])


    useEffect(() => {

        if (!isSuccess) return
        console.log(data);
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                name: item?.firstName + " " + item?.lastName,
                email: item?.email,
                status: item?.isActive,
                role: item?.role,
            }))
        );

        setTotal(rawData?.totalDocs)

        return () => {
            setItems([])
        }

    }, [data, isSuccess]);



    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            width: 100,
            align: 'center',
            render: (text) => <Typography.Text>{getLabelByValue(text, roles)}</Typography.Text>
        },

        {
            title: 'Active',
            dataIndex: 'status',
            width: 90,
            render: (value, row) => <Switch value={value} onChange={(e) => mutate({ id: row.key, isActive: e })} />
        },
        {
            title: 'Action',
            align: "center",
            width: 80,
            key: 'x',
            render: (text, row) => <Flex justify='center' className='delete' gap={5}>
                <Button icon={<EyeOutlined />} onClick={() => onEdit(row.key)} />
            </Flex>,
        },
    ];

    const navigate = useNavigate()

    const onAdd = () => {
        navigate('/admin/users/create')
    }
    const onEdit = (id) => {
        navigate(`/admin/users/${id}`)
    }


    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'])
        setEmail(mappedFields['email'])
        setStatus(mappedFields['status'])
        setRole(mappedFields['role'])
    };
    useEffect(() => {
        document.title = "User"

    }, [])
    return (
        <Flex vertical gap={"middle"} className='banner_list'>
            <Flex>
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Flex gap={'middle'} width="100%">
                        <Form.Item
                            name="name"
                            style={{ width: "33%" }}
                        >
                            <Input type="text" placeholder="Name" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            style={{ width: "33%" }}
                        >
                            <Input type="text" placeholder="Email" size="large" />
                        </Form.Item>
                        <Form.Item
                            style={{ width: "51%" }}
                            name="role"
                        >
                            <Select placeholder="Role" size="large" options={roles} allowClear />
                        </Form.Item>
                        <Form.Item
                            style={{ width: "51%" }}
                            name="status"
                        >
                            <Select placeholder="Status" size="large" options={statuses} allowClear />
                        </Form.Item>
                    </Flex>

                </Form>
            </Flex>
            <Flex justify='space-between'>
                <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}> Add new user</Button>
            </Flex>
            <Table
                bordered
                columns={columns}
                dataSource={items}
                rowHoverable
                pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, current: page, showSizeChanger: false, onChange: setPage }}
            />

        </Flex>
    )
}
