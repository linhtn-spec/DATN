import { Breadcrumb, Button, Flex, Typography } from "antd";
import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/order_success.css";
function OrderSuccess() {
    // const orderList = props.state.order;
    // const order = orderList[orderList.length - 1];
    const navigate = useNavigate();
    const navigateHome = () => {
        navigate('/client')
    }
    useEffect(() => {
        document.title = "Đặt hàng thành công";


        return () => {
            document.title = ""
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
            <Typography.Title level={1}>ĐẶT HÀNG THÀNH CÔNG</Typography.Title >
            <Typography.Title level={2}>CẢM ƠN BẠN ĐÃ MUA HÀNG!
            </Typography.Title >
            <Flex justify="center" style={{margin:"100px"}}>
                <Button onClick={navigateHome}>
                    Tiếp tục mua hàng
                </Button>
            </Flex>
        </Flex>
    );
}

export default OrderSuccess;