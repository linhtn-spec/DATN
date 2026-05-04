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
      Notification({ message: "Đã thêm vào giỏ hàng!", type: "success" })
    } else {
      Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })
    }
  };

  const navigate = useNavigate()


  return (

    <Flex className='item' key={product?.id} vertical>
      <Link to={`/client/product/${product?.id}`} style={{ backgroundColor: "white" }}>
        <Badge.Ribbon text={'Mới'} color="red" placement="start">
          <img src={product?.image} loading="lazy" />
        </Badge.Ribbon>
      </Link>
      <Flex className="pt-4" vertical>
        <Typography.Title level={5} className="country">{product?.origin}</Typography.Title>
        <Typography.Title level={4} className="title">{product?.name}</Typography.Title >
        <Typography.Text className="price_promo">
          {Number(product?.pricePromotion) > 0 ? (
            <>
              <Typography.Text className="promotion">
                {(product.price * (1 - Number(product?.pricePromotion) / 100)).toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                })}
              </Typography.Text>
              <Typography.Text className="price">
                {product.price?.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                })}
              </Typography.Text>
            </>
          ) : (
            <Typography.Text className="promotion" style={{ color: '#ff2c26' }}>
              {product.price?.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
              })}
            </Typography.Text>
          )}
        </Typography.Text>
      </Flex>
      {(!product?.status || !product?.quantity) ? <Button onClick={() => navigate(`/client/product/${product?.id}`)}>Chi tiết</Button>
        : <Button icon={<ShoppingOutlined />} onClick={addToCart}>Thêm vào giỏ</Button>

      }
    </Flex >

  );
}

export default Product_List; 