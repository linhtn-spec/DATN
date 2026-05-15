import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Empty, Flex, InputNumber, Pagination, Table, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ACTION_CART, CartContext } from '../../../store/cart';
import Notification from '../../../utils/configToastify';
import "./../style/cart.css";


function Cart() {
    document.title = "Giỏ hàng";
    const navigate = useNavigate();
    const { state, dispatch } = useContext(CartContext)
    const PAGE_SIZE = 6;
    const [cartPage, setCartPage] = useState(1);

    // Helper: normalize quantity to a plain number regardless of backend shape
    const getMaxQty = (qty) => {
        if (qty == null) return 0;
        if (typeof qty === 'object') return Number(qty.inTrade ?? 0);
        return Number(qty);
    };

    // Derived state – no local useState needed
    const products = (state?.currentCart ?? []).map((item, index) => ({
        no: index + 1,
        id: item?.id || item?._id,
        name: item?.name,
        originalPrice: item?.price,
        pricePromotion: item?.pricePromotion,
        price: item?.pricePromotion ? item?.price * (1 - parseFloat(item?.pricePromotion) / 100) : item?.price,
        quantityBuy: Number(item?.quantityBuy ?? 1),
        image: item?.images && item?.images.length > 0 ? item?.images : item?.image,
        maxQuantity: getMaxQty(item?.quantity),
        quantity: item?.quantity,   // keep for dispatch payloads
        unit: item?.unit
    }));

    const minus = (productId) => {
        dispatch({ type: ACTION_CART.MINUS_ITEM, payload: { id: productId } });
    };

    const plus = (productId) => {
        dispatch({ type: ACTION_CART.PLUS_ITEM, payload: { id: productId } });
    };

    const deleteItem = (id) => {
        dispatch({ type: ACTION_CART.DELETE_ITEM, payload: id })
        Notification({ message: "Xóa sản phẩm thành công!", type: "success" })
    }

    const onQuantityChange = (id, value) => {
        if (value === null) return;
        dispatch({ type: ACTION_CART.CHANGE_QUANTITY, payload: { id, quantityBuy: value } });
    };

    const checkout = () => {
        navigate("/client/checkout")
    }

    const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantityBuy, 0);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
            width: 50,
        },
        {
            title: "Hình ảnh",
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
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, row) => <Flex gap={10} align="center">
                {Array.isArray(row.image) ? (
                    <img src={row.image.length > 0 ? row.image[0] : ''} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                    <img src={row.image} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                )}
                <Typography.Text strong>{text}</Typography.Text>
            </Flex>
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'adpricedress',
            width: "150px",
            render: (text, row) => (
                <Flex vertical>
                    <Typography.Text className="promotion" style={{ whiteSpace: 'nowrap' }}>
                        {Number(text).toLocaleString('vi-VN')}&nbsp;₫
                    </Typography.Text>
                    {row.pricePromotion > 0 && (
                        <Typography.Text className="price" style={{ whiteSpace: 'nowrap' }}>
                            {Number(row.originalPrice).toLocaleString('vi-VN')}&nbsp;₫
                        </Typography.Text>
                    )}
                </Flex>
            )
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: "100px",
            align: 'center',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantityBuy',
            key: 'quantityBuy',
            width: "200px",
            align: 'center',
            render: (text, row) =>
                <Flex align='center' justify='center'>
                    <Button icon={<MinusOutlined />} onClick={() => minus(row.id)} />
                    <InputNumber
                        min={1}
                        max={row.maxQuantity}
                        value={text}
                        onChange={(value) => onQuantityChange(row.id, value)}
                        style={{ margin: "0 10px", width: "60px", textAlign: "center" }}
                    />
                    <Button icon={<PlusOutlined />} onClick={() => plus(row.id)} />
                </Flex>
        },
        {
            title: 'Số lượng tối đa',
            dataIndex: 'maxQuantity',
            key: 'maxQuantity',
            hidden: true
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            width: "180px",
            render: (text, row) => (
                <Typography.Text style={{ fontWeight: 600, whiteSpace: 'nowrap', color: '#15803d' }}>
                    {(row.price * row.quantityBuy).toLocaleString('vi-VN')}&nbsp;₫
                </Typography.Text>
            )
        },
        {
            title: '',
            dataIndex: '',
            key: 'x',
            width: 60,
            render: (_text, row) => <Button danger icon={<DeleteOutlined />} onClick={() => deleteItem(row.id)} shape="circle" />,
        },
    ];

    useEffect(() => {
        window.scrollTo(0, 0)
        document.title = "Giỏ hàng"
    }, [])

    return (
        <>
            <div className="cart-container">
                <Breadcrumb
                    items={[
                        { title: <NavLink to={'/client'}>TRANG CHỦ</NavLink> },
                        { title: <NavLink to={'/client/shop'}>CỬA HÀNG</NavLink> },
                        { title: "GIỎ HÀNG" },
                    ]}
                />

                {products.length === 0 ? (
                    <div className="cart-empty">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span>Giỏ hàng của bạn đang trống</span>
                            }
                        >
                            <Button type="primary" onClick={() => navigate('/client/shop')}>
                                Tiếp tục mua sắm
                            </Button>
                        </Empty>
                    </div>
                ) : (
                    <>
                        {/* Desktop: Table */}
                        <div className="cart-table-desktop">
                            <Table
                                bordered
                                rowKey="id"
                                columns={columns}
                                dataSource={products}
                                scroll={{ x: 'max-content' }}
                                pagination={{ hideOnSinglePage: true, pageSize: 6, total: state?.currentCart?.length ?? 0, defaultCurrent: 1, showSizeChanger: false }}
                            />
                        </div>

                        {/* Mobile: Card List */}
                        <div className="cart-list-mobile">
                            {products.slice((cartPage - 1) * PAGE_SIZE, cartPage * PAGE_SIZE).map((row) => (
                                <div key={row.id} className="cart-card-mobile">
                                    <Flex gap={12} align="flex-start" style={{ width: '100%', overflow: 'hidden' }}>
                                        {/* Image */}
                                        <div className="cart-card-img">
                                            <img
                                                src={Array.isArray(row.image) ? row.image[0] : row.image}
                                                alt={row.name}
                                            />
                                        </div>

                                        {/* Info */}
                                        <Flex vertical flex={1} gap={6} style={{ minWidth: 0 }}>
                                            <Typography.Text strong className="cart-card-name">{row.name}</Typography.Text>
                                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>{row.unit}</Typography.Text>

                                            <Flex gap={8} align="center">
                                                <Typography.Text className="cart-card-price promotion">
                                                    {row.price.toLocaleString('vi-VN')}&nbsp;₫
                                                </Typography.Text>
                                                {row.pricePromotion > 0 && (
                                                    <Typography.Text className="price" style={{ fontSize: 12 }}>
                                                        {row.originalPrice.toLocaleString('vi-VN')}&nbsp;₫
                                                    </Typography.Text>
                                                )}
                                            </Flex>

                                            {/* Quantity Controls */}
                                            <Flex align="center" gap={8} style={{ marginTop: 4, flexWrap: 'wrap' }}>
                                                <div className="cart-qty-control" style={{ flexShrink: 0 }}>
                                                    <Button size="small" icon={<MinusOutlined />} onClick={() => minus(row.id)} />
                                                    <InputNumber
                                                        min={1}
                                                        max={row.maxQuantity}
                                                        value={row.quantityBuy}
                                                        onChange={(value) => onQuantityChange(row.id, value)}
                                                        size="small"
                                                        style={{ width: 50, textAlign: 'center', margin: '0 4px' }}
                                                        controls={false}
                                                    />
                                                    <Button size="small" icon={<PlusOutlined />} onClick={() => plus(row.id)} />
                                                </div>

                                                <Typography.Text strong style={{ color: '#15803d', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 'auto' }}>
                                                    {(row.price * row.quantityBuy).toLocaleString('vi-VN')}&nbsp;₫
                                                </Typography.Text>
                                            </Flex>
                                        </Flex>

                                        {/* Delete */}
                                        <Button
                                            danger
                                            shape="circle"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteItem(row.id)}
                                        />
                                    </Flex>
                                </div>
                            ))}
                            {/* Pagination for mobile */}
                            {products.length > PAGE_SIZE && (
                                <Flex justify="center" style={{ paddingTop: 12 }}>
                                    <Pagination
                                        current={cartPage}
                                        total={products.length}
                                        pageSize={PAGE_SIZE}
                                        onChange={(p) => { setCartPage(p); window.scrollTo(0, 0); }}
                                        showSizeChanger={false}
                                        size="small"
                                    />
                                </Flex>
                            )}
                        </div>

                        {/* Total + Checkout – always visible */}
                        <div className="cart-summary">
                            <Flex justify="space-between" align="center" className="cart-total">
                                <Typography.Text strong style={{ fontSize: 16 }}>Tổng cộng:</Typography.Text>
                                <Typography.Text strong style={{ fontSize: 20, color: '#ff2c26' }}>
                                    {totalAmount.toLocaleString('vi-VN')}&nbsp;₫
                                </Typography.Text>
                            </Flex>
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ShoppingCartOutlined />}
                                onClick={checkout}
                                disabled={!state?.currentCart || state?.currentCart?.length < 1}
                                className="cart-checkout-btn"
                            >
                                TIẾN HÀNH THANH TOÁN
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );

}

export default Cart;


