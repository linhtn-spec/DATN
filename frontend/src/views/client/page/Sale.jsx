import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Col, Empty, Flex, Pagination, Row, Skeleton, Space, Typography } from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { latestSale } from "../../../services/sale_service";
import Banner_Big from "../layout/banner_big";
import ProductGrid from "../layout/product_grid";
import "../style/Sale.css";

dayjs.extend(duration);

function Sale() {
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [bannerImage, setBannerImage] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);

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

        if (rawData?.dueDate) {
            const target = dayjs(rawData.dueDate);
            const interval = setInterval(() => {
                const now = dayjs();
                const diff = target.diff(now);
                if (diff <= 0) {
                    clearInterval(interval);
                    setTimeLeft(null);
                } else {
                    const dur = dayjs.duration(diff);
                    setTimeLeft({
                        days: Math.floor(dur.asDays()),
                        hours: dur.hours(),
                        minutes: dur.minutes(),
                        seconds: dur.seconds()
                    });
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isSuccess, data]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const pageSize = 12;
    const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

    const isWeekend = [0, 5, 6].includes(dayjs().day()); // Fri, Sat, Sun
    const totalDaysRemaining = timeLeft ? timeLeft.days : 0;
    const isLongTerm = totalDaysRemaining > 3;

    return (
        <div className="flash-sale-container">
            <Banner_Big info="SIÊU ƯU ĐÃI FLASH SALE" image={bannerImage} />
            <div className="container sale_page_inner animate-fade-in">
                <Breadcrumb
                    items={[
                        { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                        { title: <span className="active-breadcrumb">KHUYẾN MÃI</span> },
                    ]}
                    className="custom-breadcrumb"
                />

                <div className="sale_content_header animate-slide-up">
                    <div className="title-section">
                        <div className="title-badge">HOT DEALS</div>
                        <Typography.Title level={1} className="premium-gradient-text sale-title">
                            {data?.data?.name || (isWeekend ? "FLASH SALE CUỐI TUẦN" : "SỰ KIỆN ƯU ĐÃI ĐẶC BIỆT")}
                        </Typography.Title>
                        <p className="sale-subtitle">
                            {isLongTerm 
                                ? "Khám phá danh mục sản phẩm đang được áp dụng mức giá ưu đãi cực tốt trong tháng này. Số lượng có hạn!"
                                : "Cơ hội sở hữu những sản phẩm tươi ngon nhất với mức giá không tưởng. Đừng bỏ lỡ ngày vàng giá sốc!"}
                        </p>
                    </div>

                    {data?.data?.dueDate && timeLeft && (
                        <div className="countdown-timer-wrapper premium-glass">
                            <span className="timer-label">SẮP KẾT THÚC TRONG</span>
                            <div className="timer-slots">
                                {timeLeft.days > 0 && (
                                    <>
                                        <div className="timer-slot">
                                            <span className="time-val">{String(timeLeft.days).padStart(2, '0')}</span>
                                            <span className="time-unit">Ngày</span>
                                        </div>
                                        <span className="timer-sep">:</span>
                                    </>
                                )}
                                <div className="timer-slot">
                                    <span className="time-val">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="time-unit">Giờ</span>
                                </div>
                                <span className="timer-sep">:</span>
                                <div className="timer-slot">
                                    <span className="time-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="time-unit">Phút</span>
                                </div>
                                <span className="timer-sep">:</span>
                                <div className="timer-slot">
                                    <span className="time-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="time-unit">Giây</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sale-products-grid animate-fade-in-delayed">
                    {isLoading ? (
                        <Row gutter={[24, 24]}>
                            {[...Array(8)].map((_, i) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                    <div className="skeleton-card">
                                        <Skeleton.Image active className="skel-img" />
                                        <Skeleton active paragraph={{ rows: 2 }} />
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    ) : products.length === 0 ? (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className="empty-text">Hiện tại không có chương trình khuyến mãi nào. Vui lòng quay lại sau!</span>} 
                            className="premium-empty"
                        />
                    ) : (
                        <>
                            <Row gutter={[24, 32]}>
                                {paginatedProducts.map((item, index) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={item.id} className="product-col">
                                        <ProductGrid products={item} />
                                    </Col>
                                ))}
                            </Row>

                            {products.length > pageSize && (
                                <Flex justify="center" className="pagination-wrapper">
                                    <Pagination
                                        current={page}
                                        total={products.length}
                                        pageSize={pageSize}
                                        onChange={(p) => setPage(p)}
                                        showSizeChanger={false}
                                    />
                                </Flex>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sale;
