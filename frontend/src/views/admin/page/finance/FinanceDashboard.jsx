import { PlusOutlined, LineChartOutlined, MoneyCollectOutlined, WalletOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Form, Input, InputNumber, Modal, Row, Statistic, Table, Tag, Typography } from "antd";
import React, { useEffect, useState } from "react";
import Notification from "../../../../utils/configToastify";
import { getFinanceOverview, getWithdrawalsHistory, createWithdrawal } from "../../../../services/finance_service";

const { Title } = Typography;

function FinanceDashboard() {
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        totalProfit: 0,
        balance: 0,
        totalWithdrawal: 0
    });
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

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

    useEffect(() => {
        fetchOverview();
        fetchHistory();
    }, []);

    const handleCreateWithdrawal = async (values) => {
        if (values.amount > overview.balance) {
            Notification({ message: "Số tiền muốn rút vượt quá số dư (Lợi nhuận) khả dụng!", type: "error" });
            return;
        }

        try {
            await createWithdrawal({ amount: values.amount, note: values.note });
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
            title: "Ngày rút",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString("vi-VN"),
        },
        {
            title: "Số tiền (VNĐ)",
            dataIndex: "amount",
            key: "amount",
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

            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col span={6}>
                    <Card>
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
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="TỔNG LỢI NHUẬN"
                            value={overview.totalProfit}
                            precision={0}
                            valueStyle={{ color: "#fa8c16", fontWeight: "bold" }}
                            prefix={<LineChartOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
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
                <Col span={6}>
                    <Card style={{ backgroundColor: "#e6ffcc", border: "1px solid #b7eb8f" }}>
                        <Statistic
                            title="SỐ DƯ CÓ THỂ RÚT"
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
                title="Tạo lệnh rút tiền (Finance Withdrawal)"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form layout="vertical" form={form} onFinish={handleCreateWithdrawal}>
                    <Descriptions column={1} size="small" bordered style={{ marginBottom: 20 }}>
                        <Descriptions.Item label="Lợi nhuận khả dụng hiện tại">
                            <strong style={{ color: "#389e0d", fontSize: "16px" }}>
                                {overview.balance?.toLocaleString()} ₫
                            </strong>
                        </Descriptions.Item>
                    </Descriptions>

                    <Form.Item
                        name="amount"
                        label="Số tiền muốn rút (VNĐ)"
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
                        name="note"
                        label="Ghi chú (Tùy chọn)"
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Rút tiền lãi tháng 5..." />
                    </Form.Item>
                    <Form.Item style={{ textAlign: "right" }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Ghi nhận rút tiền
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FinanceDashboard;
