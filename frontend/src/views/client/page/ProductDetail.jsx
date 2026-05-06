import {
    HeartOutlined,
    MinusOutlined,
    PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    Avatar,
    Breadcrumb,
    Button,
    Empty,
    Flex,
    Form,
    Image,
    Input,
    Pagination,
    Rate,
    Skeleton,
    Tabs,
    Typography,
    Upload
} from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { queryClient } from "../../../main";
import { addFavourite } from "../../../services/favourite_service";
import { detailProduct, productMayLike, recommendProduct } from "../../../services/product_service";
import { addRating, ratingToProduct } from "../../../services/rating_service";
import { uploadImage } from "../../../services/upload_service";
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
    const user = useContext(UserContext)
    const favourite = useContext(FavouriteContext)

    const { id } = useParams()
    const navigate = useNavigate()
    const info = user?.state?.currentUser

    const [form] = Form.useForm()
    const [fileList, setFileList] = useState([])

    const [product, setProduct] = useState({})
    const [mainImage, setMainImage] = useState('')
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [products, setProducts] = useState([])
    const [recommendProducts, setRecommendProducts] = useState([])
    const [page, setPage] = useState(1)
    const [rating, setRating] = useState([])
    const [totalRating, setTotalRating] = useState(0)
    const [hasReviewed, setHasReviewed] = useState(false)
    const [activeTab, setActiveTab] = useState('1')

    // Queries
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

    const ratingShop = useQuery({
        queryKey: ['rating_shop', id, page, info?._id || info?.user_id],
        queryFn: () => ratingToProduct(id, page, undefined, undefined, undefined, true, info?._id || info?.user_id),
        placeholderData: keepPreviousData
    })

    // Mutations
    const { mutate: mutateRating } = useMutation({
        mutationFn: (data) => addRating(data),
        onSuccess: () => {
            Notification({ message: "Gửi nhận xét thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['rating_shop'] })
            form.resetFields()
            setFileList([])
            setHasReviewed(true)
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Đã xảy ra lỗi", type: "error" })
        }
    })

    const rateProduct = useMutation({
        mutationFn: (data) => addRating(data),
        onSuccess: () => {
            Notification({ message: "Đánh giá thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['detail_product_client'] })
        },
        onError: (error) => Notification({ message: error?.response?.data, type: "info" })
    })

    const { mutate } = useMutation({
        mutationFn: (id) => addFavourite(id),
        onSuccess: () => {
            Notification({ message: "Thêm vào yêu thích thành công!", type: "success" })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "info" })
        }
    })

    // Effects
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
            stars: rawData?.ratingId?.reduce((acc, curr) => acc + curr.stars, 0) / (rawData?.ratingId?.length || 1),
            pricePromotion: rawData?.saleId?.length !== 0 ?
                new Date(dayjs(rawData?.saleId[rawData?.saleId.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                    0 :
                    (rawData?.saleId[rawData?.saleId.length - 1]?.products || []).find(product => product.productId === rawData?._id)?.pricePromotion || 0
                : 0
        })
        setMainImage(rawData?.images?.[0])
        document.title = rawData?.name
        return () => {
            setProduct({})
        }
    }, [detailProductClient?.isSuccess, detailProductClient?.data])

    useEffect(() => {
        if (!productsMayLike?.isSuccess) return
        const rawData = productsMayLike?.data?.data
        const dataToMap = Array.isArray(rawData) ? rawData : (rawData?.data || [])
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
            quantity: item?.quantity,
            unit: item?.unit
        })))
        return () => { setProducts([]) }
    }, [productsMayLike?.isSuccess, productsMayLike?.data])

    useEffect(() => {
        if (!getRecommendProduct?.isSuccess) return
        const rawData = getRecommendProduct?.data?.data
        setRecommendProducts((rawData || []).map(item => ({
            mainImage: item?.images?.[0],
            name: item?.name,
            id: item?._id
        })))
        return () => { setRecommendProducts([]) }
    }, [getRecommendProduct?.isSuccess, getRecommendProduct?.data])

    useEffect(() => {
        console.log('ratingShop data response:', ratingShop?.data);
        if (!ratingShop?.isSuccess) return
        // rating_product controller returns paginate result directly
        // React Query's `data` + Axios's `data` = ratingShop.data.data
        const rawData = ratingShop?.data?.data
        const docs = rawData?.docs || []
        setRating(docs)
        setTotalRating(rawData?.totalDocs || 0)

        // Check if current user has already reviewed (persists across page reloads)
        if (info) {
            const currentUserId = info._id || info.user_id;
            const userReview = docs.find(r => r.userId?._id === currentUserId)
            setHasReviewed(prev => prev || !!userReview)
        }
    }, [ratingShop?.isSuccess, ratingShop?.data, id, info])

    useEffect(() => {
        if (product && mainImage !== '')
            lastView?.dispatch({ type: ACTION_PRODUCT_LASTVIEW.ADD_PRODUCT, payload: { ...product, mainImage: mainImage } })
    }, [product, mainImage])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setHasReviewed(false)
        setPage(1)
        setActiveTab('1')
        form.resetFields()
        setFileList([])
    }, [id])

    // Handlers
    const handleImageClick = (index) => {
        setActiveImageIndex(index)
        setMainImage(product.images[index])
    }

    const minus = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1)
        }
    }

    const plus = () => {
        const availableQty = typeof product.quantity === 'object' ? product.quantity.inTrade : product.quantity
        if (Number(quantity) < Number(availableQty)) {
            setQuantity(prev => Number(prev) + 1)
        } else {
            setQuantity(Number(availableQty))
        }
    }

    const addToFavourite = () => {
        if (info) {
            mutate(id)
            favourite.dispatch({ type: ACTION_FAVOURITE.ADD_FAVOURITE, payload: product })
        } else {
            Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })
        }
    }

    const addToCart = () => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: quantity } })
            Notification({ message: "Thêm vào giỏ hàng thành công!", type: "success" })
        } else {
            Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })
        }
    }

    const onImageChange = (e) => {
        setFileList(e.fileList)
    }

    const onFinish = async (value) => {
        try {
            let finalImageUrls = [];
            const formData = new FormData()
            let hasFiles = false;

            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                    hasFiles = true;
                } else if (file.url) {
                    finalImageUrls.push(file.url);
                }
            })

            if (hasFiles) {
                const rs = await uploadImage(formData);
                const uploadedUrls = rs?.data?.images?.map(img => img.url) || [];
                finalImageUrls = [...finalImageUrls, ...uploadedUrls];
            }

            mutateRating({ ...value, images: finalImageUrls, productId: product?.id })
        } catch (error) {
            Notification({ message: "Lỗi tải ảnh lên!", type: "error" });
        }
    }

    const productQty = typeof product?.quantity === 'object' ? product?.quantity?.inTrade : product?.quantity

    const items = [
        {
            key: '1',
            label: 'Mô tả',
            children: product?.description,
        },
        {
            key: '2',
            label: `Nhận xét (${totalRating})`,
            children: (
                <Flex gap={24} vertical className="comments">
                    {/* Review Form */}
                    {info && !hasReviewed ? (
                        <Flex gap={30} style={{ width: "100%", paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }} vertical className="submit_comment">
                            <Typography.Title level={2}>Gửi nhận xét của bạn</Typography.Title>
                            <Flex style={{ width: "100%" }} align="center" gap={50}>
                                <Avatar size={50} src={info?.image} icon={<UserOutlined />} />
                                <Form form={form} layout="vertical" onFinish={onFinish} style={{ width: "60%" }}>
                                    <Form.Item name="stars" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}>
                                        <Rate />
                                    </Form.Item>
                                    <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }, { min: 1, message: "Ít nhất 1 ký tự" }]}>
                                        <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
                                    </Form.Item>
                                    <Form.Item label="Hình ảnh">
                                        <Upload
                                            beforeUpload={() => false}
                                            listType="picture-card"
                                            fileList={fileList}
                                            onChange={onImageChange}
                                            multiple
                                        >
                                            {fileList.length >= 4 ? null : (
                                                <div><PlusOutlined /><div style={{ marginTop: 8 }}>Tải lên</div></div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">Gửi nhận xét</Button>
                                    </Form.Item>
                                </Form>
                            </Flex>
                        </Flex>
                    ) : info && hasReviewed ? (
                        <Flex className="submit_comment" vertical align="center" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '24px' }}>
                            <Typography.Text strong style={{ color: '#52c41a' }}>Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!</Typography.Text>
                        </Flex>
                    ) : null}

                    {rating.length > 0 ? rating.map(item => (
                        <Flex align='flex-start' gap={32} key={item?._id} className="comment-item">
                            <Avatar size={50} src={item?.userId?.avatar} icon={<UserOutlined />} />
                            <Flex vertical>
                                <Typography.Title level={5} style={{ marginBottom: 8, fontSize: "16px", fontWeight: "600" }}>
                                    {item?.userId?.firstName} {item?.userId?.lastName}
                                </Typography.Title>
                                <Rate disabled defaultValue={item?.stars} style={{ fontSize: 14, marginBottom: 4 }} />
                                <Typography.Text style={{ fontSize: "15px", color: "#555", lineHeight: "1.5" }}>
                                    {item?.content}
                                </Typography.Text>
                                {item?.images?.length > 0 && (
                                    <Flex gap={8} style={{ marginTop: 12 }}>
                                        <Image.PreviewGroup>
                                            {item.images.map((img, idx) => (
                                                <Image key={idx} width={80} height={80} src={img} style={{ borderRadius: 8, objectFit: 'cover' }} />
                                            ))}
                                        </Image.PreviewGroup>
                                    </Flex>
                                )}
                                {item?.reply && (
                                    <Flex vertical style={{ marginTop: 16, padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '8px', borderLeft: '4px solid #fa8c16' }}>
                                        <Typography.Text strong style={{ color: '#fa8c16', marginBottom: 4 }}>Phản hồi từ cửa hàng:</Typography.Text>
                                        <Typography.Text style={{ fontSize: "14px", color: "#555" }}>
                                            {item.reply}
                                        </Typography.Text>
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                    )) : <Empty description="Chưa có nhận xét nào" />}
                    <Pagination
                        current={page}
                        total={totalRating}
                        pageSize={6}
                        hideOnSinglePage
                        onChange={(p) => setPage(p)}
                        style={{ textAlign: 'center', marginTop: 16 }}
                    />
                </Flex>
            ),
        }
    ]

    const isLoading = detailProductClient.isLoading

    return (
        <Flex vertical>
            <Banner_Big info={product?.name} />
            <Flex className="product_detail-client container" vertical align="center">
                <Breadcrumb
                    items={[
                        {
                            title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                        },
                        {
                            title: <NavLink to={'/client/shop'}>CỬA HÀNG</NavLink>,
                        },
                        {
                            title: String(product?.name || '').toUpperCase(),
                        },
                    ]}
                />
                <Flex className="detail d-flex" justify="space-between">
                    {/* Sidebar */}
                    <Flex className="view" vertical gap={40}>
                        <div className="img-group last_view d-flex flex-column">
                            <h5>SẢN PHẨM VỪA XEM</h5>
                            <hr />
                            {lastView?.state?.lastViewProduct !== undefined && lastView?.state?.lastViewProduct.length >= 2 ?
                                lastView?.state?.lastViewProduct?.filter(item => item.id !== product.id && item.id !== undefined).slice(-3).map((item, index) => (
                                    <LastView product={item} key={index} />
                                )) : <Empty description="Chưa có sản phẩm" />
                            }
                        </div>
                        <div className="img-group last_view d-flex flex-column mt-5">
                            <h5>SẢN PHẨM GỢI Ý</h5>
                            <hr />
                            {recommendProducts?.length >= 1 ?
                                recommendProducts.slice(1, 5).map((item, index) => (
                                    <LastView product={item} key={index} />
                                )) : <Empty description="Chưa có sản phẩm" />
                            }
                        </div>
                    </Flex>

                    {/* Main Content */}
                    <div className="wrap_detail_sum">
                        {isLoading ? (
                            <Flex gap={40}>
                                <Skeleton.Image active style={{ width: 400, height: 400 }} />
                                <Skeleton active paragraph={{ rows: 10 }} style={{ width: 400 }} />
                            </Flex>
                        ) : (
                            <Flex className="d-flex" gap={'large'}>
                                {/* Thumbnails */}
                                <Flex vertical gap={'small'} className="image_group">
                                    {product?.images?.map((item, index) => (
                                        <img
                                            src={item}
                                            alt={`${product?.name} ${index}`}
                                            onClick={() => handleImageClick(index)}
                                            className={clsx("small_image", { "image_active": index === activeImageIndex })}
                                            key={index}
                                            loading="lazy"
                                        />
                                    ))}
                                </Flex>

                                <Flex gap={40}>
                                    {/* Main Image */}
                                    <div className="img-product">
                                        <Image src={mainImage} loading="lazy" className="main_image" />
                                    </div>

                                    {/* Product Info */}
                                    <Flex className="info">
                                        <Flex vertical gap="large">
                                            <div>
                                                <Typography.Title level={1} className="title">{product?.name}</Typography.Title>
                                                <Flex gap={30} align="center">
                                                    <Typography.Title level={3} style={{ margin: 0 }}>
                                                        {Number(product?.pricePromotion) > 0 ? (
                                                            <Flex gap={15} align="center" style={{ whiteSpace: 'nowrap' }}>
                                                                <span className="promotion" style={{ color: '#ff2c26', fontWeight: 700 }}>
                                                                    {(product.price * (1 - Number(product?.pricePromotion) / 100)).toLocaleString('vi-VN')}&nbsp;₫
                                                                </span>
                                                                <span className="price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px', fontWeight: 400 }}>
                                                                    {product.price?.toLocaleString('vi-VN')}&nbsp;₫
                                                                </span>
                                                            </Flex>
                                                        ) : (
                                                            <span className="promotion" style={{ color: '#ff2c26', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                                {product.price?.toLocaleString('vi-VN')}&nbsp;₫
                                                            </span>
                                                        )}
                                                    </Typography.Title>
                                                    <Button shape="circle" className="fav" onClick={addToFavourite}><HeartOutlined /></Button>
                                                </Flex>
                                                <hr />
                                                <p>Tình trạng: <span className="stock_status">{productQty === 0 ? 'Hết hàng' : `Còn hàng ( ${productQty} ${product.unit || 'sản phẩm'} )`}</span></p>
                                                <p>Danh mục: <span className="category">{product?.category}</span></p>
                                                <p>Đơn vị: <span className="category">{product?.unit}</span></p>
                                                <Rate value={product?.stars} disabled allowHalf />
                                                <hr />
                                            </div>
                                            {!product?.status ? <></> :
                                                <Flex vertical gap={8} style={{ height: "30vh" }}>
                                                    <Flex className='form-group' gap={7}>
                                                        <Input
                                                            disabled={productQty === 0}
                                                            value={quantity}
                                                            className="form-control quantity"
                                                            style={{ textAlign: "center", width: "100%" }}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value)
                                                                const availableQty = typeof product.quantity === 'object' ? product.quantity.inTrade : product.quantity
                                                                if (!isNaN(val) && val > 0) {
                                                                    setQuantity(Math.min(val, availableQty))
                                                                } else if (e.target.value === '') {
                                                                    setQuantity(1)
                                                                }
                                                            }}
                                                        />
                                                        <Flex vertical justify="space-between">
                                                            <Button variant="light" onClick={plus} style={{ height: "45%" }} disabled={productQty === 0}>
                                                                <PlusOutlined />
                                                            </Button>
                                                            <Button variant="light" onClick={minus} style={{ height: "45%" }} disabled={productQty === 0}>
                                                                <MinusOutlined />
                                                            </Button>
                                                        </Flex>
                                                    </Flex>
                                                    <Flex style={{ height: "50%" }}>
                                                        <Button variant="warning" className="cart" disabled={productQty === 0} onClick={addToCart}>
                                                            Thêm vào giỏ hàng
                                                        </Button>
                                                    </Flex>
                                                </Flex>
                                            }
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>
                        )}

                        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} items={items} />

                        {/* You May Like */}
                        <Flex className="product_relate-list" vertical>
                            <Typography.Title level={2}>Sản phẩm tương tự</Typography.Title>
                            <Flex className="relate_list" gap="large">
                                {products.slice(-3).map((item, index) => (
                                    <Product_LSView products={item} key={index} />
                                ))}
                            </Flex>
                        </Flex>
                    </div>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default ProductDetail