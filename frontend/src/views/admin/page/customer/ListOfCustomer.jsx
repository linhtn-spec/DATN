import { EyeOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Switch, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { queryClient } from '../../../../main';
import { listCustomer, updateUser } from '../../../../services/user_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';
import './ListOfCustomer.css';



const statuses = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
]

export const ListOfCustomer = () => {

    const [form] = Form.useForm()
    const [page, setPage] = useState(1);

    const [email, setEmail] = useState("");
    const [name, setName] = useState('')
    const [status, setStatus] = useState('')

    const searchName = useDebounce(name, 500)
    const searchEmail = useDebounce(email, 500)
    const searchStatus = useDebounce(status, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])

    const { mutate } = useMutation({
        mutationFn: (data) => updateUser(data),
        onSuccess: () => {
            Notification({ message: "Update status of customer sucessfully", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['customers_admin_list'] })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['customers_admin_list', page, searchEmail, searchName, searchStatus],
        queryFn: () => listCustomer(page,
            searchName !== undefined ? searchName : '',
            searchEmail !== undefined ? searchEmail : '',
            searchStatus !== undefined ? searchStatus : ''),
        enabled: !!searchStatus || !!searchName || !!page || !!searchEmail
    })

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

        if (!isSuccess) return
        console.log(data);
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                name: (item?.firstName) ? (item?.firstName + " " + item?.lastName) : (item?.name),
                address: item?.address,
                email: item?.email,
                status: item?.isActive,
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
            title: 'Address',
            dataIndex: 'address',
            width: 100
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
    const onEdit = (id) => {
        navigate(`/admin/customers/${id}`)
    }

    console.log(status);
    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'])
        setEmail(mappedFields['email'])
        setStatus(mappedFields['status'])
    };

    return (
        <Flex vertical gap={"middle"} className='banner_list'>
            <Flex>
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Flex gap={'middle'} width="100%">
                        <Form.Item
                            name="name"
                            style={{ width: "33%" }}
                        >
                            <Input type="text" placeholder="Name" />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            style={{ width: "33%" }}
                        >
                            <Input type="text" placeholder="Email" />
                        </Form.Item>
                        <Form.Item
                            style={{ width: "51%" }}
                            name="status"
                        >
                            <Select placeholder="Status" options={statuses} allowClear />
                        </Form.Item>
                    </Flex>

                </Form>
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
