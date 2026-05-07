import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Flex, InputNumber, Table, Typography } from 'antd';
import { useContext, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ACTION_CART, CartContext } from '../../../store/cart';
import Notification from '../../../utils/configToastify';
import "./../style/cart.css";


function Cart() {
    document.title = "Giỏ hàng";
    const navigate = useNavigate();
    const { state, dispatch } = useContext(CartContext)

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

    const columns = [
        {
            title: 'STT',
            dataIndex: 'no',
            key: 'no',
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
                <Flex align='center' justify='center' vertical>
                    <Flex align='center' justify='center'>
                        <Button icon={<PlusOutlined />} onClick={() => plus(row.id)} />
                        <InputNumber
                            min={1}
                            max={row.maxQuantity}
                            value={text}
                            onChange={(value) => onQuantityChange(row.id, value)}
                            style={{ margin: "0 10px", width: "60px", textAlign: "center" }}
                        />
                        <Button icon={<MinusOutlined />} onClick={() => minus(row.id)} />
                    </Flex>

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
            width: "250px",
            render: (text, row) => (
                <Typography.Text style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {(row.price * row.quantityBuy).toLocaleString('vi-VN')}&nbsp;₫
                </Typography.Text>
            )
        },
        {
            title: 'Hành động',
            dataIndex: '',
            key: 'x',
            render: (_text, row) => <Flex justify='center' className='delete'>
                <Button icon={<DeleteOutlined />} onClick={() => deleteItem(row.id)} />
            </Flex>,
        },
    ];
    useEffect(() => {
        window.scrollTo(0, 0)
        document.title = "Giỏ hàng"
    }, [])

    return (
        <>
            <Flex className='category_page' vertical>
                <Breadcrumb
                    items={[
                        {
                            title: <NavLink to={'/client'}>TRANG CHỦ</NavLink>,
                        },
                        {
                            title: <NavLink to={'/client/shop'}>CỬA HÀNG</NavLink>,
                        },
                        {
                            title: "GIỎ HÀNG",
                        },
                    ]}
                />
                <Table
                    bordered
                    rowKey="id"
                    columns={columns}
                    dataSource={products}
                    scroll={{ x: 'max-content' }}
                    pagination={{ hideOnSinglePage: true, pageSize: 6, total: state?.currentCart?.length ?? 0, defaultCurrent: 1, showSizeChanger: false }}

                />
                <Flex className='wrap_btn' justify='flex-end' style={{ marginTop: '20px' }}>
                    <Button variant='warning' onClick={checkout} disabled={!state?.currentCart || state?.currentCart?.length < 1}>
                        TIẾN HÀNH THANH TOÁN
                    </Button>
                </Flex>
            </Flex>
        </>
    );

}

export default Cart; 