import { useQuery } from "@tanstack/react-query";
import { Button, Empty, Flex, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <Flex vertical>
            <Banner />
            <div className="container fade-in-section" style={{ marginTop: "80px", marginBottom: "20px" }}>
                <Typography.Title level={2} className="premium-gradient-text" style={{ textTransform: "uppercase", textAlign: "center", margin: "0 auto", display: "block", fontSize: "36px", fontWeight: "800", letterSpacing: "-0.5px" }}>Gợi ý cho bạn</Typography.Title>
            </div>
            <div className="fade-in-section">
                <RecommendedProduct />
            </div>
            {expires && (
                <div className="fade-in-section">
                    <Countdown expires={expires} />
                </div>
            )}
            <Flex className="product_hot container text-center fade-in-section" vertical style={{ padding: "40px 50px" }}>
                <Flex gap='large' wrap='wrap' justify='start'>
                    {querySale.isLoading ? (
                        [...Array(4)].map((_, index) => (
                            <Skeleton key={index} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} style={{ width: 250 }} />
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
                    <Flex justify="center" style={{ marginTop: "40px" }}>
                        <Button
                            type="primary"
                            size="large"
                            className="premium-button"
                            onClick={() => navigate('/client/sale')}
                            style={{
                                height: "50px",
                                padding: "0 40px",
                                borderRadius: "25px",
                                fontSize: "16px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                textAlign: 'center'
                            }}
                        >
                            XEM TẤT CẢ KHUYẾN MÃI
                        </Button>
                    </Flex>
                )}
            </Flex>
            <Flex className="product_list container fade-in-section" vertical style={{ padding: "40px 50px", marginBottom: "60px", backgroundColor: "#fafafb", borderRadius: "24px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <Typography.Title level={2} className="premium-gradient-text" style={{ textTransform: "uppercase", margin: "0 auto", display: "block", fontSize: "36px", fontWeight: "800", letterSpacing: "-0.5px" }}>Sản phẩm mới</Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: "16px" }}>Khám phá những sản phẩm mới nhất từ cửa hàng</Typography.Text>
                </div>
                <Flex className="products" gap='large' wrap='wrap' justify='start'>
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
                            <Skeleton key={index} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} style={{ width: 250 }} />
                        ))
                    )}
                </Flex>
                {productNew.length > 4 && (
                    <Flex justify="center" style={{ marginTop: "40px" }}>
                        <Button
                            type="primary"
                            size="large"
                            className="premium-button"
                            onClick={() => navigate('/client/shop')}
                            style={{
                                height: "50px",
                                padding: "0 40px",
                                borderRadius: "25px",
                                fontSize: "16px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                textAlign: 'center'
                            }}
                        >
                            XEM TẤT CẢ SẢN PHẨM
                        </Button>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
}
export default Home;