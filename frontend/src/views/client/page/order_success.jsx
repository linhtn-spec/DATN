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
        document.title = "Order success";


        return () => {
            document.title = ""
        }
    }, [])

    return (
        <Flex className="order_success container" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>HOME</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/checkout/success'}>ORDER SUCCESS</NavLink>,
                    },
                ]}
            />
            <Typography.Title level={1}>ORDER SUCCESS</Typography.Title >
            <Typography.Title level={2}>THANK YOU FOR YOUR PURCHASE!
            </Typography.Title >
            <Flex justify="center" style={{margin:"100px"}}>
                <Button onClick={navigateHome}>
                    Purchase more
                </Button>
            </Flex>
        </Flex>
    );
}

export default OrderSuccess;