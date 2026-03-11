import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { Link } from "react-router-dom";
import "./../style/product_LSView.css";
import { useContext } from "react";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import { useMutation } from "@tanstack/react-query";
import { addFavourite } from "../../../services/favourite_service";
import { ACTION_FAVOURITE, FavouriteContext } from "../../../store/favourite";
function Product_LSView(props) {
    const product = props.products;
    const cart = useContext(CartContext)
    const user = useContext(UserContext)
    const favourite = useContext(FavouriteContext)

    const info = user?.state?.currentUser
    const addToCart = () => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: 1 } })
            Notification({ message: "Add to cart successully!", type: "success" })
        }
        else {
            Notification({ message: "You have to login first!", type: "error" })

        }
    };
    const { mutate } = useMutation({
        mutationFn: (id) => addFavourite(id),
        onSuccess: () => {
            Notification({ message: "Add to wishlist successfully!", type: "success" })
        },
        onError: (error) => {
            Notification({ message: `${error.response.data.message}`, type: "info" })

        }
    })
    const addToFavourite = () => {

        if (info) {
            mutate(product.id)
            favourite.dispatch({ type: ACTION_FAVOURITE.ADD_FAVOURITE, payload: product })
        }
        else
            Notification({ message: "You have to login first!", type: "error" })

    }
    // const addToCart = () => {
    //     const cart = props.state.cart;
    //     console.log(1);
    //     const existingItemIndex = cart.findIndex(cartItem => cartItem.product_id === product.product_id);
    //     if (existingItemIndex !== -1) {
    //         cart[existingItemIndex].quantity += 1;
    //     } else {
    //         cart.push({ ...product, quantity: 1 });
    //     }
    //     props.addToCart(cart);

    // };
    return (
        <Flex className='item_related' vertical gap={30}>
            <Flex vertical align="center">
                <Link to={`/client/product/${product?.id}`}>
                    <img src={product?.image} loading="lazy" />
                </Link>
                <Typography.Title className="title" level={4} ellipsis={true} style={{ maxWidth: "70%" }}>{product.name}</Typography.Title>
                <Typography.Text className="price_promo">
                    {Number(product?.pricePromotion) > 0 ? (
                        <>
                            <Typography.Text className="promotion">
                                {(product.price * (1 - Number(product?.pricePromotion) / 100)).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                })}
                            </Typography.Text>
                            <Typography.Text className="price">
                                {product.price?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                })}
                            </Typography.Text>
                        </>
                    ) : (
                        <Typography.Text className="promotion" style={{ color: '#ff2c26' }}>
                            {product.price?.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </Typography.Text>
                    )}
                </Typography.Text>
            </Flex>
            <Flex className="button_group" justify="space-evenly">
                <Button shape="circle" onClick={addToCart} disabled={!product?.quantity}><ShoppingCartOutlined /></Button>
                <Button shape="circle" onClick={addToFavourite}><HeartOutlined /></Button>
            </Flex>
        </Flex>

    );
}

export default Product_LSView; 