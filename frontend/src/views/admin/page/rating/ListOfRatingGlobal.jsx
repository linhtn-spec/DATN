import { EyeOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Rate, Select, Switch, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import convertToDate from '../../../../functions/convertDate';
import { queryClient } from '../../../../main';
import { paginateRating, updateRating } from '../../../../services/rating_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';

export const ListOfRatingGlobal = () => {

    const [form] = Form.useForm()
    const [page, setPage] = useState(1);
    const [name, setName] = useState('')
    const [sortStar, setSortStar] = useState("");
    const [sortDate, setSortDate] = useState('')
    const [isActive, setIsActive] = useState('')

    const searchName = useDebounce(name, 500)
    const searchSortStar = useDebounce(sortStar, 500)
    const searchSortDate = useDebounce(sortDate, 500)
    const searchIsActive = useDebounce(isActive, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])

    const { mutate } = useMutation({
        mutationFn: (data) => updateRating(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ratings_global_list'] })
            Notification({ message: "Update status of rating sucessfully", type: 'success' });
        },
        onError: () => {
            Notification({ message: "Update status of rating unsucessfully", type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['ratings_global_list', page, searchSortStar, searchName, searchSortDate, searchIsActive],
        queryFn: () => paginateRating(
            page,
            searchName !== undefined ? searchName : '',
            searchSortStar !== undefined ? searchSortStar : '',
            searchSortDate !== undefined ? searchSortDate : '',
            searchIsActive !== undefined ? searchIsActive : '',
        ),
        enabled: true
    })

    useEffect(() => {
        setPage(1)
        return () => { setPage(1) }
    }, [])

    useEffect(() => {
        setPage(1)
        return () => { setPage(1) }
    }, [searchSortStar, searchName, searchSortDate, searchIsActive])

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                name: item?.userId?.firstName + " " + item?.userId?.lastName,
                stars: item?.stars,
                isActive: item?.isActive,
                createdAt: item?.createdAt
            }))
        );
        setTotal(rawData?.totalDocs)
        return () => { setItems([]) }
    }, [data, isSuccess]);

    const columns = [
        {
            title: "Full name",
            dataIndex: 'name',
            width: 180,
        },
        {
            title: "Stars",
            dataIndex: 'stars',
            width: 200,
            align: "center",
            sorter: true,
            render: (value) => <Rate defaultValue={value} allowHalf disabled />
        },
        {
            title: "Created at",
            dataIndex: 'createdAt',
            width: 180,
            sorter: true,
            align: "center",
            render: (value) => <Typography.Text>{convertToDate(value)}</Typography.Text>
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            width: 130,
            render: (value, row) => <Switch value={value} onChange={(e) => mutate({ id: row.key, isActive: e })} />
        },
        {
            title: 'Action',
            align: "center",
            key: 'x',
            width: 75,
            render: (_text, row) => (
                <Flex justify='center' gap={5}>
                    <Button icon={<EyeOutlined />} onClick={() => navigate(`${row.key}`)} />
                </Flex>
            ),
        },
    ];

    const navigate = useNavigate()

    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'])
        setIsActive(mappedFields["isActive"])
    };

    const onChange = (_pagination, _filters, sorter) => {
        const { field, order } = sorter;
        let newSortStar = '';
        let newSortDate = '';
        if (order !== undefined) {
            if (field === 'stars') newSortStar = order;
            else if (field === 'createdAt') newSortDate = order;
        }
        setSortStar(newSortStar);
        setSortDate(newSortDate);
    };

    useEffect(() => { document.title = "Manage Ratings" }, [])

    return (
        <Flex vertical gap={"middle"} style={{ padding: '0 20px' }}>
            <Typography.Title level={4}>Quản Lý Đánh Giá</Typography.Title>
            <Flex>
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Flex gap={'middle'} width="100%">
                        <Form.Item name="name" style={{ width: "100%" }}>
                            <Input type="text" placeholder="Tên khách hàng" size="large" />
                        </Form.Item>
                        <Form.Item name="isActive" style={{ width: "15%" }}>
                            <Select placeholder="Status" size="large" allowClear>
                                <Select.Option value={0}>Deactivate</Select.Option>
                                <Select.Option value={1}>Activate</Select.Option>
                            </Select>
                        </Form.Item>
                    </Flex>
                </Form>
            </Flex>
            <Table
                bordered
                columns={columns}
                dataSource={items}
                rowHoverable
                onChange={onChange}
                pagination={{ hideOnSinglePage: true, pageSize: 10, total: total, defaultCurrent: 1, showSizeChanger: false, onChange: setPage }}
            />
        </Flex>
    )
}
