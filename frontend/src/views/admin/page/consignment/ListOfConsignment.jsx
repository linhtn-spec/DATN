import { EyeOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, ConfigProvider, DatePicker, Flex, Form, Image, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import convertToDate from '../../../../functions/convertDate';
import { queryClient } from '../../../../main';
import { updateSale } from '../../../../services/sale_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';
import './ListOfConsignment.css';

import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { listConsignment } from '../../../../services/cosignment_service';

dayjs.locale('vi')


export const ListOfConsignment = () => {

    const [form] = Form.useForm()
    const [page, setPage] = useState(1);
    const [sortDate, setSortDate] = useState('')
    const [applyDate, setApplyDate] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [sortMoney, setSortMoney] = useState('')

    const applyDateValue = Form.useWatch('applyDate', form)
    const dueDateValue = Form.useWatch('dueDate', form)

    const { product_id } = useParams()

    const searchSortMoney = useDebounce(sortMoney, 500)
    const searchSortDate = useDebounce(sortDate, 500)
    const searchApplyDate = useDebounce(applyDate, 500)
    const searchDueDate = useDebounce(dueDate, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])


    const { mutate } = useMutation({
        mutationFn: (data) => updateSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales_admin_list'] })
            Notification({ message: "Cập nhật trạng thái khuyến mãi thành công!", type: 'success' });
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái khuyến mãi thất bại!", type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['consignment_admin_list', page, searchApplyDate, searchDueDate, searchSortDate, searchSortMoney, product_id],
        queryFn: () => listConsignment(page,
            searchApplyDate !== undefined ? searchApplyDate : '',
            searchDueDate !== undefined ? searchDueDate : '',
            searchSortMoney !== undefined ? searchSortMoney : '',
            searchSortDate !== undefined ? searchSortDate : ''

        ),
        enabled: !!searchSortDate || !!searchDueDate || !!page || !!searchSortMoney || !!product_id || !!searchApplyDate
    })


    useEffect(() => {
        setPage(1)

        return () => {
            setPage(1)
        }
    }, [searchApplyDate, searchSortDate, searchSortMoney, searchDueDate])



    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                user: item?.userId?.firstName + " " + item?.userId?.lastName,
                products: item?.products.map(item => ({
                    name: item?.productId?.name,
                    image: item?.productId?.images[0],
                    quantity: item?.quantity
                })),
                importDate: item?.importDate,
                importMoney: item?.money
            }))
        );
        setTotal(rawData?.totalDocs)

        return () => {
            setItems([])
        }

    }, [data, isSuccess]);


    const columns = [
        {
            title: "Người dùng",
            dataIndex: "user",
            width: 250

        },
        {
            title: "Sản phẩm",
            dataIndex: "products",
            width: 400,
            render: (value) => <Flex vertical>{value.map((item, index) =>
                <Flex key={index} gap='middle'>
                    <Typography.Text>{`[${item.name}]x${item.quantity}`}</Typography.Text>
                    <Image src={item?.image} width={100} height={100} />
                </Flex>

            )}</Flex>
        },
        {
            title: 'Tổng tiền nhập',
            dataIndex: 'importMoney',
            width: 200,
            sorter: true,
            align: "center",
            render: (value) => <Typography.Text>{Number(value).toLocaleString('vi-VN')} ₫</Typography.Text>
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'importDate',
            width: 200,
            sorter: true,
            align: "center",
            render: (value) => <Typography.Text >{convertToDate(value).split(',')[0]}</Typography.Text>
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
        console.log('field', mappedFields);
        if (mappedFields["applyDate"])
            setApplyDate(mappedFields["applyDate"]);
        if (mappedFields["dueDate"])
            setDueDate(mappedFields["dueDate"]);
        if (mappedFields["applyDate"] === null) setApplyDate('');
        if (mappedFields["dueDate"] === null) setDueDate('');

    };


    const onChange = (_pagination, _filters, sorter, _extra) => {
        const { field, order } = sorter;
        let newSortDate = '';
        let newSortMoney = '';
        console.log(sorter);
        if (order !== undefined) {
            if (field === 'importMoney') {
                newSortMoney = order
            }
            if (field === 'importDate') {
                newSortDate = order;
            }
        }
        setSortDate(newSortDate);
        setSortMoney(newSortMoney)
    };

    useEffect(() => {
        document.title = "Nhập kho"

    }, [])
    return (
        <Flex vertical gap={"middle"} className='banner_list'>
            <Flex>
                <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
                    <Flex gap={'middle'} width="100%">
                        <ConfigProvider locale={locale} width={"70%"}>
                            <Form.Item
                                name="applyDate"
                                style={{ width: "100%" }}
                            >
                                <DatePicker placeholder='Từ ngày'
                                    style={{ width: "100%" }}
                                    maxDate={dueDateValue ? dayjs(dueDateValue).subtract(1, 'day') : ''} />
                            </Form.Item>
                            <Form.Item
                                name="dueDate"
                                style={{ width: "100%" }}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}

                                    placeholder='Đến ngày' minDate={applyDateValue ? dayjs(applyDateValue).add(1, 'day') : ''} />
                            </Form.Item>
                        </ConfigProvider>
                        <Flex>
                            <Button type='primary' onClick={() => navigate('/admin/consignment/create')}>Thêm phiếu nhập</Button>
                        </Flex>
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
