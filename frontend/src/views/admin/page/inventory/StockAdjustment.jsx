import { MinusCircleOutlined, PlusOutlined, ToolOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Badge, Button, Card, Col, DatePicker, Flex, Form, InputNumber,
    Modal, Row, Select, Space, Table, Tag, Typography
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { useState } from 'react';
import { queryClient } from '../../../../main';
import { productAll } from '../../../../services/product_service';
import { createAdjustment, listAdjustments } from '../../../../services/stock_adjustment_service';
import Notification from '../../../../utils/configToastify';

dayjs.locale('vi');

const { Title, Text } = Typography;

const REASON_OPTIONS = [
    { value: 'expired', label: '🕐 Hết hạn sử dụng', color: 'red' },
    { value: 'damaged', label: '💥 Hư hỏng / Dập nát', color: 'orange' },
    { value: 'lost', label: '🔍 Thất thoát / Mất hàng', color: 'purple' },
    { value: 'other', label: '📝 Lý do khác', color: 'default' },
];

const reasonTag = (r) => {
    const opt = REASON_OPTIONS.find(o => o.value === r);
    return opt ? <Tag color={opt.color}>{opt.label}</Tag> : <Tag>{r}</Tag>;
};

export const StockAdjustment = () => {
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reasonFilter, setReasonFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['stock_adjustments', page, reasonFilter],
        queryFn: () => listAdjustments(page, reasonFilter),
    });

    const docs = data?.data?.docs || [];
    const total = data?.data?.totalDocs || 0;

    const { data: productData } = useQuery({
        queryKey: ['products_option_adj'],
        queryFn: () => productAll(),
    });
    const productOptions = (productData?.data?.data || []).map(p => ({
        value: p._id,
        label: `${p.name} (${p.unit || 'sản phẩm'}) — Tồn: ${p.quantity?.inTrade ?? 0}`,
    }));

    const { mutate, isPending } = useMutation({
        mutationFn: createAdjustment,
        onSuccess: () => {
            Notification({ message: 'Tạo phiếu kiểm kê thành công!', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
            queryClient.invalidateQueries({ queryKey: ['products_admin'] });
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (err) => {
            Notification({ message: err?.response?.data?.message || 'Tạo phiếu thất bại!', type: 'error' });
        }
    });

    const onFinish = (values) => {
        mutate({
            products: values.products,
            adjustmentDate: values.adjustmentDate ? values.adjustmentDate.toISOString() : new Date().toISOString()
        });
    };

    const columns = [
        {
            title: '#',
            align: 'center',
            width: 50,
            render: (_, __, idx) => (page - 1) * 8 + idx + 1
        },
        {
            title: 'Ngày kiểm kê',
            dataIndex: 'adjustmentDate',
            width: 130,
            align: 'center',
            render: (d) => dayjs(d).format('DD/MM/YYYY')
        },
        {
            title: 'Sản phẩm hủy',
            dataIndex: 'products',
            render: (products) => (
                <Space direction="vertical" size={2}>
                    {products?.map((p, i) => (
                        <Space key={i} size={4}>
                            <Text>{p.productId?.name}</Text>
                            <Tag color="volcano">-{p.quantity} {p.productId?.unit}</Tag>
                            {reasonTag(p.reason)}
                        </Space>
                    ))}
                </Space>
            )
        },
        {
            title: 'Ước tính thiệt hại',
            dataIndex: 'totalLoss',
            width: 160,
            align: 'right',
            render: (v) => <Text type="danger" strong>{v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
        },
        {
            title: 'Người lập',
            dataIndex: 'userId',
            width: 140,
            render: (u) => u ? `${u.firstName} ${u.lastName}` : '—'
        },
    ];

    return (
        <Flex vertical gap={16}>
            <Flex justify="space-between" align="center">
                <Space align="center">
                    <ToolOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                    <Title level={4} style={{ margin: 0 }}>Phiếu kiểm kê / Hủy hàng</Title>
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Tạo phiếu hủy hàng
                </Button>
            </Flex>

            <Row gutter={[16, 0]}>
                <Col>
                    <Text>Lọc theo lý do:</Text>
                </Col>
                <Col>
                    <Select
                        allowClear
                        placeholder="Tất cả lý do"
                        style={{ width: 220 }}
                        options={REASON_OPTIONS}
                        onChange={(v) => { setReasonFilter(v || ''); setPage(1); }}
                    />
                </Col>
            </Row>

            <Table
                bordered
                rowKey="_id"
                columns={columns}
                dataSource={docs}
                loading={isLoading}
                pagination={{ current: page, total, pageSize: 8, onChange: setPage, hideOnSinglePage: true }}
                locale={{ emptyText: <Text type="secondary">Chưa có phiếu kiểm kê nào.</Text> }}
            />

            {/* Create Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
                title={<Space><ToolOutlined style={{ color: '#722ed1' }} /><span>Tạo phiếu kiểm kê / Hủy hàng</span></Space>}
                footer={null}
                width={720}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="adjustmentDate" label="Ngày kiểm kê">
                        <DatePicker locale={locale} style={{ width: '100%' }} defaultValue={dayjs()} />
                    </Form.Item>

                    <Form.List name="products" initialValue={[{}]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name }) => (
                                    <Card
                                        key={key}
                                        size="small"
                                        style={{ marginBottom: 12, background: '#fafafa' }}
                                        extra={fields.length > 1 && (
                                            <MinusCircleOutlined
                                                style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                                onClick={() => remove(name)}
                                            />
                                        )}
                                    >
                                        <Row gutter={12}>
                                            <Col span={10}>
                                                <Form.Item name={[name, 'productId']} label="Sản phẩm"
                                                    rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
                                                    <Select
                                                        showSearch
                                                        placeholder="Chọn sản phẩm"
                                                        options={productOptions}
                                                        optionFilterProp="label"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={[name, 'quantity']} label="Số lượng hủy"
                                                    rules={[{ required: true, message: 'Nhập số lượng' }]}>
                                                    <InputNumber min={1} style={{ width: '100%' }} placeholder="SL" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={9}>
                                                <Form.Item name={[name, 'reason']} label="Lý do"
                                                    rules={[{ required: true, message: 'Chọn lý do' }]}>
                                                    <Select placeholder="Chọn lý do" options={REASON_OPTIONS} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item name={[name, 'note']} label="Ghi chú (tùy chọn)">
                                            <Select
                                                mode="tags"
                                                placeholder="Nhập ghi chú..."
                                                style={{ width: '100%' }}
                                                open={false}
                                                tokenSeparators={[',']}
                                            />
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    block
                                    onClick={() => add()}
                                    style={{ marginBottom: 16 }}
                                >
                                    Thêm sản phẩm
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Flex justify="flex-end" gap={8}>
                        <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isPending} danger>
                            Xác nhận hủy hàng
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </Flex>
    );
};

export default StockAdjustment;
