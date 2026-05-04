import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Form, Input, Select, Switch, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { TypeDeleteAdmin } from '../../../../../constants/deleteTypes';
import { queryClient } from '../../../../../main';
import { listBlog, updateBlog } from '../../../../../services/blog_service';
import { ACTION_MODAL } from '../../../../../store/modal';
import { ModalContext } from '../../../../../store/modal/provider';
import Notification from '../../../../../utils/configToastify';
import useDebounce from '../../../../../utils/useDebounce';
import DeleteModal from '../../../layout/modal_del';

export const BlogList = () => {
  const { dispatch } = useContext(ModalContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [delID, setDelID] = useState('');
  const [typeDelete, setTypeDelete] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [sortTitle, setSortTitle] = useState('');

  const dTitle = useDebounce(title, 500);
  const dIsActive = useDebounce(isActive, 500);
  const dSortOrder = useDebounce(sortOrder, 500);
  const dSortTitle = useDebounce(sortTitle, 500);

  const { mutate: toggleActive } = useMutation({
    mutationFn: (data) => updateBlog(data),
    onSuccess: () => {
      Notification({ message: 'Cập nhật trạng thái bài viết thành công!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['blog_admin'] });
    },
    onError: (error) => Notification({ message: error?.response?.data?.message ?? 'Có lỗi xảy ra!', type: 'error' }),
  });

  const { data, isSuccess } = useQuery({
    queryKey: ['blog_admin', page, dTitle, dIsActive, dSortOrder, dSortTitle],
    queryFn: () => listBlog(page, dTitle, dIsActive, dSortOrder, dSortTitle),
  });

  useEffect(() => {
    if (!isSuccess) return;
    setItems(
      data?.data?.docs?.map((item) => ({
        key: item._id,
        title: item.title,
        content: item.content,
        order: item.order,
        isActive: item.isActive,
        author: item.user ? `${item.user.firstName} ${item.user.lastName}` : '—',
      }))
    );
    setTotal(data?.data?.totalDocs ?? 0);
    return () => setItems([]);
  }, [data, isSuccess]);

  useEffect(() => { setPage(1); }, [dTitle, dIsActive]);

  useEffect(() => { document.title = 'Quản lý bài viết'; }, []);

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', sorter: true, ellipsis: true, width: 220 },
    { title: 'Nội dung', dataIndex: 'content', ellipsis: true },
    { title: 'Tác giả', dataIndex: 'author', width: 160 },
    { title: 'Thứ tự', dataIndex: 'order', width: 80, sorter: true, align: 'center' },
    {
      title: 'Kích hoạt', dataIndex: 'isActive', width: 90,
      render: (value, row) => (
        <Switch value={value} onChange={(e) => toggleActive({ id: row.key, isActive: e })} />
      ),
    },
    {
      title: 'Hành động', width: 100, key: 'action',
      render: (_, row) => (
        <Flex justify="center" gap={5}>
          <Button
            danger type="primary" icon={<DeleteOutlined />}
            onClick={() => {
              dispatch({ type: ACTION_MODAL.OPEN_MODAL });
              setDelID(row.key);
              setTypeDelete(TypeDeleteAdmin.BLOG_ONE);
            }}
          />
          <Button icon={<EditOutlined />} onClick={() => navigate(`/admin/blog/${row.key}`)} />
        </Flex>
      ),
    },
  ];

  const onSelectChange = (keys) => { setSelectedRowKeys(keys); setDelID(keys); };

  const onFieldsChange = (_, fields) => {
    const mapped = fields.reduce((acc, f) => { acc[f.name[0]] = f.value; return acc; }, {});
    if (mapped.title !== undefined) setTitle(mapped.title ?? '');
    if (mapped.isActive !== undefined) setIsActive(mapped.isActive ?? '');
  };

  const onChange = (_pag, _filters, sorter) => {
    const { field, order } = sorter;
    setSortTitle(field === 'title' && order ? order : '');
    setSortOrder(field === 'order' && order ? order : '');
  };

  return (
    <Flex vertical gap="middle">
      <Flex>
        <Form form={form} onFieldsChange={onFieldsChange} style={{ width: '100%' }}>
          <Flex gap="middle">
            <Form.Item name="title" style={{ flex: 1 }}>
              <Input placeholder="Tìm theo tiêu đề" />
            </Form.Item>
            <Form.Item name="isActive" style={{ width: 160 }}>
              <Select placeholder="Trạng thái" allowClear>
                <Select.Option value="false">Ẩn</Select.Option>
                <Select.Option value="true">Hiện</Select.Option>
              </Select>
            </Form.Item>
          </Flex>
        </Form>
      </Flex>
      <Flex justify="space-between">
        <Button
          danger type="primary" icon={<DeleteOutlined />}
          disabled={selectedRowKeys.length === 0}
          onClick={() => { dispatch({ type: ACTION_MODAL.OPEN_MODAL }); setTypeDelete(TypeDeleteAdmin.BLOG_LIST); }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/blog/create')}>
          Thêm bài viết
        </Button>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={items}
        rowHoverable
        rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
        pagination={{ hideOnSinglePage: true, pageSize: 6, total, current: page, showSizeChanger: false, onChange: setPage }}
        onChange={onChange}
      />
      <DeleteModal type_del={typeDelete} id_del={delID} />
    </Flex>
  );
};
