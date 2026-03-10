import { ShoppingOutlined } from "@ant-design/icons";
import { Badge, Button, Flex, Typography } from "antd";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import "./../style/product_list.css";

function Product_List(props) {
  const product = props.products;
  const cart = useContext(CartContext)
  const user = useContext(UserContext)
  const info = user?.state?.currentUser?.user_id
  const addToCart = () => {
    if (info) {
      cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: 1 } })
      Notification({ message: "Add to cart successully!", type: "success" })
    } else {
      Notification({ message: "You have to login first!", type: "error" })
    }
  };

  const navigate = useNavigate()


  return (

    <Flex className='item' key={product?.id} vertical>
      <Link to={`/client/product/${product?.id}`} style={{ backgroundColor: "white" }}>
        <Badge.Ribbon text={'New'} color="red" placement="start">
          <img src={product?.image} loading="lazy" />
        </Badge.Ribbon>
      </Link>
      <Flex className="pt-4" vertical>
        <Typography.Title level={5} className="country">{product?.origin}</Typography.Title>
        <Typography.Title level={4} className="title">{product?.name}</Typography.Title >
        <Typography.Text className="price_promo">
          {product?.pricePromotion !== 0 && <Typography.Text className="promotion">
            {parseFloat(product?.price * (1 - parseFloat(product?.pricePromotion) / 100)).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD', // Adjust currency code as needed
              minimumFractionDigits: 0, // Set minimum decimal places to 0
              maximumFractionDigits: 0,  // Adjust currency code as needed
            })}
          </Typography.Text>}

          <Typography.Text className="price" style={(!product?.pricePromotion ? { textDecoration: "none", fontSize: "16px", fontWeight: 500, color: "red" } : {})}>
            {product?.price.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD', // Adjust currency code as needed
              minimumFractionDigits: 0, // Set minimum decimal places to 0
              maximumFractionDigits: 0,  // Adjust currency code as needed
            })}
          </Typography.Text>
        </Typography.Text>
      </Flex>
      {(!product?.status || !product?.quantity) ? <Button onClick={() => navigate(`/client/product/${product?.id}`)}>view detail</Button>
        : <Button icon={<ShoppingOutlined />} onClick={addToCart}>add to cart</Button>

      }
    </Flex >

  );
}

export default Product_List; 