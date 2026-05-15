import { CloseOutlined, DeleteOutlined, HeartFilled, HeartOutlined, ShoppingOutlined, StarFilled } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Badge, Button, Flex, Rate, Typography } from "antd";
import clsx from "clsx";
import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { queryClient } from "../../../main";
import { addFavourite, deleteFavourite } from "../../../services/favourite_service";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { ACTION_FAVOURITE, FavouriteContext } from "../../../store/favourite";
import { UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import "./../style/product_grid.css";
function ProductGrid(props) {
    const product = props?.products;
    const type = props?.type
    const cart = useContext(CartContext)
    const user = useContext(UserContext)
    const favourite = useContext(FavouriteContext)
    const isFavourite = favourite?.state?.favourite?.some(item => item.id === product.id)

    const info = user?.state?.currentUser?.user_id
    const addToCart = () => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: 1 } })
            Notification({ message: "Đã thêm vào giỏ hàng!", type: "success" })
        }
        else {
            Notification({ message: "Vui lòng đăng nhập trước!", type: "error" })
        }
    };
    const navigate = useNavigate()

    const addToUserFavourite = useMutation({
        mutationFn: (id) => addFavourite(id),
        onSuccess: () => {
            Notification({ message: "Đã thêm vào yêu thích!", type: "success" })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "info" })
        }
    })
    const { mutate: deleteMutate } = useMutation({
        mutationFn: (id) => deleteFavourite(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favourite'] })
            Notification({ message: "Đã xóa khỏi danh sách yêu thích!", type: "success" })
        },
        onError: () => Notification({ message: "Lỗi hệ thống!", type: "error" })
    })

    const toggleFavourite = () => {
        if (info) {
            if (isFavourite) {
                deleteMutate(product.id)
                favourite.dispatch({ type: ACTION_FAVOURITE.DELETE_ITEM, payload: product.id })
            } else {
                addToUserFavourite.mutate(product.id)
                favourite.dispatch({ type: ACTION_FAVOURITE.ADD_FAVOURITE, payload: product })
            }
        }
        else
            Notification({ message: "Vui lòng đăng nhập trước!", type: "error" })

    }


    const handleDelete = (id) => {
        deleteMutate(id)
        favourite.dispatch({ type: ACTION_FAVOURITE.DELETE_ITEM, payload: id })

    }

    return (
        <div className='shop_item' key={product.id}>
            {type === 'wishlist' && (
                <Button 
                    danger 
                    className="delete_favourite" 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDelete(product.id)} 
                />
            )}
            {!type && (
                <button 
                    className={clsx("favourite-btn", { "is-favourite": isFavourite })} 
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFavourite();
                    }}
                >
                    {isFavourite ? <HeartFilled /> : <HeartOutlined />}
                </button>
            )}

            <Link to={`/client/product/${product.id}`} className="product-image-wrapper">
                <img src={product.image} loading="lazy" alt={product.name} />
                {!type && Number(product.pricePromotion) > 0 && (
                    <div className="sale-badge">-{product.pricePromotion}%</div>
                )}
            </Link>

            <div className="product-info">
                <div className="product-meta">
                    <span className="product-origin">{product.origin}</span>
                </div>
                
                <Typography.Title level={4} className="product-name">
                    <Link to={`/client/product/${product.id}`}>{product.name}</Link>
                </Typography.Title>

                <div className="product-pricing">
                    {Number(product?.pricePromotion) > 0 ? (
                        <>
                            <span className="price-current">
                                {(product.price * (1 - Number(product?.pricePromotion) / 100)).toLocaleString('vi-VN')}&nbsp;₫
                            </span>
                            <span className="price-old">
                                {product.price?.toLocaleString('vi-VN')}&nbsp;₫
                            </span>
                        </>
                    ) : (
                        <span className="price-current">
                            {product.price?.toLocaleString('vi-VN')}&nbsp;₫
                        </span>
                    )}
                </div>

                <div className="product-rating">
                    <Rate allowHalf disabled defaultValue={product?.stars || 5} className="small-rate" />
                </div>

                <div className="product-actions">
                    {(type !== 'wishlist') ? (
                        (!product?.status || (typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0) ? (
                            <Button block onClick={() => navigate(`/client/product/${product?.id}`)}>Xem chi tiết</Button>
                        ) : (
                            <Button 
                                type="primary"
                                block
                                icon={<ShoppingOutlined />} 
                                className="add-to-cart-btn" 
                                onClick={addToCart}
                            >
                                Thêm vào giỏ
                            </Button>
                        )
                    ) : (
                        <Button 
                            type="primary"
                            block
                            icon={<ShoppingOutlined />} 
                            className="add-to-cart-btn" 
                            disabled={(typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0} 
                            onClick={addToCart}
                        >
                            Thêm vào giỏ
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ProductGrid;