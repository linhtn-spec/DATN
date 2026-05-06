import { LineChartOutlined, MoneyCollectOutlined, PlusOutlined, SearchOutlined, WalletOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Flex, Form, Input, InputNumber, Modal, Row, Select, Statistic, Table, Tag, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { createWithdrawal, getFinanceOverview, getWithdrawalsHistory, lookupBankAccount } from "../../../../services/finance_service";
import Notification from "../../../../utils/configToastify";

const { Title } = Typography;

function FinanceDashboard() {
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        totalProfit: 0,
        totalCOGS: 0,
        totalAdjustmentLoss: 0,
        netProfit: 0,
        balance: 0,
        totalWithdrawal: 0
    });
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const [banks, setBanks] = useState([]);
    const memoizedBanks = useMemo(() => banks, [banks]);
    const [isLookingUp, setIsLookingUp] = useState(false);

    const fetchOverview = async () => {
        try {
            const res = await getFinanceOverview();
            setOverview(res.data);
        } catch (error) {
            console.error("Failed to load finance overview");
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await getWithdrawalsHistory();
            setWithdrawals(res.data);
        } catch (error) {
            console.error("Failed to load withdrawal history");
        } finally {
            setLoading(false);
        }
    };

    const fetchBanks = async () => {
        try {
            const res = await axios.get("https://api.vietqr.io/v2/banks");
            if (res.data?.code === '00') {
                setBanks(res.data.data.map(b => ({
                    value: b.bin,
                    label: `(${b.shortName}) ${b.name}`,
                    name: b.shortName,
                    fullName: b.name,
                    logo: b.logo
                })));
            }
        } catch (error) {
            console.error("Failed to fetch bank list");
        }
    };

    const lookupAccount = async () => {
        const bin = form.getFieldValue('bankBin');
        const accountNumber = form.getFieldValue('accountNumber');

        if (!bin || !accountNumber) {
            Notification({ message: "Vui lòng chọn ngân hàng và nhập số tài khoản!", type: "warning" });
            return;
        }

        try {
            setIsLookingUp(true);
            // Calling our backend proxy which has the Casso API keys
            const res = await lookupBankAccount({
                bin,
                accountNumber
            });

            if (res.data?.code === '00' || res.data?.code === '200') {
                const accountData = res.data.data;
                form.setFieldsValue({
                    accountHolder: accountData.accountName || accountData.account_name,
                });
                // Also set the bankName string based on selection
                const selectedBank = banks.find(b => b.value === bin);
                if (selectedBank) {
                    form.setFieldsValue({ bankName: selectedBank.name });
                }
                Notification({ message: "Đã tìm thấy thông tin chủ tài khoản!", type: "success" });
            } else {
                Notification({ message: res.data?.desc || res.data?.message || "Không tìm thấy tài khoản hoặc thiếu API Key!", type: "error" });
            }
        } catch (error) {
            Notification({ message: error.response?.data?.desc || "Tính năng tra cứu yêu cầu API Key trả phí (Casso). Vui lòng nhập tay!", type: "info" });
        } finally {
            setIsLookingUp(false);
        }
    };

    useEffect(() => {
        fetchOverview();
        fetchHistory();
        fetchBanks();
    }, []);

    const handleCreateWithdrawal = async (values) => {
        if (values.amount > overview.balance) {
            Notification({ message: "Số tiền muốn rút vượt quá số dư (Lợi nhuận) khả dụng!", type: "error" });
            return;
        }

        try {
            await createWithdrawal({
                amount: values.amount,
                bankName: values.bankName,
                accountNumber: values.accountNumber,
                accountHolder: values.accountHolder,
                note: values.note
            });
            Notification({ message: "Ghi nhận lệnh rút tiền thành công!", type: "success" });
            setIsModalOpen(false);
            form.resetFields();
            fetchOverview();
            fetchHistory();
        } catch (error) {
            Notification({ message: error.response?.data?.message || "Đã xảy ra lỗi khi tạo lệnh rút", type: "error" });
        }
    };

    const columns = [
        {
            title: "Ngân hàng",
            dataIndex: "bankName",
            key: "bankName",
            render: (v) => v || <span style={{ color: '#aaa' }}>—</span>
        },
        {
            title: "Số tài khoản",
            dataIndex: "accountNumber",
            key: "accountNumber",
            render: (v) => v || <span style={{ color: '#aaa' }}>—</span>
        },
        {
            title: "Chủ tài khoản",
            dataIndex: "accountHolder",
            key: "accountHolder",
            render: (v) => v || <span style={{ color: '#aaa' }}>—</span>
        },
        {
            title: "Ngày rút",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString("vi-VN"),
        },
        {
            title: "Số tiền (VNĐ)",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            render: (val) => <span style={{ color: "red", fontWeight: "bold" }}>-{val?.toLocaleString()} ₫</span>,
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "completed" ? "green" : "orange"}>
                    {status === "completed" ? "Hoàn thành" : status}
                </Tag>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <Title level={2}>
                    <LineChartOutlined style={{ marginRight: "10px" }} />
                    Quản lý tài chính & Dòng tiền
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                    Tạo lệnh Rút Tiền
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }} align="stretch">
                <Col span={8}>
                    <Card style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                        <Statistic
                            title="TỔNG DOANH THU"
                            value={overview.totalRevenue}
                            precision={0}
                            valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                            prefix={<MoneyCollectOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                        <Statistic
                            title="LỢI NHUẬN GỘP (Doanh thu - Giá vốn)"
                            value={overview.totalProfit}
                            precision={0}
                            valueStyle={{ color: "#fa8c16", fontWeight: "bold" }}
                            prefix={<LineChartOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            background: overview.totalAdjustmentLoss > 0 ? '#fff2f0' : undefined,
                            border: overview.totalAdjustmentLoss > 0 ? '1px solid #ffccc7' : undefined
                        }}
                    >
                        <Statistic
                            title="THIỆT HẠI HÀNG HỦY"
                            value={overview.totalAdjustmentLoss}
                            precision={0}
                            valueStyle={{ color: overview.totalAdjustmentLoss > 0 ? "#cf1322" : "#8c8c8c", fontWeight: "bold" }}
                            prefix={<WarningOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                        <Statistic
                            title="LỢI NHUẬN RÒNG (Sau khi trừ hàng hủy)"
                            value={overview.netProfit}
                            precision={0}
                            valueStyle={{ color: overview.netProfit >= 0 ? "#fa8c16" : "#cf1322", fontWeight: "bold" }}
                            prefix={<LineChartOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                        <Statistic
                            title="ĐÃ RÚT TIỀN"
                            value={overview.totalWithdrawal}
                            precision={0}
                            valueStyle={{ color: "#f5222d", fontWeight: "bold" }}
                            prefix={<WalletOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ height: '100%', display: 'flex', alignItems: 'center', backgroundColor: "#e6ffcc", border: "1px solid #b7eb8f" }}>
                        <Statistic
                            title="SỐ DƯ CÓ THẾ RÚT"
                            value={overview.balance}
                            precision={0}
                            valueStyle={{ color: "#389e0d", fontWeight: "bold" }}
                            prefix={<WalletOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Lịch sử Rút tiền ra từ Hệ thống" bordered={false}>
                <Table
                    dataSource={withdrawals}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </Card>

            <Modal
                title="Tạo lệnh rút tiền"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={540}
            >
                <Form layout="vertical" form={form} onFinish={handleCreateWithdrawal}>
                    <Descriptions column={1} size="small" bordered style={{ marginBottom: 20 }}>
                        <Descriptions.Item label="Số dư khả dụng">
                            <strong style={{ color: "#389e0d", fontSize: "16px" }}>
                                {overview.balance?.toLocaleString()} ₫
                            </strong>
                        </Descriptions.Item>
                    </Descriptions>

                    <Form.Item
                        name="amount"
                        label="Số tiền rút (VNĐ)"
                        rules={[
                            { required: true, message: "Vui lòng nhập số tiền!" },
                            { type: "number", min: 1000, message: "Tối thiểu rút 1,000 VNĐ!" },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập số tiền..."
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="bankBin"
                        label="Ngân hàng"
                        rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
                    >
                        <Select
                            placeholder="Chọn ngân hàng..."
                            showSearch
                            optionFilterProp="label"
                            options={memoizedBanks}
                            loading={banks.length === 0}
                            virtual={false}
                            filterOption={(input, option) => {
                                const searchStr = input.toLowerCase();
                                return (
                                    option.name.toLowerCase().includes(searchStr) ||
                                    option.fullName.toLowerCase().includes(searchStr)
                                );
                            }}
                            optionRender={(option) => (
                                <Flex align="center" gap={10} style={{ height: 45 }}>
                                    <img
                                        src={option.data.logo}
                                        alt={option.data.name}
                                        style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }}
                                    />
                                    <Flex vertical style={{ overflow: 'hidden' }}>
                                        <Typography.Text strong style={{ fontSize: '13px', lineHeight: '1.2' }} ellipsis>{option.data.name}</Typography.Text>
                                        <Typography.Text type="secondary" style={{ fontSize: '11px', lineHeight: '1.2' }} ellipsis>{option.data.fullName}</Typography.Text>
                                    </Flex>
                                </Flex>
                            )}
                            onChange={(bin) => {
                                const b = banks.find(x => x.value === bin);
                                if (b) form.setFieldsValue({ bankName: b.name });
                            }}
                        />
                    </Form.Item>
                    {/* Hidden field to store bank name string for backend */}
                    <Form.Item name="bankName" hidden><Input /></Form.Item>

                    <Form.Item label="Số tài khoản" required>
                        <Input.Group compact>
                            <Form.Item
                                name="accountNumber"
                                noStyle
                                rules={[{ required: true, message: "Vui lòng nhập số tài khoản!" }]}
                            >
                                <Input style={{ width: 'calc(100% - 100px)' }} placeholder="VD: 0123456789" />
                            </Form.Item>
                            <Button
                                style={{ width: '100px' }}
                                type="primary"
                                ghost
                                icon={<SearchOutlined />}
                                onClick={lookupAccount}
                                loading={isLookingUp}
                            >
                                Check
                            </Button>
                        </Input.Group>
                    </Form.Item>
                    <Form.Item
                        name="accountHolder"
                        label="Chủ tài khoản"
                        rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản!" }]}
                    >
                        <Input placeholder="VD: NGUYEN VAN A" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    <Form.Item
                        name="note"
                        label="Ghi chú (Tùy chọn)"
                    >
                        <Input.TextArea rows={2} placeholder="VD: Rút tiền lãi tháng 5..." />
                    </Form.Item>
                    <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" icon={<WalletOutlined />}>
                            Xác nhận rút tiền
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FinanceDashboard;
