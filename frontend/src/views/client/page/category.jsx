import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Empty, Flex, Pagination, Typography, Row, Col } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { detailCategory } from "../../../services/category_service";
import { productByCategory } from "../../../services/product_service";
import Banner_Big from "../layout/banner_big";
import ProductGrid from "../layout/product_grid";
import "./../style/category.css";
function Category() {
    const { category_id } = useParams();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    console.log(page);
    const [categoryName, setCategoryName] = useState('')
    const [categoryImage, setCategoryImage] = useState('')
    const [total, setTotal] = useState(0)

    const { isSuccess, data } = useQuery({
        queryKey: ['product_by_cate', category_id, page],
        queryFn: () => productByCategory(category_id, page),
        enabled: !!page || !!category_id
    })
    const getNameCategory = useQuery({
        queryKey: ['getName', category_id],
        queryFn: () => detailCategory(category_id)
    })
    useEffect(() => {
        if (!isSuccess) return
        const rawData = data?.data?.products
        setProducts(rawData?.docs?.map(item => ({
            id: item?._id,
            name: item?.name,
            price: item?.price,
            origin: item?.origin,
            image: item?.images[0],
            pricePromotion: item?.saleId.length !== 0 ?
                new Date(dayjs(item?.saleId[item?.saleId.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                    0 :
                    (item?.saleId[item?.saleId.length - 1]?.products || []).find(product => product.productId === item?._id)?.pricePromotion || 0
                : 0,
            status: item?.isActive,
            quantity: item?.quantity?.inTrade
        })))
        setCategoryName(rawData?.docs[0]?.categoryId?.name)
        setTotal(rawData?.totalDocs)
    }, [isSuccess, data])

    useEffect(() => {
        if (!getNameCategory?.isSuccess) return
        const rawName = getNameCategory?.data?.data?.name
        const rawImage = getNameCategory?.data?.data?.image
        setCategoryName(rawName)
        setCategoryImage(rawImage)

    }, [getNameCategory?.isSuccess, getNameCategory?.data])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category_id]);


    useEffect(() => {
        if (categoryName)
            document.title = categoryName;

    }, [categoryName])
    return (
        <div className="category-main-container">
            <Banner_Big info={categoryName?.toUpperCase()} image={categoryImage} />
            <div className="category_content_inner animate-fade-in">
                <Breadcrumb
                    items={[
                        { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                        { title: <span className="active-breadcrumb">{categoryName?.toUpperCase()}</span> },
                    ]}
                    className="custom-breadcrumb"
                />

                <div className="category_header_section animate-slide-up">
                    <div className="category-title-area">
                        <div className="category-badge">BỘ SƯU TẬP</div>
                        <Typography.Title level={1} className="premium-gradient-text category-display-title">
                            {categoryName || "DANH MỤC SẢN PHẨM"}
                        </Typography.Title>
                    </div>
                    
                    <div className="results-count-pill">
                        Hiển thị <b>{total !== 0 ? (page - 1) * 8 + 1 : 0}</b> - <b>{Math.min(page * 8, total)}</b> trên <b>{total}</b> sản phẩm
                    </div>
                </div>

                <div className="category_products_grid animate-fade-in-delayed">
                    {products.length !== 0 ? (
                        <>
                            <Row gutter={[24, 32]}>
                                {products.map((item) => (
                                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.id} className="product-col">
                                        <ProductGrid products={item} />
                                    </Col>
                                ))}
                            </Row>

                            {total > 8 && (
                                <Flex justify="center" className="pagination-wrapper">
                                    <Pagination
                                        total={total}
                                        pageSize={8}
                                        current={page}
                                        showSizeChanger={false}
                                        onChange={(p) => setPage(p)} 
                                    />
                                </Flex>
                            )}
                        </>
                    ) : (
                        <div className="empty-state-wrapper">
                            <Empty 
                                description={<span className="empty-text">Hiện tại chưa có sản phẩm nào trong danh mục này.</span>} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Category;