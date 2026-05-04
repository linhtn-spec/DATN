import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, ConfigProvider, DatePicker, Flex, Form, Select, Switch, Table, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import convertToDate from '../../../../functions/convertDate';
import { queryClient } from '../../../../main';
import { listSale, updateSale } from '../../../../services/sale_service';
import Notification from '../../../../utils/configToastify';
import useDebounce from '../../../../utils/useDebounce';
import './ListOfSale.css';

import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { ModalContext } from '../../../../store/modal/provider';
import DeleteModal from '../../layout/modal_del';
import { ACTION_MODAL } from '../../../../store/modal';
dayjs.locale('vi')


export const ListOfSale = () => {
    const { dispatch } = useContext(ModalContext)

    const [form] = Form.useForm()
    const [delID, setDelID] = useState("");
    const [page, setPage] = useState(1);
    const [typeDelete, setTypeDelete] = useState('')
    const [sortDate, setSortDate] = useState('')
    const [isActive, setIsActive] = useState('')
    const [applyDate, setApplyDate] = useState('')
    const [dueDate, setDueDate] = useState('')

    const applyDateValue = Form.useWatch('applyDate', form)
    const dueDateValue = Form.useWatch('dueDate', form)

    const { product_id } = useParams()
    const searchSortDate = useDebounce(sortDate, 500)
    const searchIsActive = useDebounce(isActive, 500)
    const searchApplyDate = useDebounce(applyDate, 500)
    const searchDueDate = useDebounce(dueDate, 500)

    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([])


    const { mutate } = useMutation({
        mutationFn: (data) => updateSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales_admin_list'] })
            Notification({ message: "Cập nhật trạng thái khuyến mãi thành công", type: 'success' });
        },
        onError: () => {
            Notification({ message: "Cập nhật trạng thái khuyến mãi thất bại", type: "error" })
        }
    })

    const { data, isSuccess } = useQuery({
        queryKey: ['sales_admin_list', page, searchApplyDate, searchDueDate, searchSortDate, searchIsActive, product_id],
        queryFn: () => listSale(page,
            searchApplyDate !== undefined ? searchApplyDate : '',
            searchDueDate !== undefined ? searchDueDate : '',
            searchIsActive !== undefined ? searchIsActive : '',
            searchSortDate !== undefined ? searchSortDate : ''

        ),
        enabled: !!searchSortDate || !!searchDueDate || !!page || !!searchIsActive || !!product_id || !!searchApplyDate
    })

    const onAdd = () => {
        navigate('/admin/sales/create')
    }

    useEffect(() => {
        setPage(1)

        return () => {
            setPage(1)
        }
    }, [searchApplyDate, searchSortDate, searchIsActive, searchDueDate])



    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data;
        setItems(
            rawData?.docs?.map((item) => ({
                key: item?._id,
                applyDate: item?.applyDate,
                dueDate: item?.dueDate,
                products: item?.products.map(item => item?.productId?.name),
                isActive: item?.isActive,
                createdAt: item?.createdAt
            }))
        );
        setTotal(rawData?.totalDocs)

        return () => {
            setItems([])
        }

    }, [data, isSuccess]);


    const columns = [
        {
            title: "Ngày áp dụng",
            dataIndex: 'applyDate',
            width: 180,
            render: (value) => <Typography.Text >{convertToDate(value).split(',')[0]}</Typography.Text>

        },
        {
            title: "Ngày kết thúc",
            dataIndex: 'dueDate',
            width: 200,
            render: (value) => <Typography.Text >{convertToDate(value).split(',')[0]}</Typography.Text>

        },
        {
            title: "Sản phẩm áp dụng",
            dataIndex: "products",
            width: 400,
            render: (value) => <Flex vertical>{value.map((item, index) => <Typography.Text key={index} >{item}</Typography.Text>)}</Flex>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            width: 150,
            render: (value, row) => <Switch value={value} onChange={(e) => mutate({ id: row.key, isActive: e })} />
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
            title: 'Hành động',
            align: "center",
            key: 'x',
            width: 75,
            render: (text, row) => <Flex justify='center' className='delete' gap={5}>
                <Button danger type='primary' icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }); setDelID(row.key), setTypeDelete('sale') }} />
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
        document.title = "Khuyến mãi"

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
                                <DatePicker placeholder='Ngày áp dụng'
                                    style={{ width: "100%" }}
                                    maxDate={dueDateValue ? dayjs(dueDateValue).subtract(1, 'day') : ''} />
                            </Form.Item>
                            <Form.Item
                                name="dueDate"
                                style={{ width: "100%" }}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}

                                    placeholder='Ngày kết thúc' minDate={applyDateValue ? dayjs(applyDateValue).add(1, 'day') : ''} />
                            </Form.Item>
                        </ConfigProvider>
                        <Form.Item
                            name="isActive"
                            style={{ width: "30%" }}
                        >
                            <Select placeholder="Trạng thái" size="middle" style={{ height: "31.33px" }} allowClear>
                                <Select.Option value={false} >Ngừng hoạt động</Select.Option>
                                <Select.Option value={true}>Kích hoạt</Select.Option>
                            </Select>
                        </Form.Item>
                    </Flex>

                </Form>
            </Flex>
            <Flex style={{ width: "100%" }} justify='flex-end'>
                <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}> Thêm khuyến mãi mới</Button>
            </Flex>
            <Table
                bordered
                columns={columns}
                dataSource={items}
                rowHoverable
                onChange={onChange}
                pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, current: page, showSizeChanger: false, onChange: setPage }}
            />
            <DeleteModal type_del={typeDelete} id_del={delID} />

        </Flex>
    )
}
