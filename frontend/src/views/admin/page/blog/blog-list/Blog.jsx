import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Switch, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { queryClient } from '../../../../../main';
import { listBlog, updateBlog } from '../../../../../services/blog_service';
import { ACTION_MODAL } from '../../../../../store/modal';
import { ModalContext } from '../../../../../store/modal/provider';
import Notification from '../../../../../utils/configToastify';
import useDebounce from '../../../../../utils/useDebounce';
import DeleteModal from '../../../layout/modal_del';
import './BlogList.css';

export const BlogList = () => {
  const { dispatch } = useContext(ModalContext)

  const [form] = Form.useForm()
  const [delID, setDelID] = useState("");
  const [page, setPage] = useState(1);
  const [typeDelete, setTypeDelete] = useState('')

  const [sortTitle, setSortTitle] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [type, setType] = useState("");
  const [title, setTitle] = useState('')

  const searchType = useDebounce(type, 500)
  const searchTitle = useDebounce(title, 500)
  const searchSortTitle = useDebounce(sortTitle, 500)
  const searchSortOrder = useDebounce(sortOrder, 500)

  const [totalProducts, setTotalProducts] = useState(0);
  const [items, setItems] = useState([])


  const { mutate } = useMutation({
    mutationFn: (data) => updateBlog(data),
    onSuccess: () => {
      Notification({ message: "Update status of blog sucessfully", type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['blog_admin'] })
    },
    onError: (error) => {
      Notification({ message: error?.response?.data, type: "error" })
    }
  })

  const { data, isSuccess } = useQuery({
    queryKey: ['blog_admin', page, searchTitle, searchSortTitle, searchSortOrder, searchType],
    queryFn: () => listBlog(page,
      searchTitle !== undefined ? searchTitle : '',
      searchType !== undefined ? searchType : '',
      searchSortOrder, searchSortTitle),
    enabled: !!searchTitle || !!page || !!searchSortTitle || !!searchSortOrder || !!searchType
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
  }, [searchTitle, searchSortTitle, searchSortOrder, searchType])


  useEffect(() => {

    if (!isSuccess) return
    setItems(
      data?.data?.docs?.map((item) => ({
        key: item?._id,
        title: item?.title,
        isActive: item?.isActive,
        order: item?.order
      }))
    );

    setTotalProducts(data?.data?.totalDocs)

    return () => {
      setItems([])
    }

  }, [data, isSuccess]);



  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 400,
      sorter: true,
      ellipsis: true,
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
        <Button danger type='primary' icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }); setDelID(row.key), setTypeDelete('blogOne') }} />
        <Button icon={<EyeOutlined />} onClick={() => onEdit(row.key)} />
      </Flex>,
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate()

  const onAdd = () => {
    navigate('/admin/blog/create')
  }
  const onEdit = (id) => {
    navigate(`/admin/blog/${id}`)
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
    setTitle(mappedFields['title'])
    setType(mappedFields['type'])
  };

  const onChange = (_pagination, _filters, sorter, _extra) => {
    const { field, order } = sorter;
    let newSortTitle = '';
    let newSortOrder = '';
    console.log(sorter);
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
  return (
    <Flex vertical gap={"middle"} className='blog_list_admin'>
      <Flex>
        <Form form={form} onFieldsChange={onFieldsChange} style={{ width: "100%" }}>
          <Flex gap={'middle'} width="100%" justify='space-between'>
            <Form.Item
              name="title"
              style={{ width: "33%" }}
            >
              <Input type="text" placeholder="Title" size="large" />
            </Form.Item>
            <Form.Item
              name="type"
              style={{ width: "15%" }}
            >
              <Select placeholder="Type" size="large" allowClear>
                <Select.Option value={0} >Deactivate</Select.Option>
                <Select.Option value={1}>Activate</Select.Option>
              </Select>
            </Form.Item>
          </Flex>

        </Form>
      </Flex>
      <Flex justify='space-between'>
        <Button danger type='primary' disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }), setTypeDelete("blogList") }} />
        <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}> Add new blog</Button>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={items}
        rowHoverable
        rowSelection={rowSelection}
        pagination={{ hideOnSinglePage: true, pageSize: 6, total: totalProducts, defaultCurrent: 1, showSizeChanger: false, onChange: setPage }}
        onChange={onChange}
      />
      <DeleteModal type_del={typeDelete} id_del={delID} />
    </Flex>
  )
}
