import { useQuery } from "@tanstack/react-query";
import { Empty, Flex, Skeleton, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { listProduct } from "../../../services/product_service";
import { loginByGoogle } from "../../../services/user_service";
import Banner from "../layout/banner";
import { Countdown } from "../layout/CountDown";
import Product_Hot from "../layout/product_hot";
import Product_List from "../layout/product_list";
import RecommendedProduct from "../layout/RecommendedProduct";
import { ACTION_USER, UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import { LogContext } from "../../../store/typeLog/provider";
import { latestSale, listSale } from "../../../services/sale_service";
import dayjs from "dayjs";

function Home() {
    document.title = "Home";
    const { dispatch } = useContext(UserContext)
    const logGoogle = useContext(LogContext)
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
        setProductHot(rawData?.products?.map(item => ({
            name: item?.productId?.name,
            price: item?.productId?.price,
            image: item?.productId?.images[0],
            id: item?.productId?._id,
            origin: item?.productId?.origin,
            sale: item?.pricePromotion,
            status: item?.productId?.isActive,
            quantity: item?.productId.quantity?.inTrade

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
            quantity: item?.quantity?.inTrade

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
            }
        }
    }, [getUser?.isSuccess, getUser?.data, getUser?.error, dispatch, logGoogle?.state])
    return (
        <Flex vertical>
            <Banner />
            <RecommendedProduct />
            <Countdown expires={expires} />
            <Flex className="product_hot container text-center" vertical >
                <Flex gap='large'>

                    {!productHot ? <Empty description={"No products available"} /> : productHot.slice(0, 4).map((item, index) => {
                        return <Skeleton key={index} loading={isLoadingSale} active>
                            <Product_Hot products={item} key={item.id} />
                        </Skeleton>
                    })}
                </Flex>
            </Flex>
            <Flex className="product_list container" vertical>
                <Typography.Title level={1}>new products</Typography.Title>
                <Flex className="products" gap='large'>
                    {!productNew ? <Empty description={"No products available"} /> : productNew.slice(1, 5).map((item, index) => {
                        return <Skeleton loading={isLoadingNew} active key={index}>
                            <Product_List products={item} key={item.id} />
                        </Skeleton>
                    })}
                </Flex>
            </Flex>
        </Flex>
    );
}
export default Home;