import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Empty, Flex, Pagination, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { latestSale } from "../../../services/sale_service";
import Banner_Big from "../layout/banner_big";
import ProductGrid from "../layout/product_grid";
import "../style/Sale.css";

function Sale() {
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [bannerImage, setBannerImage] = useState("");

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ['sale_page_products'],
        queryFn: () => latestSale()
    });

    useEffect(() => {
        if (!isSuccess) return;
        const rawData = data?.data;
        if (rawData?.products) {
            setProducts(rawData.products.filter(item => item.productId).map(item => ({
                name: item?.productId?.name,
                price: item?.productId?.price,
                image: item?.productId?.images?.[0],
                id: item?.productId?._id,
                origin: item?.productId?.origin,
                pricePromotion: item?.pricePromotion,
                status: item?.productId?.isActive,
                quantity: item?.productId?.quantity?.inTrade,
                unit: item?.productId?.unit
            })));
            setBannerImage(rawData.products[0]?.productId?.images?.[0] || "");
        }
    }, [isSuccess, data]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const pageSize = 12;
    const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

    return (
        <Flex vertical>
            <Banner_Big info="SIÊU ƯU ĐÃI" image={bannerImage} />
            <Flex className="sale_page container" vertical align="center">
                <Breadcrumb
                    items={[
                        { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                        { title: <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>KHUYẾN MÃI</span> },
                    ]}
                />

                <div className="sale_content" style={{ width: '100%' }}>
                    <div className="section_header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <Typography.Title level={2} className="premium-gradient-text" style={{ fontSize: '32px', fontWeight: '800' }}>
                            GIẢM GIÁ CỰC SỐC
                        </Typography.Title>
                        <br />
                        <Typography.Text type="secondary">Đừng bỏ lỡ cơ hội sở hữu trái cây tươi ngon với giá hời</Typography.Text>
                    </div>

                    {isLoading ? (
                        <Flex wrap="wrap" gap="24px" justify="start" style={{ width: '100%' }}>
                            {[...Array(8)].map((_, i) => (
                                <Skeleton key={i} active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 2 }} style={{ width: 'calc(25% - 18px)' }} />
                            ))}
                        </Flex>
                    ) : products.length === 0 ? (
                        <Empty description="Hiện không có chương trình khuyến mãi nào" />
                    ) : (
                        <Flex className="category_items" wrap="wrap" gap="24px" style={{ width: "100%" }}>
                            {paginatedProducts.map((item) => (
                                <ProductGrid products={item} key={item.id} />
                            ))}
                        </Flex>
                    )}

                    {products.length > pageSize && (
                        <Flex justify="center" style={{ marginTop: '40px' }}>
                            <Pagination
                                current={page}
                                total={products.length}
                                pageSize={pageSize}
                                onChange={(p) => setPage(p)}
                                showSizeChanger={false}
                            />
                        </Flex>
                    )}
                </div>
            </Flex>
        </Flex>
    );
}

export default Sale;
