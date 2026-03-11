import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Select, Switch, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { listBanner, updateBanner } from '../../../../../services/banner_service';
import Notification from '../../../../../utils/configToastify';
import useDebounce from '../../../../../utils/useDebounce';
import DeleteModal from '../../../layout/modal_del';
import './BannerList.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ModalContext } from '../../../../../store/modal/provider';
import { ACTION_MODAL } from '../../../../../store/modal';
import { queryClient } from '../../../../../main';

export const BannerList = () => {
  const { dispatch } = useContext(ModalContext)

  const [form] = Form.useForm()
  const [delID, setDelID] = useState("");
  const [page, setPage] = useState(1);
  const [typeDelete, setTypeDelete] = useState('')

  const [sortTitle, setSortTitle] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [type, setType] = useState("");
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const searchType = useDebounce(type, 500)
  const searchTitle = useDebounce(title, 500)
  const searchDescription = useDebounce(description, 500)
  const searchSortTitle = useDebounce(sortTitle, 500)
  const searchSortOrder = useDebounce(sortOrder, 500)

  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([])


  const { mutate } = useMutation({
    mutationFn: (data) => updateBanner(data),
    onSuccess: () => {
      Notification({ message: "Update status of banner sucessfully", type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['banner_admin'] })
    },
    onError: (error) => {
      Notification({ message: error?.response?.data, type: "error" })
    }
  })

  const { data, isSuccess } = useQuery({
    queryKey: ['banner_admin', page, searchDescription, searchTitle, searchSortTitle, searchSortOrder, searchType],
    queryFn: () => listBanner(page,
      searchTitle !== undefined ? searchTitle : '',
      searchDescription !== undefined ? searchDescription : '',
      searchType !== undefined ? searchType : '',
      searchSortOrder, searchSortTitle),
    enabled: !!searchDescription || !!searchTitle || !!page || !!searchSortTitle || !!searchSortOrder || !!searchType
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
  }, [searchDescription, searchTitle, searchSortTitle, searchSortOrder, searchType])


  useEffect(() => {

    if (!isSuccess) return
    setItems(
      data?.data?.docs?.map((item) => ({
        key: item?._id,
        title: item?.title,
        image: item?.image,
        description: item?.description,
        isActive: item?.isActive,
        order: item?.order
      }))
    );

    setTotal(data?.data?.totalDocs)

    return () => {
      setItems([])
    }

  }, [data, isSuccess]);



  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 200,
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 100,
      render: (text) => <img src={text} width={70} height={70} />

    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 90,
      render: (value, row) => <Switch value={value} onChange={(e) => mutate({ id: row.key, isActive: e })} />
    },
    {
      title: 'Order',
      dataIndex: 'order',
      width: 100,
      sorter: true,
      align: 'center',

    },
    {
      title: 'Action',
      width: 100,
      key: 'x',
      render: (text, row) => <Flex justify='center' className='delete' gap={5}>
        <Button danger type='primary' icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }); setDelID(row.key), setTypeDelete('bannerOne') }} />
        <Button icon={<EyeOutlined />} onClick={() => onEdit(row.key)} />
      </Flex>,
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate()

  const onAdd = () => {
    navigate('/admin/banner/create')
  }
  const onEdit = (id) => {
    navigate(`/admin/banner/${id}`)
  }

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys)
    setDelID(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onFieldsChange = (_, fields) => {
    const mappedFields = fields.reduce((acc, item) => {
      acc[item.name[0]] = item.value;
      return acc;
    }, {});
    setDescription(mappedFields['description'])
    setTitle(mappedFields['title'])
    setType(mappedFields['type'])
  };

  const onChange = (_pagination, _filters, sorter, _extra) => {
    const { field, order } = sorter;
    let newSortTitle = '';
    let newSortOrder = '';

    if (order !== undefined) {
      if (field === 'title') {
        newSortTitle = order;
      } else if (field === 'order') {
        newSortOrder = order;
      }
    }
    setSortTitle(newSortTitle);
    setSortOrder(newSortOrder);
  };
  useEffect(() => {
    document.title = "Banner"

  }, [])

  return (
    <Flex vertical gap={"middle"} className='banner_list'>
      <Flex>
        <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
          <Flex gap={'middle'} width="100%">
            <Form.Item
              name="title"
              style={{ width: "33%" }}
            >
              <Input type="text" placeholder="Title" />
            </Form.Item>
            <Form.Item
              style={{ width: "51%" }}
              name="description"
            >
              <Input type="text" placeholder="Description" />
            </Form.Item>
            <Form.Item
              name="type"
              style={{ width: "15%" }}
            >
              <Select placeholder="Type" allowClear>
                <Select.Option value={0} >Deactivate</Select.Option>
                <Select.Option value={1}>Activate</Select.Option>
              </Select>
            </Form.Item>
          </Flex>

        </Form>
      </Flex>
      <Flex justify='space-between'>
        <Button danger type='primary' disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }), setTypeDelete("bannerList") }} />
        <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}> Add new banner</Button>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={items}
        rowHoverable
        rowSelection={rowSelection}
        pagination={{ hideOnSinglePage: true, pageSize: 6, total: total, defaultCurrent: 1, current: page, showSizeChanger: false, onChange: setPage }}
        onChange={onChange}
      />
      <DeleteModal type_del={typeDelete} id_del={delID} />

    </Flex>
  )
}
