import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Empty, Flex, Pagination } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { searchProduct } from "../../../services/product_service";
import Banner_Big from "../layout/banner_big";
import ProductGrid from "../layout/product_grid";
import "./../style/search.css";
function Search() {
    const [searchInput] = useSearchParams();
    const keyword = searchInput.get('keyword')
    const [totalProducts, setTotalProducts] = useState(0);
    const [page, setPage] = useState(1);
    const [product, setProduct] = useState([]);

    const { data, isSuccess } = useQuery({
        queryKey: ['search_product', keyword, page],
        queryFn: () => searchProduct(keyword, page)
    })


    useEffect(() => {
        if (!isSuccess) return
        setProduct(data?.data?.item?.map(is => ({
            id: is?._id,
            name: is?.name,
            origin: is?.origin,
            price: is?.price,
            image: is?.images[0],
            quantity: is?.quantity?.inTrade,
            pricePromotion: is?.sales?.length !== 0 ?
                new Date(dayjs(is?.sales[is?.sales.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                    0 :
                    is?.sales[is?.sales.length - 1]?.pricePromotion || 0
                : 0,
            status: is?.isActive,
            unit: is?.unit

        })))
        setTotalProducts(data?.data?.total)

    }, [isSuccess, data])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [searchInput]);

    useEffect(() => {
        document.title = "Kết quả tìm kiếm cho " + keyword;
    }, [keyword])


    useEffect(() => {
        setPage(1)
    }, [keyword])
    console.log(data?.data);
    return (
        <Flex className="search" vertical align='center'>
            <Banner_Big info={keyword} />
            <div className="container search_page">
                <Breadcrumb
                    items={[
                        {
                            title: <NavLink to={'/'}>TRANG CHỦ</NavLink>,
                        },
                        {
                            title: <NavLink to={'/search'}>TÌM KIẾM</NavLink>,
                        },
                    ]}
                />
                {product.length === 0 ? <Empty description={"Không tìm thấy sản phẩm"} /> :
                    <Flex vertical gap={"20px"}>
                        <Flex className="results_pagination" style={{ width: "100%" }} justify="center">
                            <p className=" text-left">Hiển thị <b>1</b> - <b>{product.length}</b> trong tổng số <b>{totalProducts}</b> kết quả</p>
                        </Flex>
                        <Flex className="category_items" wrap="wrap" gap="50px" style={{ width: "100%" }}>
                            {product.map((item, index) => {
                                return <ProductGrid products={item} key={index} />
                            })}
                        </Flex>
                        <Flex justify="center">
                            <Pagination
                                showSizeChanger={false}
                                total={totalProducts}
                                pageSize={6}
                                current={page}
                                hideOnSinglePage
                                onChange={setPage} />
                        </Flex>
                    </Flex>}
            </div>
        </Flex>
    );
}
export default Search;