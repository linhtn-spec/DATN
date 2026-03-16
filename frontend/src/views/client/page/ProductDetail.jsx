import {
    HeartOutlined,
    MinusOutlined,
    PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Breadcrumb, Button, Empty, Flex, Form, Image, Input, Rate, Tabs, Typography } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, useParams } from "react-router-dom";
import { queryClient } from "../../../main";
import { addComment, commentOfProductAll } from "../../../services/comment_service";
import { addFavourite } from "../../../services/favourite_service";
import { detailProduct, productMayLike, recommendProduct } from "../../../services/product_service";
import { addRating } from "../../../services/rating_service";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { ACTION_FAVOURITE, FavouriteContext } from "../../../store/favourite";
import { ACTION_PRODUCT_LASTVIEW, LastViewProductContext } from "../../../store/productLastView";
import { UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import Banner_Big from "../layout/banner_big";
import LastView from "../layout/last_view";
import Product_LSView from "../layout/product_LSView";
import "./../style/product_detail.css";

function ProductDetail() {

    const lastView = useContext(LastViewProductContext)
    const cart = useContext(CartContext)

    const [recommendProducts, setRecommendProducts] = useState([])
    const { id } = useParams();
    const [form] = Form.useForm()

    const favourite = useContext(FavouriteContext)
    const user = useContext(UserContext)
    const info = user?.state?.currentUser
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [product, setProduct] = useState({})
    const [mainImage, setMainImage] = useState('')
    const [products, setProducts] = useState([]);
    const [comments, setComments] = useState([])

    const detailProductClient = useQuery({
        queryKey: ['detail_product_client', id],
        queryFn: () => detailProduct(id)
    })

    const getRecommendProduct = useQuery({
        queryKey: ['recommend_product', id],
        queryFn: () => recommendProduct(id)
    })

    const productsMayLike = useQuery({
        queryKey: ['product_may_like', id],
        queryFn: () => productMayLike(id)
    })

    const { mutate } = useMutation({
        mutationFn: (id) => addFavourite(id),
        onSuccess: () => {
            Notification({ message: "Add to wishlist successfully!", type: "success" })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "info" })
        }
    })



    useEffect(() => {
        if (!detailProductClient?.isSuccess) return
        const rawData = detailProductClient?.data?.data
        setProduct({
            status: rawData?.isActive ?? false,
            id: rawData?._id,
            quantity: rawData?.quantity,
            images: rawData?.images,
            name: rawData?.name,
            unit: rawData?.unit,
            origin: rawData?.origin,
            category: rawData?.categoryId?.name,
            price: rawData?.price,
            description: rawData?.description,
            stars: rawData?.ratingId?.reduce((acc, curr) => acc + curr.stars, 0) / rawData?.ratingId?.length,
            pricePromotion: rawData?.saleId?.length !== 0 ?
                new Date(dayjs(rawData?.saleId[rawData?.saleId.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                    0 :
                    (rawData?.saleId[rawData?.saleId.length - 1]?.products || []).find(product => product.productId === rawData?._id)?.pricePromotion || 0
                : 0
        })
        setMainImage(rawData?.images?.[0])
        return () => {
            setProduct({})
        }
    }, [detailProductClient?.isSuccess, detailProductClient?.data])

    useEffect(() => {
        if (!productsMayLike?.isSuccess) return
        const rawData = productsMayLike?.data?.data
        const dataToMap = Array.isArray(rawData) ? rawData : Object.values(rawData || {})
        setProducts(dataToMap?.map(item => ({
            name: item?.name,
            price: item?.price,
            image: item?.images?.[0],
            id: item?._id,
            origin: item?.origin,
            pricePromotion: (item?.saleId && item.saleId.length !== 0) ?
                (new Date(dayjs(item?.saleId[item?.saleId.length - 1]?.dueDate || new Date())).getTime() < new Date().getTime() ?
                    0 :
                    (item?.saleId[item?.saleId.length - 1]?.products || []).find(product => product.productId === item?._id)?.pricePromotion || 0)
                : 0,
            quantity: item?.quantity

        })))
        return () => {
            setProducts([])
        }

    }, [productsMayLike?.isSuccess, productsMayLike?.data])

    useEffect(() => {
        if (!getRecommendProduct?.isSuccess) return
        const rawData = getRecommendProduct?.data?.data
        setRecommendProducts(rawData?.map(item => ({
            mainImage: item?.images?.[0],
            name: item?.name,
            id: item?._id
        })))
        return () => {
            setRecommendProducts([])
        }
    }, [getRecommendProduct?.isSuccess, getRecommendProduct?.data])




    const handleImageClick = (index) => {
        setActiveImageIndex(index);
        setMainImage(product.images[index]);
    };

    const [quantity, setQuantity] = useState(1);
    const minus = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };


    const plus = () => {
        const availableQty = typeof product.quantity === 'object' ? product.quantity.inTrade : product.quantity;
        if (Number(quantity) < Number(availableQty)) {
            setQuantity(prevQuantity => Number(prevQuantity) + 1);
        } else {
            setQuantity(Number(availableQty));
        }
    }

    useEffect(() => {
        if (product && mainImage !== '')
            lastView?.dispatch({ type: ACTION_PRODUCT_LASTVIEW.ADD_PRODUCT, payload: { ...product, mainImage: mainImage } })
    }, [product, mainImage])



    const addToFavourite = () => {

        if (info) {
            mutate(id)
            favourite.dispatch({ type: ACTION_FAVOURITE.ADD_FAVOURITE, payload: product })
        }
        else
            Notification({ message: "You have to login first!", type: "error" })

    }

    const addToCart = () => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: quantity } })
            Notification({ message: "Add to cart successully!", type: "success" })
        }
        else {
            Notification({ message: "You have to login first!", type: "error" })

        }
    };

    const queryComment = useQuery({
        queryKey: ['comment_product_client', product?.id],
        queryFn: () => commentOfProductAll(product?.id),
        enabled: !!product?.id
    })

    const rateProduct = useMutation({
        mutationFn: (data) => addRating(data),
        onSuccess: () => {
            Notification({ message: "Rate product successfully", type: "success" }),
                queryClient.invalidateQueries({ queryKey: ['detail_product_client'] })
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "info" })
    })

    const feedback = useMutation({
        mutationFn: (data) => addComment(data),
        onSuccess: () => {
            Notification({ message: "Leave feedback successfully", type: "success" }),
                queryClient.invalidateQueries({ queryKey: ['detail_product_client'] })
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "info" })
    })
    const handleSubmit = (e) => {
        feedback.mutate({ productId: product?.id, ...e })
    }
    useEffect(() => {
        if (!queryComment.isSuccess) return
        const rawData = queryComment?.data?.data?.data
        setComments(rawData.map(item => ({
            id: item?._id,
            image: item?.userId?.image,
            userId: item?.userId?._id,
            content: item?.content,
            firstName: item?.userId?.firstName,
            lastName: item?.userId?.lastName,

        })))
        return () => {
            setComments([])
        }
    }, [queryComment.isSuccess, queryComment?.data])


    const items = [
        {
            key: '1',
            label: 'Description',
            children: product?.description,
        },
        {
            key: '2',
            label: 'Comments',
            children:
                <Flex gap={24} vertical className="comments">
                    {comments.length !== 0
                        ? (comments.map(item => (
                            <Flex align='flex-start' gap={32} key={item?.id} className="comment-item">
                                <Avatar size={50} src={item?.image} icon={<UserOutlined />} />
                                <Flex vertical>
                                    <Typography.Title level={5} style={{ marginBottom: 8, fontSize: "16px", fontWeight: "600" }} >{item?.firstName + " " + item?.lastName}</Typography.Title>
                                    <Typography.Text style={{ fontSize: "15px", color: "#555", lineHeight: "1.5" }}>{item?.content}</Typography.Text>
                                </Flex>
                            </Flex>
                        ))
                        ) : <Empty description={'No comments available'} />}
                </Flex>,
        }
    ];

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    return (
        <Flex vertical>
            <Helmet>
                <title>{product?.name || "Product Detail"} | My Shop</title>
                <meta name="description" content={product?.description || "Product details and pricing."} />
                <meta property="og:title" content={product?.name} />
                <meta property="og:description" content={product?.description} />
                <meta property="og:image" content={product?.images?.[0]} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>
            <Banner_Big info={product?.name} />
            <Flex className="product_detail-client container" vertical align="center">
                <Breadcrumb
                    items={[
                        {
                            title: <NavLink to={'/'}>HOME</NavLink>,
                        },
                        {
                            title: <NavLink to={`/client/product/${product?.id}`}>{String(product?.name).toUpperCase()}</NavLink>,
                        },
                    ]}
                />
                <Flex className="detail d-flex" justify="space-between">
                    <Flex className="view" vertical gap={40}>
                        <div className="img-group last_view d-flex flex-column">
                            <h5>LAST VIEW PRODUCTS</h5>
                            <hr />
                            {lastView?.state?.lastViewProduct !== undefined && lastView?.state?.lastViewProduct.length >= 2 ?
                                lastView?.state?.lastViewProduct?.filter(item => item.id !== product.id && item.id !== undefined).slice(-3).map((item, index) => (
                                    <LastView product={item} key={index} />
                                )) : <Empty description={'No product'} />
                            }
                        </div>
                        <div className="img-group last_view d-flex flex-column mt-5">
                            <h5>RECOMMEND PRODUCTS</h5>
                            <hr />
                            {/* {
                                [...Array(10)].slice(-3).map((item, index) => (
                                    <Hot product={{ product_id: '8ahsd', title: 'keo keo thom ngon vo cung luon nhe cac ban oi asd asd as', price: 129, price_promotion: 0.1 }} key={index} />
                                ))
                            } */}
                            {recommendProducts?.length >= 1 ?
                                recommendProducts.slice(1, 5).map((item, index) => (
                                    <LastView product={item} key={index} />
                                )) : <Empty description={'No product'} />
                            }
                        </div>
                    </Flex>
                    <div className="wrap_detail_sum">
                        <Flex className="d-flex" gap={'large'}>
                            <Flex vertical gap={'small'} className="image_group">
                                {product?.images?.map((item, index) => (
                                    <img src={item}
                                        alt={product?.name + index}
                                        onClick={() => handleImageClick(index)}
                                        className={clsx("small_image", { "image_active": index === activeImageIndex })}
                                        key={index} loading="lazy" />
                                ))}
                            </Flex>
                            <Flex gap={40}>
                                <div className="img-product">
                                    <Image src={mainImage} loading="lazy" className="main_image" />
                                </div>

                                <Flex className="info">

                                    <Flex vertical gap="large">
                                        <div>
                                            <Typography.Title level={1} className="title">{product?.name}</Typography.Title>
                                            <Flex gap={30} align="center">
                                                <Typography.Title level={3} style={{ margin: 0 }}>
                                                    {Number(product?.pricePromotion) > 0 ? (
                                                        <Flex gap={15} align="center">
                                                            <span className="promotion" style={{ color: '#ff2c26', fontWeight: 700 }}>
                                                                {(product.price * (1 - Number(product?.pricePromotion) / 100)).toLocaleString('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'USD',
                                                                    minimumFractionDigits: 0,
                                                                    maximumFractionDigits: 0,
                                                                })}
                                                            </span>
                                                            <span className="price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px', fontWeight: 400 }}>
                                                                {product.price?.toLocaleString('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'USD',
                                                                    minimumFractionDigits: 0,
                                                                    maximumFractionDigits: 0,
                                                                })}
                                                            </span>
                                                        </Flex>
                                                    ) : (
                                                        <span className="promotion" style={{ color: '#ff2c26', fontWeight: 700 }}>
                                                            {product.price?.toLocaleString('en-US', {
                                                                style: 'currency',
                                                                currency: 'USD',
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            })}
                                                        </span>
                                                    )}
                                                </Typography.Title>
                                                <Button shape="circle" className="fav" onClick={() => addToFavourite()}><HeartOutlined /></Button>
                                            </Flex>
                                            <hr />
                                            <p>Stock status: <span className="stock_status">{(typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0 ? `Out of stock` : `In stock`}</span></p>
                                            <p>Category: <span className="category">{product?.category}</span></p>
                                            <p>Unit: <span className="category">{product?.unit}</span></p>
                                            <Rate allowHalf value={product?.stars} onChange={(e) => rateProduct.mutate({ stars: e, productId: product?.id })} />
                                            <hr />
                                        </div>
                                        {!product?.status ? <></> :

                                            <Flex vertical gap={8} style={{ height: "30vh" }}>
                                                <Flex className='form-group' gap={7}>
                                                    <Input disabled={(typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0} value={quantity} className="form-control quantity" style={{ textAlign: "center", width: "100%" }} onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        const availableQty = typeof product.quantity === 'object' ? product.quantity.inTrade : product.quantity;
                                                        if (!isNaN(val) && val > 0) {
                                                            setQuantity(Math.min(val, availableQty));
                                                        } else if (e.target.value === '') {
                                                            setQuantity(1);
                                                        }
                                                    }} />
                                                    <Flex vertical justify="space-between">
                                                        <Button variant="light" onClick={plus} style={{ height: "45%" }} disabled={(typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0}>
                                                            <PlusOutlined />
                                                        </Button>
                                                        <Button variant="light" onClick={minus} style={{ height: "45%" }} disabled={(typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0}>
                                                            <MinusOutlined />
                                                        </Button >
                                                    </Flex>
                                                </Flex>
                                                <Flex style={{ height: "50%" }}>
                                                    <Button variant="warning" className="cart" disabled={(typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity) === 0} onClick={addToCart}>Add to cart</Button>
                                                </Flex>
                                            </Flex>
                                        }

                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                        <Tabs defaultActiveKey="1" items={items} />
                        {info ?
                            comments?.some(item => item.userId === info?.user_id) ? <></> : (
                                <Flex gap={30} style={{ width: "100%" }} vertical className="submit_comment">
                                    <Typography.Title level={2}>Submit your comment</Typography.Title>
                                    <Flex style={{ width: "100%" }} align="center" gap={50}>
                                        <Avatar size={50} src={info?.image ? info?.image : ""} icon={<UserOutlined />} />
                                        <Form
                                            form={form}
                                            layout="horizontal"
                                            onFinish={handleSubmit}
                                            style={{ width: "60%" }}
                                        >
                                            <Form.Item
                                                name="content"
                                                hasFeedback
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Please input!',
                                                    },
                                                    {
                                                        min: 3,
                                                        message: "At least 3 characters"
                                                    },
                                                    {
                                                        max: 150,
                                                        message: "At max 150 characters"
                                                    }
                                                ]}
                                            >
                                                <Input type="text" placeholder="Type your comment here" size="large" style={{ marginBottom: "0px" }} />
                                            </Form.Item>
                                        </Form>
                                    </Flex>
                                </Flex>
                            ) : <></>}
                        <Flex className="product_relate-list" vertical>
                            <Typography.Title level={2}>You may like</Typography.Title>
                            <Flex className="relate_list" gap="large">
                                {
                                    products.slice(-3).map((item, index) => (
                                        <Product_LSView products={item} key={index} />
                                    ))
                                }
                            </Flex>
                        </Flex>
                    </div>
                </Flex>

            </Flex>
        </Flex>
    );
}

export default ProductDetail; 