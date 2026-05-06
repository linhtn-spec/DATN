import "./../style/banner.css";
import { Carousel, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useQuery } from "@tanstack/react-query";
import { optionBanner } from "../../../services/banner_service";
import { useEffect, useState } from "react";
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
    const [banners, setBanners] = useState([])
    const { isSuccess, data, isLoading } = useQuery({
        queryKey: ['banners_client'],
        queryFn: () => optionBanner()
    })
    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.data
        setBanners(rawData?.filter(item => item.isActive !== false).sort((a, b) => a.order - b.order).map(item => ({ id: item._id, image: item.image })))
        return () => {

        }
    }, [isSuccess, data])

    if (isLoading) {
        return (
            <div className="home-banner-skeleton" style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
               <Skeleton.Image active style={{ width: '100%', height: '400px' }} />
            </div>
        )
    }

    const activeBanners = banners.filter(item => item?.isActive !== false);

    if (activeBanners.length === 0) {
        return null; // Don't render anything if no banners exist
    }

    return (
        <Carousel
            className="home-banner"
            autoplay
            autoplaySpeed={2000}
            arrows
            prevArrow={< SlickArrowLeft />}
            nextArrow={< SlickArrowRight />}
            effect="fade"
        >
            {activeBanners.map(item => (
                <div key={item.id}>
                    <img src={item.image} alt={`Banner ${item.id}`} height='100%' width='100%' />
                </div>
            ))}
        </Carousel>
    );
}
export default Banner;