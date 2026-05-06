import { CloseOutlined, ShoppingOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Checkbox, Empty, Flex, Pagination, Radio, Rate, Select, Skeleton, Space, Tag, Typography } from "antd";
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
            />
            <Flex className='products_filter' justify="space-evenly" wrap="wrap">
                <Flex className="filterCAP">
                    <Flex className='filterCate'>
                        <Typography.Title level={5}>Danh mục</Typography.Title>
                        <Checkbox.Group options={optionsCategory} value={categoryFilter} onChange={onChangeCategory} />

                    </Flex>
                    <Flex className='filterPrice'>
                        <Typography.Title level={5}>Khoảng giá</Typography.Title>
                        <Radio.Group onChange={onChangePrice} value={priceFilter}>
                            <Space direction="vertical">
                                <Radio value={'0 - 100000'}>0 - 100.000&nbsp;₫</Radio>
                                <Radio value={'100000 - 300000'}>100.000 - 300.000&nbsp;₫</Radio>
                                <Radio value={'300000 - 500000'}>300.000 - 500.000&nbsp;₫</Radio>
                                <Radio value={'500000 - '}>Trên 500.000&nbsp;₫</Radio>
                            </Space>
                        </Radio.Group>
                    </Flex>
                </Flex>
                <Flex className="products_cate d-flex flex-column" vertical>
                    <Flex justify='space-between' align="center" style={{ marginBottom: "10px" }}>
                        <Space className="filter_tag" >
                            {categoryFilter.length !== 0 && (
                                <Tag
                                    closable
                                    onClose={() => setCategoryFilter([])}
                                    style={{
                                        textWrap: "wrap",
                                        maxWidth: "300px"
                                    }}
                                >
                                    {getCategoryLabels(categoryFilter, optionsCategory).join(', ')}
                                </Tag>
                            )}
                            {priceFilter && (
                                <Tag closable onClose={() => setPriceFilter('')}>
                                    {priceFilter !== '500000 - ' ? priceFilter.replace(' - ', ' - ') + '\u00A0₫' : 'Trên 500.000\u00A0₫'}
                                </Tag>
                            )}
                            {(categoryFilter.length !== 0 && priceFilter != '') &&
                                (<Typography.Link onClick={() => {
                                    setCategoryFilter([]), setPriceFilter(''), setIsEmpty(false)

                                }}>
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
                            style={{
                                width: 150,
                            }}
                            onChange={handleChange}
                            options={[
                                {
                                    value: 'sortPrice=ascend',
                                    label: 'Giá tăng dần',
                                },
                                {
                                    value: 'sortPrice=descend',
                                    label: 'Giá giảm dần',
                                },
                                {
                                    value: 'sortDate=ascend',
                                    label: 'Mới nhất',
                                },
                                {
                                    value: 'sortDate=descend',
                                    label: 'Cũ nhất',
                                },
                                {
                                    value: 'sortName=ascend',
                                    label: 'Tên: A-Z',
                                },
                                {
                                    value: 'sortName=descend',
                                    label: 'Tên: Z-A',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex className="products_result d-flex row text-center" gap="16px" vertical>
                        {productShop.isFetching ? (
                            <Flex gap={"16px"} wrap="wrap">
                                {[...Array(6)].map((_, index) => (
                                    <Flex className="shop_item col-4" vertical align="center" key={index} style={{ padding: '20px' }}>
                                        <Skeleton.Image active style={{ width: 150, height: 150, marginBottom: 10 }} />
                                        <Skeleton active paragraph={{ rows: 2 }} />
                                    </Flex>
                                ))}
                            </Flex>
                        ) : isEmpty ? (
                            <Empty />
                        ) : (
                            <>
                                <Flex className='result'>
                                    <h3>Hiển thị <span>{total !== 0 ? (page - 1) * 6 + 1 : 0} - {Math.min(page * 6, total)}</span> trong số {total} kết quả</h3>
                                </Flex>
                                <Flex gap={"16px"} wrap="wrap">
                                    {products.map(item => (
                                        <Flex className="shop_item col-4" vertical align="center" key={item?.id}>
                                            <img src={item?.image} alt={item?.name} width={60} style={{ cursor: "pointer" }} height={150} onClick={() => navigate(`/client/product/${item?.id}`)} />
                                            <Typography.Title level={5} ellipsis={true}>{item?.name}</Typography.Title>
                                            <Typography.Text className="price_promo">
                                                {Number(item?.pricePromotion) > 0 ? (
                                                    <Flex gap={8} align="center" justify="center" style={{ whiteSpace: 'nowrap' }}>
                                                        <span className="promotion">
                                                            {(item.price * (1 - Number(item?.pricePromotion) / 100)).toLocaleString('vi-VN')}&nbsp;₫
                                                        </span>
                                                        <span className="price">
                                                            {item.price?.toLocaleString('vi-VN')}&nbsp;₫
                                                        </span>
                                                    </Flex>
                                                ) : (
                                                    <span className="promotion" style={{ whiteSpace: 'nowrap' }}>
                                                        {item.price?.toLocaleString('vi-VN')}&nbsp;₫
                                                    </span>
                                                )}
                                            </Typography.Text>
                                            <Rate allowHalf disabled defaultValue={item?.stars} />
                                            {!item?.status ? (
                                                <Button onClick={() => navigate(`/client/product/${item?.id}`)}>xem chi tiết</Button>
                                            ) : (
                                                <Button icon={<ShoppingOutlined />} disabled={item?.quantity === 0} onClick={() => addToCart(item)}>thêm vào giỏ hàng</Button>
                                            )}
                                        </Flex>
                                    ))}
                                </Flex>
                            </>
                        )}
                        <Pagination
                            style={{ textAlign: "center", padding: "70px 0" }}
                            defaultCurrent={1}
                            total={total}
                            pageSize={6}
                            hideOnSinglePage
                            showSizeChanger={false}
                            onChange={(p) => {
                                setPage(p);
                                window.scrollTo(0, 0);
                            }}
                        />
                    </Flex>
                </Flex>
            </Flex>
        </Flex>

    );
}
export default Shop;