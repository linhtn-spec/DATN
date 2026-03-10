import { CloseOutlined, ShoppingOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Checkbox, Empty, Flex, Pagination, Radio, Rate, Select, Space, Tag, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { optionCategory } from "../../../services/category_service";
import { listProduct } from "../../../services/product_service";
import useDebounce from "../../../utils/useDebounce";
import "../style/shop.css";
import { ACTION_CART, CartContext } from "../../../store/cart";
import Notification from "../../../utils/configToastify";
import { UserContext } from "../../../store/user";
import dayjs from "dayjs";

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
            Notification({ message: "Add to cart successully!", type: "success" })
        }
        else {
            Notification({ message: "You have to login first!", type: "error" })

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
        document.title = "Shop";

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
            status: item?.isActive
        })))
        setTotal(rawData?.totalDocs)
        setIsEmpty(false)
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
            <Breadcrumb>
                <Breadcrumb.Item>
                    <NavLink to={'/client'}>HOME</NavLink>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <NavLink to={'/client/shop'}>SHOP</NavLink>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Flex className='products_filter' justify="space-evenly">
                <Flex className="filterCAP">
                    <Flex className='filterCate'>
                        <Typography.Title level={5}>Categories</Typography.Title>
                        <Checkbox.Group options={optionsCategory} value={categoryFilter} onChange={onChangeCategory} />

                    </Flex>
                    <Flex className='filterPrice'>
                        <Typography.Title level={5}>Prices</Typography.Title>
                        <Radio.Group onChange={onChangePrice} value={priceFilter}>
                            <Space direction="vertical">
                                <Radio value={'0 - 100'}>0 - 100$</Radio>
                                <Radio value={'100 - 300'}>100 - 300$</Radio>
                                <Radio value={'300 - 500'}>300 - 500$</Radio>
                                <Radio value={'500 - '}>Over 500$</Radio>
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
                                    {priceFilter !== '500 - ' ? priceFilter : 'Over 500'}$
                                </Tag>
                            )}
                            {(categoryFilter.length !== 0 && priceFilter != '') &&
                                (<Typography.Link onClick={() => {
                                    setCategoryFilter([]), setPriceFilter(''), setIsEmpty(false)

                                }}>
                                    Clear all
                                </Typography.Link>
                                )}
                        </Space>
                        <Select
                            placeholder="Sort"
                            removeIcon={<CloseOutlined />}
                            suffixIcon={<SortAscendingOutlined />}
                            labelInValue
                            allowClear
                            style={{
                                width: 120,
                            }}
                            onChange={handleChange}
                            options={[
                                {
                                    value: 'sortPrice=ascend',
                                    label: 'Price ascending',
                                },
                                {
                                    value: 'sortPrice=descend',
                                    label: 'Price descending',
                                },
                                {
                                    value: 'sortDate=ascend',
                                    label: 'Newer',
                                },
                                {
                                    value: 'sortDate=descend',
                                    label: 'Older',
                                },
                                {
                                    value: 'sortName=ascend',
                                    label: 'Name: A-Z',
                                },
                                {
                                    value: 'sortName=descend',
                                    label: 'Name: Z-A',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex className="products_result d-flex row text-center" gap="16px" vertical>
                        {isEmpty ? <Empty /> :
                            <>
                                <Flex className='result'><h3>Showing <span>1 - {total > 6 ? 6 : total}</span> of {total} results</h3></Flex>
                                <Flex gap={"16px"} wrap="wrap">
                                    {products.map(item => (
                                        <Flex className="shop_item col-4" vertical align="center" key={item?.id}>
                                            <img src={item?.image} alt={item?.name} width={60} style={{ cursor: "pointer" }} height={150} onClick={() => navigate(`/client/product/${item?.id}`)} />
                                            <Typography.Title level={5} ellipsis={true}>{item?.name}</Typography.Title>
                                            <Typography.Text className="discount">
                                                {item?.pricePromotion ? (
                                                    <>
                                                        {parseFloat(item?.price * (1 - parseFloat(item?.pricePromotion) / 100)).toLocaleString('en-US', {
                                                            style: 'currency',
                                                            currency: 'USD', // Adjust currency code as needed
                                                            minimumFractionDigits: 0, // Set minimum decimal places to 0
                                                            maximumFractionDigits: 0,  // Adjust currency code as needed
                                                        })}<span className="price">{item?.price}$</span>
                                                    </>
                                                ) : (
                                                    `$${item?.price}`
                                                )}
                                            </Typography.Text>
                                            <Rate allowHalf disabled defaultValue={item?.stars} />
                                            {!item?.status ? <Button
                                                onClick={() => navigate(`/client/product/${item?.id}`)}
                                            >view detail</Button> :

                                                <Button icon={<ShoppingOutlined />} onClick={() => addToCart(item)}>add to cart</Button>

                                            }
                                        </Flex>
                                    ))}
                                </Flex>
                            </>
                        }
                        <Pagination style={{ textAlign: "center", padding: "70px 0" }} defaultCurrent={1} total={total} pageSize={6} hideOnSinglePage showSizeChanger={false} onChange={setPage}
                        />

                    </Flex>
                </Flex>
            </Flex>
        </Flex>

    );
}
export default Shop;