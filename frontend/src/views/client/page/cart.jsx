import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Flex, Table, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ACTION_CART, CartContext } from '../../../store/cart';
import Notification from '../../../utils/configToastify';
import "./../style/cart.css";

function Cart() {
    document.title = "Cart";
    const navigate = useNavigate();
    const { state, dispatch } = useContext(CartContext)
    const [products, setProducts] = useState([])
    const minus = (productId) => {
        const updatedProducts = products.map(product => {
            if (product.id === productId && product.quantityBuy > 1) {
                return { ...product, quantityBuy: product.quantityBuy - 1 };
            }
            return product;
        });

        setProducts(updatedProducts);
        dispatch({ type: ACTION_CART.UPDATE_CART, payload: updatedProducts });

    };

    const plus = (productId, maxQuantity) => {
        const updatedProducts = products.map(product => {
            if (product.id === productId && product.quantityBuy < maxQuantity) {
                return { ...product, quantityBuy: product.quantityBuy + 1 };
            }
            return product;
        });
        setProducts(updatedProducts);
        dispatch({ type: ACTION_CART.UPDATE_CART, payload: updatedProducts });

    };


    const deleteItem = (id) => {
        dispatch({ type: ACTION_CART.DELETE_ITEM, payload: id })
        Notification({ message: "Delete item successfully!", type: "success" })
    }

    useEffect(() => {
        setProducts(state?.currentCart?.map((item, index) => ({
            no: index + 1,
            id: item?.id,
            name: item?.name,
            originalPrice: item?.price,
            pricePromotion: item?.pricePromotion,
            price: item?.pricePromotion ? item?.price * (1 - parseFloat(item?.pricePromotion) / 100) : item?.price,
            quantityBuy: item?.quantityBuy,
            image: item?.images && item?.images.length > 0 ? item?.images : item?.image,
            maxQuantity: item?.quantity
        })))
        return () => {
            setProducts([])
        }
    }, [state, setProducts])

    const checkout = () => {
        navigate("/client/checkout")
    }

    const columns = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: "Image",
            dataIndex: "image",
            key: 'image',
            hidden: true
        },
        {
            title: "ID",
            dataIndex: "id",
            key: 'id',
            hidden: true
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, row) => <Flex gap={10}>
                <Typography.Text>{text}</Typography.Text>
                {Array.isArray(row.image) ? (
                    <img src={row.image.length > 0 ? row.image[0] : ''} width={60} height={60} />
                ) : (
                    <img src={row.image} width={60} height={60} />
                )}
            </Flex>
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'adpricedress',
            width: "150px",
            render: (text, row) => (
                <Flex vertical>
                    <Typography.Text className="promotion">
                        {Number(text).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        })}
                    </Typography.Text>
                    {row.pricePromotion > 0 && (
                        <Typography.Text className="price">
                            {Number(row.originalPrice).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            })}
                        </Typography.Text>
                    )}
                </Flex>
            )
        },
        {
            title: 'Quantity',
            dataIndex: 'quantityBuy',
            key: 'quantityBuy',
            width: "200px",
            align: 'center',
            render: (text, row) =>
                <Flex align='center' justify='center'>
                    <Button icon={<PlusOutlined />} onClick={() => plus(row.id, row.maxQuantity)} />
                    <Typography.Text style={{ margin: "0 20px" }}>{text}</Typography.Text>
                    <Button icon={<MinusOutlined />} onClick={() => minus(row.id)} />
                </Flex>
        },
        {
            title: 'Max quantity',
            dataIndex: 'maxQuantity',
            key: 'maxQuantity',
            hidden: true
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            width: "250px",
            render: (text, row) => (
                <Typography.Text style={{ fontWeight: 600 }}>
                    {(row.price * row.quantityBuy).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    })}
                </Typography.Text>
            )
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (_text, row) => <Flex justify='center' className='delete'>
                <Button icon={<DeleteOutlined />} onClick={() => deleteItem(row.id)} />
            </Flex>,
        },
    ];
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        document.title = "Cart"
    }, [])
    return (
        <Flex className='container cart_page' vertical>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <NavLink to={'/client'}>HOME</NavLink>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <NavLink to={'/client/shop'}>SHOP</NavLink>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Table
                bordered
                columns={columns}
                dataSource={products}
                scroll={{ x: 'max-content' }}
                pagination={{ hideOnSinglePage: true, pageSize: 3, total: state?.currentCart?.length ?? 0, defaultCurrent: 1, showSizeChanger: false }}

            />
            <Flex className='wrap_btn' justify='flex-end'>
                <Button variant='warning' onClick={checkout} disabled={!state?.currentCart || state?.currentCart?.length < 1}>
                    Checkout
                </Button>
            </Flex>
        </Flex>
    );
}

export default Cart; 