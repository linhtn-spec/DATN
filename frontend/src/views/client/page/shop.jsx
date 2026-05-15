import ProductItem from "../layout/product_grid";
import { CloseOutlined, FilterOutlined, ShoppingOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Checkbox, Col, Drawer, Empty, Flex, Pagination, Radio, Rate, Row, Select, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { optionCategory } from "../../../services/category_service";
import { listProduct } from "../../../services/product_service";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import useDebounce from "../../../utils/useDebounce";
import "../style/shop.css";

const getCategoryLabels = (categoryFilter, optionsCategory) => {
    return categoryFilter.map(filterId => {
        const category = optionsCategory.find(option => option.value === filterId);
        return category ? category.label : '';
    });
};



function Shop() {
    const [categoryFilter, setCategoryFilter] = useState([])
    const [priceFilter, setPriceFilter] = useState('')
    const [isEmpty, setIsEmpty] = useState(true)
    const [optionsCategory, setOptionsCategory] = useState([])
    const cart = useContext(CartContext)
    const user = useContext(UserContext)
    const info = user?.state?.currentUser
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const addToCart = (product) => {
        if (info) {
            cart?.dispatch({ type: ACTION_CART.ADD_CART, payload: { ...product, quantityBuy: 1 } })
            Notification({ message: "Thêm vào giỏ hàng thành công!", type: "success" })
        }
        else {
            Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })

        }
    };

    const [sortName, setSortName] = useState('')
    const [sortPrice, setSortPrice] = useState('')
    const [sortDate, setSortDate] = useState('')

    const searchSortName = useDebounce(sortName, 500)
    const searchSortPrice = useDebounce(sortPrice, 500)
    const searchSortDate = useDebounce(sortDate, 500)

    const [total, setTotal] = useState(0)
    const [products, setProducts] = useState([])
    const [page, setPage] = useState(1)
    const navigate = useNavigate()

    const onChangeCategory = (checkedValues) => {
        setCategoryFilter(checkedValues)
    };

    const onChangePrice = (e) => {
        setPriceFilter(e.target.value);
    };

    useEffect(() => {
        document.title = "Cửa hàng";

        return () => {
            document.title = "";
        }
    }, [])

    const handleChange = (e) => {
        if (!e) {
            setSortDate('');
            setSortName('');
            setSortPrice('');
        }

        const [sortField, sortOrder] = e?.value?.split('=');

        switch (sortField) {
            case 'sortName':
                setSortName(sortOrder);
                setSortPrice('');
                setSortDate('');
                break;
            case 'sortPrice':
                setSortPrice(sortOrder);
                setSortName('');
                setSortDate('');
                break;
            case 'sortDate':
                setSortDate(sortOrder);
                setSortName('');
                setSortPrice('');
                break;
            default:
                setSortDate('');
                setSortName('');
                setSortPrice('');
                break;
        }
    };

    const optionsCategories = useQuery({
        queryKey: ['optionsCategories'],
        queryFn: () => optionCategory()
    })

    const productShop = useQuery({
        queryKey: ['shop', page, categoryFilter, priceFilter, searchSortName, searchSortPrice, searchSortDate],
        queryFn: () => listProduct(page, '', '', categoryFilter.join(','), searchSortName, searchSortPrice, searchSortDate, priceFilter.split(' - ')[0], priceFilter.split(' - ')[1]),
        placeholderData: keepPreviousData
    })

    useEffect(() => {
        if (!optionsCategories?.isSuccess) return
        const rawData = optionsCategories?.data?.data?.data
        setOptionsCategory(rawData?.map(item => ({
            value: item?._id,
            label: item?.name
        })))
        return () => {
            setOptionsCategory([])
        }
    }, [optionsCategories?.isSuccess, optionsCategories?.data])


    useEffect(() => {
        if (!productShop?.isSuccess) {
            return
        }
        const rawData = productShop?.data?.data?.products
        if (rawData?.docs?.length > 0) {
            setProducts(rawData?.docs?.map(item => ({
                id: item?._id,
                name: item?.name,
                image: item?.images[0],
                price: item?.price,
                quantity: item?.quantity?.inTrade,
                stars: item?.ratingId?.reduce((acc, curr) => acc + curr.stars, 0) / item?.ratingId?.length,
                pricePromotion: item?.saleId.length !== 0 ?
                    new Date(dayjs(item?.saleId[item?.saleId.length - 1]?.dueDate)).getTime() < new Date().getTime() ?
                        0 :
                        (item?.saleId[item?.saleId.length - 1]?.products || []).find(product => product.productId === item?._id)?.pricePromotion || 0
                    : 0,
                status: item?.isActive,
                unit: item?.unit
            })))
            setTotal(rawData?.totalDocs)
            setIsEmpty(false)
        } else {
            setProducts([])
            setTotal(0)
            setIsEmpty(true)
        }
        return () => {
            setProducts([])
            setIsEmpty(false)
        }
    }, [productShop?.isSuccess, productShop?.data])
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <Flex className="shop" vertical>
            <Breadcrumb
                items={[
                    {
                        title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                    },
                    {
                        title: <NavLink to={'/client/shop'}>CỬA HÀNG</NavLink>,
                    },
                ]}
                style={{ marginTop: '12px' }}
            />

            <Flex className="shop_header" justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <Typography.Title level={2} style={{ margin: 0 }}>Cửa hàng</Typography.Title>
                <Button
                    className="mobile-filter-btn"
                    icon={<FilterOutlined />}
                    onClick={() => setIsFilterDrawerOpen(true)}
                    style={{ display: 'none' }}
                >
                    Bộ lọc
                </Button>
            </Flex>

            <Row gutter={[32, 24]} className="shop_content_container">
                <Col xs={0} lg={6}>
                    <div className="filter-sidebar">
                        <div className='filterCate'>
                            <Typography.Title level={5}>Danh mục</Typography.Title>
                            <Checkbox.Group options={optionsCategory} value={categoryFilter} onChange={onChangeCategory} />
                        </div>
                        <div className='filterPrice'>
                            <Typography.Title level={5}>Khoảng giá</Typography.Title>
                            <Radio.Group onChange={onChangePrice} value={priceFilter}>
                                <Space direction="vertical">
                                    <Radio value={'0 - 100000'}>0 - 100.000&nbsp;₫</Radio>
                                    <Radio value={'100000 - 300000'}>100.000 - 300.000&nbsp;₫</Radio>
                                    <Radio value={'300000 - 500000'}>300.000 - 500.000&nbsp;₫</Radio>
                                    <Radio value={'500000 - '}>Trên 500.000&nbsp;₫</Radio>
                                </Space>
                            </Radio.Group>
                        </div>
                    </div>
                </Col>

                <Col xs={24} lg={18}>
                    <Flex className="products_cate" vertical>
                        <Flex justify='space-between' align="center" wrap="wrap" gap={12} style={{ marginBottom: "20px" }}>
                            <Space className="filter_tag" wrap>
                                {categoryFilter.length !== 0 && (
                                    optionsCategory
                                        .filter(opt => categoryFilter.includes(opt.value))
                                        .map(category => (
                                            <Tag
                                                key={category.value}
                                                closable
                                                onClose={() => {
                                                    const newFilters = categoryFilter.filter(id => id !== category.value);
                                                    setCategoryFilter(newFilters);
                                                }}
                                                className="category-chip"
                                            >
                                                {category.label}
                                            </Tag>
                                        ))
                                )}
                                {priceFilter && (
                                    <Tag
                                        closable
                                        onClose={() => setPriceFilter('')}
                                        className="price-chip"
                                    >
                                        {priceFilter !== '500000 - ' ? priceFilter.replace(' - ', ' - ') + '\u00A0₫' : 'Trên 500.000\u00A0₫'}
                                    </Tag>
                                )}
                                {(categoryFilter.length !== 0 || priceFilter != '') &&
                                    (<Typography.Link
                                        className="clear-all-link"
                                        onClick={() => {
                                            setCategoryFilter([]);
                                            setPriceFilter('');
                                            setIsEmpty(false);
                                        }}
                                    >
                                        Xóa tất cả
                                    </Typography.Link>
                                    )}
                            </Space>
                            <Select
                                placeholder="Sắp xếp"
                                removeIcon={<CloseOutlined />}
                                suffixIcon={<SortAscendingOutlined />}
                                labelInValue
                                allowClear
                                className="sort-select"
                                onChange={handleChange}
                                options={[
                                    { value: 'sortPrice=ascend', label: 'Giá tăng dần' },
                                    { value: 'sortPrice=descend', label: 'Giá giảm dần' },
                                    { value: 'sortDate=ascend', label: 'Mới nhất' },
                                    { value: 'sortDate=descend', label: 'Cũ nhất' },
                                    { value: 'sortName=ascend', label: 'Tên: A-Z' },
                                    { value: 'sortName=descend', label: 'Tên: Z-A' },
                                ]}
                            />
                        </Flex>

                        <div className="products_result">
                            {(productShop.isLoading && products.length === 0) ? (
                                <Row gutter={[16, 16]}>
                                    {[...Array(6)].map((_, index) => (
                                        <Col xs={24} sm={12} md={8} key={index}>
                                            <div className="shop_item_skeleton">
                                                <Skeleton.Image active className="skeleton-img" />
                                                <Skeleton active paragraph={{ rows: 2 }} />
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            ) : isEmpty ? (
                                <Empty description="Không tìm thấy sản phẩm nào" />
                            ) : (
                                <>
                                    <div className='result-summary'>
                                        <Typography.Text type="secondary">
                                            Hiển thị <strong>{total !== 0 ? (page - 1) * 6 + 1 : 0} - {Math.min(page * 6, total)}</strong> trong số <strong>{total}</strong> kết quả
                                        </Typography.Text>
                                        {productShop.isFetching && <Skeleton.Button active size="small" style={{ marginLeft: 10, width: 20 }} />}
                                    </div>

                                    <Row gutter={[16, 24]} className="product-grid" style={{ opacity: productShop.isFetching ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
                                        {products.map(item => (
                                            <Col xs={24} sm={12} md={8} lg={8} key={item?.id}>
                                                <ProductItem products={item} />
                                            </Col>
                                        ))}
                                    </Row>
                                </>
                            )}
                            <Pagination
                                style={{ textAlign: "center", marginTop: "48px" }}
                                current={page}
                                total={total}
                                pageSize={6}
                                hideOnSinglePage
                                showSizeChanger={false}
                                onChange={(p) => {
                                    setPage(p);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </div>
                    </Flex>
                </Col>
            </Row>

            <Drawer
                title="Bộ lọc sản phẩm"
                placement="right"
                onClose={() => setIsFilterDrawerOpen(false)}
                open={isFilterDrawerOpen}
                width="100%"
                footer={
                    <Button type="primary" block size="large" onClick={() => setIsFilterDrawerOpen(false)}>
                        Xem kết quả ({total} sản phẩm)
                    </Button>
                }
            >
                <div className="mobile-filter-content">
                    <div className='filterCate'>
                        <Typography.Title level={5}>Danh mục</Typography.Title>
                        <Checkbox.Group
                            options={optionsCategory}
                            value={categoryFilter}
                            onChange={(vals) => {
                                onChangeCategory(vals);
                            }}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className='filterPrice' style={{ marginTop: 24 }}>
                        <Typography.Title level={5}>Khoảng giá</Typography.Title>
                        <Radio.Group
                            onChange={(e) => {
                                onChangePrice(e);
                            }}
                            value={priceFilter}
                        >
                            <Space direction="vertical">
                                <Radio value={'0 - 100000'}>0 - 100.000&nbsp;₫</Radio>
                                <Radio value={'100000 - 300000'}>100.000 - 300.000&nbsp;₫</Radio>
                                <Radio value={'300000 - 500000'}>300.000 - 500.000&nbsp;₫</Radio>
                                <Radio value={'500000 - '}>Trên 500.000&nbsp;₫</Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                </div>
            </Drawer>
        </Flex>

    );
}
export default Shop;