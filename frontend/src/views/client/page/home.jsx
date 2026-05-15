import { useQuery } from "@tanstack/react-query";
import { Empty, Flex, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProduct } from "../../../services/product_service";
import { latestSale } from "../../../services/sale_service";
import { loginByGoogle } from "../../../services/user_service";
import { ACTION_LOG } from "../../../store/typeLog/action";
import { LogContext } from "../../../store/typeLog/provider";
import { ACTION_USER, UserContext } from "../../../store/user";
import { useScrollEffects } from "../functions/useScrollEffects";
import Banner from "../layout/banner";
import { Countdown } from "../layout/CountDown";
import Product_Hot from "../layout/product_hot";
import Product_List from "../layout/product_list";
import RecommendedProduct from "../layout/RecommendedProduct";

function Home() {
    document.title = "Trang chủ";
    useScrollEffects();
    const { dispatch } = useContext(UserContext)
    const logGoogle = useContext(LogContext)
    const navigate = useNavigate()
    const [productHot, setProductHot] = useState([]);
    const [productNew, setProductNew] = useState([]);
    const [isLoadingSale, SetIsLoadingSale] = useState(true)
    const [isLoadingNew, SetIsLoadingNew] = useState(true)
    const [expires, setExpires] = useState('')
    const { data, isSuccess } = useQuery({
        queryKey: ['home'],
        queryFn: () => listProduct(1, '', '', '', '', '', 'descend')
    })

    const querySale = useQuery({
        queryKey: ['sale_products_lastest'],
        queryFn: () => latestSale()
    })


    useEffect(() => {
        if (!querySale?.isSuccess) return
        const rawData = querySale?.data?.data
        setProductHot(rawData?.products?.filter(item => item.productId).map(item => ({
            name: item?.productId?.name,
            price: item?.productId?.price,
            image: item?.productId?.images?.[0],
            id: item?.productId?._id,
            origin: item?.productId?.origin,
            pricePromotion: item?.pricePromotion,
            status: item?.productId?.isActive,
            quantity: item?.productId?.quantity?.inTrade,
            unit: item?.productId?.unit
        })))
        setExpires(rawData?.dueDate)
    }, [querySale?.isSuccess, querySale?.data])
    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.products?.docs
        setProductNew(rawData?.map(item => ({
            name: item?.name,
            price: item?.price,
            image: item?.images[0],
            id: item?._id,
            origin: item?.origin,
            pricePromotion: item?.saleId.length !== 0 ?
                new Date(dayjs(item?.saleId[item?.saleId.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                    0 :
                    (item?.saleId[item?.saleId.length - 1]?.products || []).find(product => product.productId === item?._id)?.pricePromotion || 0
                : 0,
            status: item?.isActive,
            quantity: item?.quantity?.inTrade,
            unit: item?.unit

        })))
        SetIsLoadingNew(false)
        SetIsLoadingSale(false)
        return () => {
            setProductNew([])
            setProductHot([])
            SetIsLoadingNew(false)
            SetIsLoadingSale(false)
        }
    }, [isSuccess, data, SetIsLoadingNew, SetIsLoadingSale])

    const getUser = useQuery({
        queryKey: ['getUser_google'],
        queryFn: () => loginByGoogle(),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: !!logGoogle?.state?.isLogByGoogle
    })
    useEffect(() => {
        if (logGoogle?.state?.isLogByGoogle) {
            if (!getUser?.isSuccess) return
            else {
                dispatch({ type: ACTION_USER.LOGIN, payload: getUser?.data?.data })
                logGoogle.dispatch({ type: ACTION_LOG.OUT })
            }
        }
    }, [getUser?.isSuccess, getUser?.data, getUser?.error, dispatch, logGoogle])
    return (
        <Flex vertical className="home-page">
            <Banner />
            <div className="container home-section-header fade-in-section">
                <div className="decorative-header">
                    <span className="header-leaf left">🍃</span>
                    <Typography.Title level={2} className="premium-gradient-text home-section-title">Gợi ý cho bạn</Typography.Title>
                    <span className="header-leaf right">🍃</span>
                </div>
            </div>
            <div className="fade-in-section">
                <RecommendedProduct />
            </div>
            {expires && (
                <div className="fade-in-section">
                    <Countdown expires={expires} />
                </div>
            )}
            <Flex className="product_hot container text-center fade-in-section responsive-section" vertical>
                <div className="section-title-wrap">
                    <div className="decorative-header">
                        <span className="header-leaf left">🌟</span>
                        <Typography.Title level={2} className="premium-gradient-text home-section-title">Khuyến mãi cực hot</Typography.Title>
                        <span className="header-leaf right">🌟</span>
                    </div>
                    <Typography.Text type="secondary" className="home-section-subtitle">Đừng bỏ lỡ những ưu đãi hấp dẫn dành riêng cho bạn</Typography.Text>
                </div>
                <Flex gap='large' wrap='wrap' justify='start' className="product-grid">

                    {querySale.isLoading ? (
                        [...Array(4)].map((_, index) => (
                            <Skeleton key={index} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} className="product-skeleton" />
                        ))
                    ) : productHot.length === 0 ? (
                        <Empty description={"Không có sản phẩm nào"} />
                    ) : (
                        productHot.slice(0, 4).map((item) => (
                            <Product_Hot products={item} key={item.id} />
                        ))
                    )}
                </Flex>
                {productHot.length > 4 && (
                    <Flex justify="center" className="view-all-container" style={{ marginTop: "40px" }}>
                        <Link to="/client/sale" className="premium-button-outline">
                            Xem tất cả khuyến mãi <span>→</span>
                        </Link>
                    </Flex>
                )}
            </Flex>
            <Flex className="product_list container fade-in-section responsive-section" vertical style={{ marginBottom: "60px", backgroundColor: "#fafafb", borderRadius: "24px" }}>
                <div className="section-title-wrap">
                    <div className="decorative-header">
                        <span className="header-leaf left">🌱</span>
                        <Typography.Title level={2} className="premium-gradient-text home-section-title">Sản phẩm mới</Typography.Title>
                        <span className="header-leaf right">🌱</span>
                    </div>
                    <Typography.Text type="secondary" className="home-section-subtitle">Khám phá những sản phẩm mới nhất từ cửa hàng</Typography.Text>
                </div>
                <Flex className="products product-grid" gap='large' wrap='wrap' justify='start'>
                    {data ? (
                        productNew.length === 0 ? (
                            <Empty description={"Không có sản phẩm nào"} />
                        ) : (
                            productNew.slice(0, 4).map((item) => (
                                <Product_List products={item} key={item.id} />
                            ))
                        )
                    ) : (
                        [...Array(4)].map((_, index) => (
                            <Skeleton key={index} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} className="product-skeleton" />
                        ))
                    )}
                </Flex>
                {productNew.length > 4 && (
                    <div className="view-all-container text-center" style={{ marginTop: "40px" }}>
                        <Link to="/client/shop" className="premium-button-outline">
                            Xem tất cả sản phẩm mới <span>→</span>
                        </Link>
                    </div>
                )}
            </Flex>
        </Flex>
    );
}
export default Home;