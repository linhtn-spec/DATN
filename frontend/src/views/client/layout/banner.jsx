import "./../style/banner.css";
import { Carousel, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useQuery } from "@tanstack/react-query";
import { optionBanner } from "../../../services/banner_service";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const SlickArrowLeft = (props) => {
    const { currentSlide, slideCount, ...restProps } = props;
    return (
        <div {...restProps}>
            <LeftOutlined />
        </div>
    );
};

const SlickArrowRight = (props) => {
    const { currentSlide, slideCount, ...restProps } = props;
    return (
        <div {...restProps}>
            <RightOutlined />
        </div>
    );
};

function Banner() {
    const navigate = useNavigate()
    const [banners, setBanners] = useState([])
    const { isSuccess, data, isLoading } = useQuery({
        queryKey: ['banners_client'],
        queryFn: () => optionBanner()
    })
    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.data
        setBanners(rawData?.filter(item => item.isActive !== false)
            .sort((a, b) => a.order - b.order)
            .map(item => ({ 
                id: item._id, 
                image: item.image,
                title: item.title,
                subtitle: item.description 
            })))
    }, [isSuccess, data])

    if (isLoading) {
        return (
            <div className="home-banner-skeleton" style={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
               <Skeleton.Image active style={{ width: '100%', height: '500px' }} />
            </div>
        )
    }

    const activeBanners = banners.filter(item => item?.isActive !== false);

    if (activeBanners.length === 0) {
        return null;
    }

    return (
        <Carousel
            className="home-banner"
            autoplay
            autoplaySpeed={5000}
            arrows
            prevArrow={<SlickArrowLeft />}
            nextArrow={<SlickArrowRight />}
            effect="fade"
            pauseOnHover={false}
        >
            {activeBanners.map((item) => (
                <div key={item.id} className="banner-slide">
                    <div className="banner-image-wrap">
                        <img src={item.image} alt={item.title || "Banner"} />
                    </div>
                    <div className="banner-content-overlay">
                        <div className="banner-glass-card">
                            <span className="banner-badge">Sản phẩm hữu cơ</span>
                            <h1 className="banner-title">
                                {item.title || "S-Cart: Organic Food"}
                            </h1>
                            <p className="banner-subtitle">
                                {item.subtitle || "Chúng tôi mang đến nguồn thực phẩm organic tươi mới nhất mỗi ngày đến tay bạn."}
                            </p>
                            <button className="banner-cta" onClick={() => navigate('/client/shop')}>
                                MUA NGAY BÂY GIỜ
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </Carousel>
    );
}
export default Banner;