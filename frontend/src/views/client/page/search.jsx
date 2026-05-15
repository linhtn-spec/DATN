import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Col, Empty, Flex, Pagination, Row, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import bannerImage from "../../../assets/big_banner.png";
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

    return (
        <div className="search-results-container">
            {/* Premium Banner Section */}
            <Banner_Big info="KẾT QUẢ TÌM KIẾM" image={bannerImage} />

            <div className="search_page_inner">
                {/* Header & Breadcrumb Section */}
                <div className="search-header-section animate-fade-in">
                    <Breadcrumb
                        items={[
                            {
                                title: <NavLink to={'/client/home'}>TRANG CHỦ</NavLink>,
                            },
                            {
                                title: <span style={{ color: '#15803d', fontWeight: 600 }}>TÌM KIẾM</span>,
                            },
                        ]}
                    />

                    <div style={{ marginTop: '24px' }}>
                        <Typography.Text type="secondary" style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                            Từ khóa tìm kiếm
                        </Typography.Text>
                        <Typography.Title level={1} className="premium-gradient-text search-display-title">
                            "{keyword}"
                        </Typography.Title>

                        {product.length > 0 && (
                            <div className="results-count-pill">
                                Tìm thấy {totalProducts} sản phẩm
                            </div>
                        )}
                    </div>
                </div>

                {/* Product List Section */}
                {product.length === 0 ? (
                    <div className="animate-fade-in" style={{ padding: '100px 0' }}>
                        <Empty description={<span style={{ fontSize: '18px', color: '#64748b' }}>Không tìm thấy sản phẩm nào khớp với từ khóa của bạn.</span>} />
                    </div>
                ) : (
                    <div className="animate-slide-up">
                        <Row gutter={[24, 24]} style={{ width: '100%', margin: 0 }}>
                            {product.map((item, index) => (
                                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.id} className="product-col">
                                    <ProductGrid products={item} />
                                </Col>
                            ))}
                        </Row>

                        {/* Pagination Section */}
                        <Flex justify="center" className="search_pagination">
                            <Pagination
                                showSizeChanger={false}
                                total={totalProducts}
                                pageSize={8}
                                current={page}
                                hideOnSinglePage
                                onChange={setPage}
                            />
                        </Flex>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Search;