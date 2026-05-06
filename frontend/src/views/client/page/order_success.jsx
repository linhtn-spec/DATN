import { Breadcrumb, Button, Flex, Result, Typography } from "antd";
import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/order_success.css";

function OrderSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Đặt hàng thành công";
        window.scrollTo(0, 0);
        return () => {
            document.title = "";
        }
    }, [])

    return (
        <Flex className="order_success container" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/checkout/success'}>ĐẶT HÀNG THÀNH CÔNG</NavLink>,
                    },
                ]}
            />

            <Flex justify="center" align="center" style={{ padding: '60px 0', minHeight: '50vh' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px 60px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                    maxWidth: '800px',
                    width: '100%'
                }}>
                    <Result
                        status="success"
                        title={<Typography.Title level={2} style={{ color: 'var(--primary-color)', marginTop: '20px' }}>ĐẶT HÀNG THÀNH CÔNG!</Typography.Title>}
                        subTitle={
                            <Typography.Paragraph style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
                                Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>Scart</strong>. <br />
                                Thông tin chi tiết đơn hàng đã được gửi vào email của bạn. <br />
                                Cửa hàng sẽ sớm liên hệ để xác nhận và giao hàng.
                            </Typography.Paragraph>
                        }
                        extra={[
                            <Button
                                type="primary"
                                key="orders"
                                size="large"
                                onClick={() => navigate('/client/user/orders')}
                                style={{ borderRadius: '8px', fontWeight: 500, marginRight: '16px', marginBottom: '10px', height: '45px', padding: '0 24px' }}
                            >
                                Theo dõi đơn hàng
                            </Button>,
                            <Button
                                key="buy"
                                size="large"
                                onClick={() => navigate('/client/shop')}
                                style={{ borderRadius: '8px', fontWeight: 500, height: '45px', padding: '0 24px' }}
                            >
                                Tiếp tục mua sắm
                            </Button>,
                        ]}
                    />
                </div>
            </Flex>
        </Flex>
    );
}

export default OrderSuccess;