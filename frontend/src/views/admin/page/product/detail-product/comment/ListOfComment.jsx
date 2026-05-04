import { EyeOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Switch, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
// import { updateProduct } from '../../../../../services/product_service';
import convertToDate from '../../../../../../functions/convertDate';
import { queryClient } from '../../../../../../main';
import { commentOfProduct, updateComment } from '../../../../../../services/comment_service';
import Notification from '../../../../../../utils/configToastify';
import useDebounce from '../../../../../../utils/useDebounce';
import './ListOfComment.css';

export const ListOfComment = () => {

    const [form] = Form.useForm()
    const [page, setPage] = useState(1);
    const [name, setName] = useState('')
    const [sortDate, setSortDate] = useState('')
    const [isActive, setIsActive] = useState('')

    const { product_id } = useParams()

    const searchName = useDebounce(name, 500)
    const searchSortDate = useDebounce(sortDate, 500)
    const searchIsActive = useDebounce(isActive, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])


    const { mutate } = useMutation({
        mutationFn: (data) => updateComment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments_admin_list'] })
            Notification({ message: "Cập nhật trạng thái phản hồi thành công", type: 'success' });
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái phản hồi thất bại", type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['comments_admin_list', page, searchName, searchSortDate, searchIsActive, product_id],
        queryFn: () => commentOfProduct(product_id, page,
            searchName !== undefined ? searchName : '',
            searchSortDate !== undefined ? searchSortDate : '',
            searchIsActive !== undefined ? searchIsActive : '',
        ),
        enabled: !!searchSortDate || !!searchName || !!page || !!searchName || !!searchIsActive || !!product_id
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
    }, [searchName, searchSortDate, searchIsActive])



    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                name: item?.userId?.firstName + " " + item?.userId?.lastName,
                content: item?.content,
                isActive: item?.isActive,
                createdAt: item?.createdAt
            }))
        );

        setTotal(rawData?.totalDocs)

        return () => {
            setItems([])
        }

    }, [data, isSuccess]);

    console.log(items);

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: 'name',
            width: 180,
        },
        {
            title: "Nội dung",
            dataIndex: 'content',
            width: 200,
            align: "center",
        },
        {
            title: "Ngày tạo",
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            align: "center",
            render: (value) => <Typography.Text>{convertToDate(value)}</Typography.Text>

        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            width: 150,
            render: (value, row) => <Switch value={value} onChange={(e) => mutate({ id: row.key, isActive: e })} />

        },
        {
            title: 'Hành động',
            align: "center",
            key: 'x',
            width: 75,
            render: (text, row) => <Flex justify='center' className='delete' gap={5}>
                <Button icon={<EyeOutlined />} onClick={() => onEdit(row.key)} />
            </Flex>,
        },
    ];

    const navigate = useNavigate()

    const onEdit = (id) => {
        navigate(`${id}`)
    }


    const onFieldsChange = (_, fields) => {
        const mappedFields = fields.reduce((acc, item) => {
            acc[item.name[0]] = item.value;
            return acc;
        }, {});
        setName(mappedFields['name'])
        setIsActive(mappedFields["isActive"])
    };

    const onChange = (_pagination, _filters, sorter, _extra) => {
        const { field, order } = sorter;
        let newSortDate = '';
        console.log(sorter);
        if (order !== undefined) {
            if (field === 'createdAt') {
                newSortDate = order;
            }
        }
        setSortDate(newSortDate);
    };

    useEffect(() => {
        document.title = "Phản hồi"

    }, [])
    return (
        <Flex vertical gap={"middle"} className='banner_list'>
            <Flex>
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Flex gap={'middle'} width="100%">
                        <Form.Item
                            name="name"
                            style={{ width: "100%" }}
                        >
                            <Input type="text" placeholder="Tên" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="isActive"
                            style={{ width: "15%" }}
                        >
                            <Select placeholder="Trạng thái" size="large" allowClear>
                                <Select.Option value={0} >Khóa</Select.Option>
                                <Select.Option value={1}>Hoạt động</Select.Option>
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
                pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, showSizeChanger: false, onChange: setPage }}
            />

        </Flex>
    )
}
