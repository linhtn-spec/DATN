import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Flex, Typography } from "antd";
import "./../style/product_grid.css";
import { CloseOutlined, HeartOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { ACTION_CART, CartContext } from "../../../store/cart";
import Notification from "../../../utils/configToastify";
import { UserContext } from "../../../store/user";
import { useMutation } from "@tanstack/react-query";
import { addFavourite, deleteFavourite } from "../../../services/favourite_service";
import { queryClient } from "../../../main";
import { ACTION_FAVOURITE, FavouriteContext } from "../../../store/favourite";
function ProductGrid(props) {
    const product = props?.products;
    const type = props?.type
    const cart = useContext(CartContext)
    const user = useContext(UserContext)
    const favourite = useContext(FavouriteContext)

    const info = user?.state?.currentUser?.user_id
    const addToCart = () => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: 1 } })
            Notification({ message: "Add to cart successully!", type: "success" })
        }
        else {
            Notification({ message: "You have to login first!", type: "error" })
        }
    };
    const navigate = useNavigate()

    const addToUserFavourite = useMutation({
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
            addToUserFavourite.mutate(product.id)
            favourite.dispatch({ type: ACTION_FAVOURITE.ADD_FAVOURITE, payload: product })
        }
        else
            Notification({ message: "You have to login first!", type: "error" })

    }

    const { mutate } = useMutation({
        mutationFn: (id) => deleteFavourite(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favourite'] })
            Notification({ message: "Delete product from wishlist successfully!", type: "success" })
        },
        onError: () => Notification({ message: "System error!", type: "error" })
    })

    const handleDelete = (id) => {
        mutate(id)
        favourite.dispatch({ type: ACTION_FAVOURITE.DELETE_ITEM, payload: id })

    }

    return (
        <Flex className='item' key={product.id} vertical >
            {type === 'wishlist' &&
                <Button danger type="primary" shape="circle" className="delete_favourite" icon={<CloseOutlined />} onClick={() => handleDelete(product.id)} />}
            {!type && <Button className="favourite" onClick={() => addToFavourite()} icon={<HeartOutlined />} />}
            <Link to={`/client/product/${product.id}`} style={{ backgroundColor: "white" }}>
                {!type && (product.pricePromotion !== 0 ?
                    <Badge.Ribbon text={`-${product.pricePromotion}%`} color="red" placement="start" />
                    :
                    <></>
                )}
                <img src={product.image} loading="lazy" />

            </Link>
            <Flex className="pt-4" vertical>
                {!type &&
                    (<>
                        <Typography.Title level={5} className="country">{product.origin}</Typography.Title>
                    </>)}
                <Typography.Title level={4} className="title">{product.name}</Typography.Title >
                {!type &&
                    (<>
                        <Typography.Text className="price_promo">
                            {product?.pricePromotion !== 0 &&
                                <Typography.Text className="promotion">
                                    {parseFloat(product.price * (1 - parseFloat(product.pricePromotion) / 100)).toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD', // Adjust currency code as needed
                                        minimumFractionDigits: 0, // Set minimum decimal places to 0
                                        maximumFractionDigits: 0,  // Adjust currency code as needed
                                    })}
                                </Typography.Text>}
                            <Typography.Text className="price" style={(!product?.pricePromotion ? {
                                color: ' #ff2c26',
                                fontWeight: 600,
                                fontSize: '15px',
                                marginBottom: '5px',
                                textDecoration: "none"
                            } : {})}>
                                {product.price.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD', // Adjust currency code as needed
                                    minimumFractionDigits: 0, // Set minimum decimal places to 0
                                    maximumFractionDigits: 0,  // Adjust currency code as needed
                                })}
                            </Typography.Text>
                        </Typography.Text> </>)}
            </Flex>
            {!type && ((!product?.status || !product?.quantity) ? <Button className="buy" onClick={() => navigate(`/client/product/${product?.id}`)}>view detail</Button> : <Button icon={<ShoppingOutlined />} className="buy" onClick={addToCart}>add to cart</Button>)}

        </Flex >
    );
}
export default ProductGrid;