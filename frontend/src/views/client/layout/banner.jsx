import "./../style/banner.css";
import { Carousel } from "antd";
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
    const { isSuccess, data } = useQuery({
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

    return (
        <Carousel
            autoplay
            autoplaySpeed={2000}
            arrows
            prevArrow={<SlickArrowLeft />}
            nextArrow={<SlickArrowRight />}
            effect="fade"
        >
            {
                banners.filter(item => item?.isActive !== false).length !== 0 ? (
                    banners.filter(item => item?.isActive !== false).map(item => (
                        <div key={item.id}>
                            <img src={item.image} alt={`Banner ${item.id}`} height='100%' width='100%' />
                        </div>
                    ))
                ) : (
                    <>
                        <div>
                            <img src={"/data/banner/banner-home-1.png"} alt="Default Banner 1" height='100%' width='100%' />
                        </div>
                        <div>
                            <img src={"/data/banner/banner-home-2.png"} alt="Default Banner 2" height='100%' width='100%' />
                        </div>
                    </>
                )
            }
        </Carousel>
    );
}
export default Banner;