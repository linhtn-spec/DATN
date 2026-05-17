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
import ProductGrid from "../layout/product_grid";
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
            unit: item?.productId?.unit,
            stars: 5 // Defaulting to 5 for now
        })))
        setExpires(rawData?.dueDate)
    }, [querySale?.isSuccess, querySale?.data])

    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.products?.docs
        setProductNew(rawData?.map(item => {
            const latestSaleItem = item?.saleId?.[item?.saleId?.length - 1];
            const isSaleActive = latestSaleItem && new Date(dayjs(latestSaleItem?.dueDate)).getTime() > new Date().getTime();
            const pricePromotion = isSaleActive ? (latestSaleItem?.products?.find(p => p.productId === item?._id)?.pricePromotion || 0) : 0;

            return {
                name: item?.name,
                price: item?.price,
                image: item?.images[0],
                id: item?._id,
                origin: item?.origin,
                pricePromotion,
                status: item?.isActive,
                quantity: item?.quantity?.inTrade,
                unit: item?.unit,
                stars: 5
            };
        }))
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
            <div className="fade-in-section" style={{ marginBottom: "20px" }}>
                <RecommendedProduct />
            </div>

            <Flex className="product_hot container fade-in-section responsive-section" vertical style={{ marginTop: "20px" }}>
                <div className="section-title-wrap">
                    <Flex justify="space-between" align="flex-end" wrap="wrap" gap="middle" className="sale-header-flex">
                        <div className="decorative-header" style={{ textAlign: 'left', margin: 0 }}>
                            <span className="header-leaf left">🌟</span>
                            <Typography.Title level={2} className="premium-gradient-text home-section-title" style={{ margin: 0 }}>Khuyến mãi cực hot</Typography.Title>
                            <span className="header-leaf right">🌟</span>
                        </div>
                        {expires && <Countdown expires={expires} minimal={true} />}
                    </Flex>
                    <Typography.Text type="secondary" className="home-section-subtitle" style={{ display: 'block', textAlign: 'left', marginTop: '12px' }}>
                        Cơ hội sở hữu thực phẩm tươi ngon với mức giá ưu đãi nhất
                    </Typography.Text>
                </div>

                <div className="product-grid-container" style={{ marginTop: "30px" }}>
                    <div className="product_grid_wrapper">
                        {querySale.isLoading ? (
                            [...Array(4)].map((_, index) => (
                                <Skeleton key={index} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} className="product-skeleton" />
                            ))
                        ) : productHot.length === 0 ? (
                            <Empty description={"Không có sản phẩm nào"} />
                        ) : (
                            productHot.slice(0, 4).map((item) => (
                                <ProductGrid products={item} key={item.id} />
                            ))
                        )}
                    </div>
                </div>

                {productHot.length > 4 && (
                    <Flex justify="center" className="view-all-container" style={{ marginTop: "40px" }}>
                        <Link to="/client/sale" className="premium-button-outline">
                            Xem tất cả khuyến mãi <span>→</span>
                        </Link>
                    </Flex>
                )}
            </Flex>

            <Flex className="product_list container fade-in-section responsive-section" vertical style={{ marginBottom: "60px", marginTop: "40px", padding: '40px', backgroundColor: "#f8fafc", borderRadius: "32px" }}>
                <div className="section-title-wrap">
                    <div className="decorative-header" style={{ textAlign: 'left' }}>
                        <span className="header-leaf left">🌱</span>
                        <Typography.Title level={2} className="premium-gradient-text home-section-title" style={{ margin: 0 }}>Sản phẩm mới</Typography.Title>
                        <span className="header-leaf right">🌱</span>
                    </div>
                    <Typography.Text type="secondary" className="home-section-subtitle" style={{ display: 'block', textAlign: 'left', marginTop: '12px' }}>
                        Khám phá nguồn dinh dưỡng tươi sạch mỗi ngày cho gia đình
                    </Typography.Text>
                </div>

                <div className="product-grid-container" style={{ marginTop: "30px" }}>
                    <div className="product_grid_wrapper">
                        {data ? (
                            productNew.length === 0 ? (
                                <Empty description={"Không có sản phẩm nào"} />
                            ) : (
                                productNew.slice(0, 4).map((item) => (
                                    <ProductGrid products={item} key={item.id} />
                                ))
                            )
                        ) : (
                            [...Array(4)].map((_, index) => (
                                <Skeleton key={index} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} className="product-skeleton" />
                            ))
                        )}
                    </div>
                </div>

                {productNew.length > 4 && (
                    <Flex justify="center" className="view-all-container" style={{ marginTop: "40px" }}>
                        <Link to="/client/shop" className="premium-button-outline">
                            Xem tất cả sản phẩm mới <span>→</span>
                        </Link>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
}
export default Home;