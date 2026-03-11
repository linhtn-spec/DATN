import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Image, Input, Select, Switch, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { listCategory, updateCategory } from '../../../../../services/category_service';
import Notification from '../../../../../utils/configToastify';
import useDebounce from '../../../../../utils/useDebounce';
import DeleteModal from '../../../layout/modal_del';
import './CategoryList.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ModalContext } from '../../../../../store/modal/provider';
import { ACTION_MODAL } from '../../../../../store/modal';
import { queryClient } from '../../../../../main';

export const CategoryList = () => {
  const { dispatch } = useContext(ModalContext)

  const [form] = Form.useForm()
  const [delID, setDelID] = useState("");
  const [page, setPage] = useState(1);
  const [typeDelete, setTypeDelete] = useState('')

  const [sortName, setSortName] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [type, setType] = useState("");
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const searchType = useDebounce(type, 500)
  const searchName = useDebounce(name, 500)
  const searchDescription = useDebounce(description, 500)
  const searchSortName = useDebounce(sortName, 500)
  const searchSortOrder = useDebounce(sortOrder, 500)

  const [totalProducts, setTotalProducts] = useState(0);
  const [items, setItems] = useState([])


  const { mutate } = useMutation({
    mutationFn: (data) => updateCategory(data),
    onSuccess: () => {
      Notification({ message: "Update status of category sucessfully", type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['category_admin'] })
    },
    onError: (error) => {
      Notification({ message: error?.response?.data, type: "error" })
    }
  })

  const { data, isSuccess } = useQuery({
    queryKey: ['category_admin', page, searchDescription, searchName, searchSortName, searchSortOrder, searchType],
    queryFn: () => listCategory(page,
      searchName !== undefined ? searchName : '',
      searchDescription !== undefined ? searchDescription : '',
      searchType !== undefined ? searchType : '',
      searchSortOrder, searchSortName),
    enabled: !!searchDescription || !!searchName || !!page || !!searchSortName || !!searchSortOrder || !!searchType
  })

  useEffect(() => {
    setPage(1)

    return () => {
      setPage(1)
    }
  }, [searchDescription, searchName, searchSortName, searchSortOrder, searchType])

  useEffect(() => {

    if (!isSuccess) return
    setItems(
      data?.data?.docs?.map((item) => ({
        key: item?._id,
        name: item?.name,
        image: item?.image,
        description: item?.description,
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
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 100,
      render: (text) => <Image preview={false} src={text} width={70} height={70} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
      />

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
        <Button danger type='primary' icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }); setDelID(row.key), setTypeDelete('categoryOne') }} />
        <Button icon={<EyeOutlined />} onClick={() => onEdit(row.key)} />
      </Flex>,
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate()

  const onAdd = () => {
    navigate('/admin/category/create')
  }
  const onEdit = (id) => {
    navigate(`/admin/category/${id}`)
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
    setName(mappedFields['name'])
    setType(mappedFields['type'])
  };

  const onChange = (_pagination, _filters, sorter, _extra) => {
    const { field, order } = sorter;
    let newSortName = '';
    let newSortOrder = '';
    console.log(field, order);

    if (order !== undefined) {
      if (field === 'name') {
        newSortName = order;
      } else if (field === 'order') {
        newSortOrder = order;
      }
    }
    setSortName(newSortName);
    setSortOrder(newSortOrder);
  };

  useEffect(() => {
    document.title = "Category"

  }, [])

  return (
    <Flex vertical gap={"middle"} className='category_list'>
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
        <Button danger type='primary' disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />} onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }), setTypeDelete("categoryList") }} />
        <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}> Add new category</Button>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={items}
        rowHoverable
        rowSelection={rowSelection}
        pagination={{ hideOnSinglePage: true, pageSize: 6, total: totalProducts, defaultCurrent: 1, current: page, showSizeChanger: false, onChange: setPage }}
        onChange={onChange}
      />
      <DeleteModal type_del={typeDelete} id_del={delID} />

    </Flex>
  )
}
