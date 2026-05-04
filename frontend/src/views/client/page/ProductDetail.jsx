import {
    HeartOutlined,
    MinusOutlined,
    PlusOutlined,
    ShoppingOutlined,
    UserOutlined
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Empty,
    Flex,
    Form,
    Image,
    Input,
    InputNumber,
    Pagination,
    Rate,
    Space,
    Tabs,
    Tag,
    Typography
} from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { queryClient } from "../../../main";
import { uploadImage } from "../../../services/upload_service";
import { detailProduct } from "../../../services/product_service";
import { addRating, ratingToProduct } from "../../../services/rating_service";
import { addFavourite } from "../../../services/favourite_service";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import "./../style/product_detail.css";

function ProductDetail() {
    const { id } = useParams()
    const cart = useContext(CartContext)
    const user = useContext(UserContext)
    const info = user?.state?.currentUser
    const [quantityBuy, setQuantityBuy] = useState(1);
    const [product, setProduct] = useState(null)
    const [fileList, setFileList] = useState([])
    const [page, setPage] = useState(1)
    const [rating, setRating] = useState([])
    const [totalRating, setTotalRating] = useState(0)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [mainImage, setMainImage] = useState('')

    const [form] = Form.useForm();
    const navigate = useNavigate();

    const detailProductQuery = useQuery({
        queryKey: ['detailProduct', id],
        queryFn: () => detailProduct(id),
    })

    const ratingShop = useQuery({
        queryKey: ['rating_shop', id, page],
        queryFn: () => ratingToProduct(id, page),
        placeholderData: keepPreviousData
    })

    const { mutate } = useMutation({
        mutationFn: (data) => addRating(data),
        onSuccess: () => {
            Notification({ message: "Gửi nhận xét thành công!", type: "success" })
            queryClient.invalidateQueries({ queryKey: ['rating_shop'] })
            form.resetFields()
            setFileList([])
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Đã xảy ra lỗi", type: "error" })
        }
    })

    const { mutate: mutateWishlist } = useMutation({
        mutationFn: (data) => addFavourite(data),
        onSuccess: () => {
            Notification({ message: "Đã thêm vào danh sách yêu thích!", type: "success" })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data || "Cần đăng nhập trước", type: "error" })
        }
    })


    useEffect(() => {
        if (!detailProductQuery?.isSuccess) return
        const rawData = detailProductQuery?.data?.data?.data
        setProduct({
            id: rawData?._id,
            name: rawData?.name,
            images: rawData?.images,
            price: rawData?.price,
            quantity: rawData?.quantity?.inTrade,
            description: rawData?.description,
            unit: rawData?.unit,
            stars: rawData?.ratingId?.reduce((acc, curr) => acc + curr.stars, 0) / (rawData?.ratingId?.length || 1),
            category: rawData?.categoryId?.name,
            origin: rawData?.origin,
            status: rawData?.isActive,
            pricePromotion: rawData?.saleId.length !== 0 ?
                new Date(dayjs(rawData?.saleId[rawData?.saleId.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                    0 :
                    (rawData?.saleId[rawData?.saleId.length - 1]?.products || []).find(product => product.productId === rawData?._id)?.pricePromotion || 0
                : 0,
        })
        setMainImage(rawData?.images?.[0])
        document.title = rawData?.name
    }, [detailProductQuery?.isSuccess, detailProductQuery?.data, id])

    useEffect(() => {
        if (!ratingShop?.isSuccess) return
        const rawData = ratingShop?.data?.data?.data
        setRating(rawData?.docs || [])
        setTotalRating(rawData?.totalDocs || 0)
    }, [ratingShop?.isSuccess, ratingShop?.data, id])

    const addToCart = () => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: quantityBuy } })
            Notification({ message: "Thêm vào giỏ hàng thành công!", type: "success" })
        }
        else {
            Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })
        }
    };

    const handleWishlist = () => {
        if (info) {
            mutateWishlist({ productId: product?.id })
        } else {
            Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })
        }
    }

    const onImageChange = (e) => {
        setFileList(e.fileList.map(file => ({
            ...file,
            status: 'uploading'
        })));
        const formData = new FormData();
        e.fileList.forEach((file) => {
            formData.append('images', file.originFileObj);
        });
        uploadImage(formData).then((rs) => {
            setFileList(e.fileList.map(file => ({
                ...file,
                url: rs?.data?.images[0]?.url,
                status: 'done'
            })));
        }).catch(err => {
            console.log(err);
        })
    }

    const onFinish = (value) => {
        mutate({ ...value, images: fileList.map(item => item?.url), productId: product?.id })
    }

    const handleImageClick = (index) => {
        setActiveImageIndex(index);
        setMainImage(product.images[index]);
    };

    const items = [
        {
            key: '1',
            label: 'Mô tả',
            children: <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>{product?.description}</div>,
        },
        {
            key: '2',
            label: `Nhận xét (${totalRating})`,
            children: <Flex vertical gap={24}>
                <Flex className="comment_list" vertical gap={12}>
                    {rating.length > 0 ? rating.map(item => (
                        <Card key={item?._id} className="comment_item" size="small">
                            <Flex gap={12}>
                                <Avatar src={item?.userId?.avatar} icon={<UserOutlined />} size="large" />
                                <Flex vertical style={{ width: "100%" }}>
                                    <Flex justify="space-between">
                                        <Typography.Text strong>{item?.userId?.firstName} {item?.userId?.lastName}</Typography.Text>
                                        <Typography.Text type="secondary">{dayjs(item?.createdAt).format('DD/MM/YYYY HH:mm')}</Typography.Text>
                                    </Flex>
                                    <Rate disabled defaultValue={item?.stars} style={{ fontSize: 14 }} />
                                    <Typography.Text style={{ marginTop: 8 }}>{item?.content}</Typography.Text>
                                    {item?.images?.length > 0 && (
                                        <Flex gap={8} style={{ marginTop: 12 }}>
                                            {item?.images.map((img, idx) => (
                                                <Image key={idx} src={img} width={80} height={80} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                                            ))}
                                        </Flex>
                                    )}
                                </Flex>
                            </Flex>
                        </Card>
                    )) : (
                        <Empty description="Chưa có nhận xét nào" />
                    )}
                    <Pagination
                        current={page}
                        total={totalRating}
                        pageSize={4}
                        hideOnSinglePage
                        onChange={(p) => setPage(p)}
                        style={{ textAlign: 'center', marginTop: 24 }}
                    />
                </Flex>

                {info && (
                    <Card title="Gửi nhận xét của bạn" className="comment_form_card">
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item name="stars" label="Đánh giá của bạn" rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}>
                                <Rate />
                            </Form.Item>
                            <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung nhận xét!' }]}>
                                <Input.TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." />
                            </Form.Item>
                            <Form.Item label="Hình ảnh thực tế">
                                <Upload
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={onImageChange}
                                    multiple
                                >
                                    {fileList.length >= 4 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải lên</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">Gửi nhận xét</Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}
            </Flex>,
        }
    ];

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <Flex className="container detail_page" vertical style={{ paddingTop: '20px', paddingBottom: '50px' }}>
            <Breadcrumb
                style={{ marginBottom: '20px' }}
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/shop'}>CỬA HÀNG</NavLink>,
                    },
                    {
                        title: product?.name,
                    },
                ]}
            />
            <Flex className="detail_p" wrap="wrap" gap={60}>
                <Flex className="p_img" vertical style={{ flex: '1 1 450px' }}>
                    <Image
                        width={"100%"}
                        src={mainImage}
                        preview={true}
                        style={{ borderRadius: '12px', border: '1px solid #eee' }}
                    />
                    <Flex gap={12} style={{ marginTop: 20 }} wrap="wrap">
                        {product?.images?.map((img, index) => (
                            <img 
                                key={index} 
                                src={img} 
                                width={80} 
                                height={80} 
                                onClick={() => handleImageClick(index)}
                                className={clsx("small_image", { "image_active": index === activeImageIndex })}
                                style={{ 
                                    objectFit: 'cover', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    border: index === activeImageIndex ? '2px solid #52c41a' : '1px solid #ddd'
                                }} 
                            />
                        ))}
                    </Flex>
                </Flex>
                <Flex className="p_info" vertical style={{ flex: '1 2 400px' }}>
                    <Typography.Title level={1} style={{ marginBottom: 8 }}>{product?.name}</Typography.Title>
                    <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
                        <Rate allowHalf disabled value={product?.stars} />
                        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>({totalRating} nhận xét)</Typography.Text>
                    </Flex>

                    <Flex vertical className="price_section" style={{ marginBottom: 32, background: '#f6ffed', padding: '20px', borderRadius: '12px' }}>
                        {Number(product?.pricePromotion) > 0 ? (
                            <Flex align="center" gap={16}>
                                <Typography.Title level={2} style={{ color: '#ff4d4f', margin: 0, fontWeight: 700 }}>
                                    {(product?.price * (1 - Number(product?.pricePromotion) / 100)).toLocaleString('vi-VN')} ₫
                                </Typography.Title>
                                <Typography.Text delete type="secondary" style={{ fontSize: 20 }}>
                                    {product?.price?.toLocaleString('vi-VN')} ₫
                                </Typography.Text>
                                <Tag color="error" style={{ fontSize: '16px', padding: '4px 12px' }}> Giảm {product?.pricePromotion}%</Tag>
                            </Flex>
                        ) : (
                            <Typography.Title level={2} style={{ margin: 0, color: '#237804', fontWeight: 700 }}>
                                {product?.price?.toLocaleString('vi-VN')} ₫
                            </Typography.Title>
                        )}
                    </Flex>

                    <Space direction="vertical" size="middle" style={{ marginBottom: 32, width: '100%' }}>
                        <Flex justify="space-between" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <Typography.Text strong>Tình trạng:</Typography.Text>
                            <Tag color={product?.quantity > 0 ? "success" : "error"} style={{ borderRadius: '4px' }}>
                                {product?.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                            </Tag>
                        </Flex>
                        <Flex justify="space-between" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <Typography.Text strong>Danh mục:</Typography.Text>
                            <Typography.Text>{product?.category}</Typography.Text>
                        </Flex>
                        <Flex justify="space-between" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <Typography.Text strong>Đơn vị:</Typography.Text>
                            <Typography.Text>{product?.unit}</Typography.Text>
                        </Flex>
                        <Flex justify="space-between" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <Typography.Text strong>Xuất xứ:</Typography.Text>
                            <Typography.Text>{product?.origin}</Typography.Text>
                        </Flex>
                    </Space>

                    <Flex vertical gap={24} style={{ marginTop: 'auto' }}>
                        <Flex align="center" gap={16}>
                            <Typography.Text strong style={{ fontSize: '16px' }}>Số lượng:</Typography.Text>
                            <InputNumber 
                                min={1} 
                                max={product?.quantity} 
                                value={quantityBuy} 
                                onChange={setQuantityBuy} 
                                size="large"
                                style={{ width: '100px' }}
                            />
                            <Typography.Text type="secondary">({product?.quantity} sản phẩm có sẵn)</Typography.Text>
                        </Flex>
                        <Flex gap={16}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingOutlined />}
                                disabled={product?.quantity === 0 || !product?.status}
                                onClick={addToCart}
                                style={{ flex: 2, height: 56, borderRadius: '12px', fontSize: '18px', fontWeight: 600, background: '#52c41a' }}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                size="large"
                                icon={<HeartOutlined />}
                                onClick={handleWishlist}
                                style={{ flex: 1, height: 56, borderRadius: '12px', fontSize: '18px' }}
                            >
                                Yêu thích
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>

            <Flex className="detail_tabs" style={{ marginTop: 80 }}>
                <Tabs 
                    defaultActiveKey="1" 
                    items={items} 
                    style={{ width: "100%" }} 
                    size="large"
                    type="card"
                />
            </Flex>
        </Flex>
    );
}

export default ProductDetail;