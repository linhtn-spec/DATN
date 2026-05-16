import { LoginOutlined, ProductOutlined, ShoppingCartOutlined, TagOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, Flex, Image, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from 'recharts';
import { orderStatusOptions, paymentStatusOptions, shippingStatusOptions } from '../../../constants/orderOptions';
import { detailCategory } from '../../../services/category_service';
import { count_order, count_product_category, count_statitics, order_per_day, order_per_month, statiticsPerday, unsold } from '../../../services/statitics_service';
import { getLabelByValue } from '../../../utils/getLabelByValue';
import { transformData } from '../../../utils/megreArray';
import './OverviewAdmin.css';

const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911'];

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

const customTooltipOnYourLine = (e) => {
    if (e.active && e.payload != null && e.payload[0] != null) {
        return (<div className="custom-tooltip">
            <p>Ngày: {e.payload[0].payload["date"]}</p>
            <p>Doanh thu: {e.payload[0].payload["revenue"]?.toLocaleString('vi-VN')} ₫</p>
        </div>);
    }
    else {
        return "";
    }
}
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload; // Dữ liệu của điểm trên biểu đồ
        return (
            <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
                <p>Ngày: {data.date}</p>
                <p>Doanh thu: {data.revenue?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            </div>
        );
    }

    return null;
};
export const Overview = () => {
    const [state, setState] = useState({ activeIndex: 0 })
    const onPieEnter = (_, index) => {
        setState({
            activeIndex: index,
        });
    };
    const [perMonth, setPerMonth] = useState([])
    const [perDay, setPerDay] = useState([])
    const [info, setInfo] = useState({})
    const [currentCategoryId, setCurrentCategoryId] = useState('')
    const [products, setProducts] = useState(0)
    const [categories, setCategories] = useState(0)
    const [orders, setOrders] = useState(0)
    const [customers, setCustomers] = useState(0)

    const [productCategory, setProductCategory] = useState([])
    const [orderByShippingStatus, setOrderByShippingStatus] = useState([])
    const [orderByPaymentStatus, setOrderByPaymentStatus] = useState([])
    const [orderByOrderStatus, setOrderByOrderStatus] = useState([])
    const [unsoldProduct, setUnsoldProduct] = useState([])

    const [statsPerday, setStatsPerday] = useState({})

    const navigate = useNavigate()

    const queryProductCategory = useQuery({
        queryKey: ['product_category_statitics'],
        queryFn: () => count_product_category()
    })

    const queryOrder = useQuery({
        queryKey: ['order_statitics'],
        queryFn: () => count_order()
    })


    useEffect(() => {
        if (productCategory.length === 0) return
        setCurrentCategoryId(productCategory[state.activeIndex]?.categoryId);
        return () => {
            setCurrentCategoryId('')
        }
    }, [state, productCategory])

    const queryStatitics = useQuery({
        queryKey: ['total_statitics'],
        queryFn: () => count_statitics()
    })

    const queryStatiticsPerday = useQuery({
        queryKey: ['statitics_per_day'],
        queryFn: () => statiticsPerday()
    })


    const orderPerMonth = useQuery({
        queryKey: ['order_per_month'],
        queryFn: () => order_per_month()
    })

    const orderPerDay = useQuery({
        queryKey: ['order_per_day'],
        queryFn: () => order_per_day()
    })

    const unSold = useQuery({
        queryKey: ['unsold'],
        queryFn: () => unsold()
    })

    const detailCategoryOverview = useQuery({
        queryKey: ['detail_category', currentCategoryId],
        queryFn: () => detailCategory(currentCategoryId),
        enabled: !!currentCategoryId
    })

    useEffect(() => {
        if (!detailCategoryOverview?.isSuccess) return
        const rawData = detailCategoryOverview?.data?.data
        setInfo(rawData)
        return () => {
            setInfo({})
        }
    }, [detailCategoryOverview?.isSuccess, detailCategoryOverview?.data])

    useEffect(() => {
        if (!queryStatiticsPerday?.isSuccess) return
        const rawData = queryStatiticsPerday?.data?.data
        setStatsPerday(rawData)
        return () => {
            setInfo({})
        }
    }, [queryStatiticsPerday?.isSuccess, queryStatiticsPerday?.data])



    useEffect(() => {
        if (!unSold?.isSuccess) return
        const rawData = unSold?.data?.data
        setUnsoldProduct(rawData?.map(item => ({
            name: item?.name,
            quantity: item?.quantity?.inTrade,


        })))
        return () => {
            setUnsoldProduct({})
        }
    }, [unSold?.isSuccess, unSold?.data])


    useEffect(() => {
        if (!orderPerDay?.isSuccess) return
        const rawData = orderPerDay?.data?.data
        setPerDay(rawData?.map((item) => ({
            date: item?.date,
            revenue: item?.totalRevenue
        })))
        return () => {
            setPerDay([])
        }
    }, [orderPerDay?.isSuccess, orderPerDay?.data])

    useEffect(() => {
        if (!orderPerMonth?.isSuccess) return
        const rawData = orderPerMonth?.data?.data
        setPerMonth(rawData?.map((item, index) => ({
            index: index,
            Orders: item?.totalOrders,
            month: item?.month,
            Revenue: item?.totalRevenue
        })))
        return () => {
            setPerMonth([])
        }
    }, [orderPerMonth?.isSuccess, orderPerMonth?.data])

    useEffect(() => {
        if (!queryStatitics?.isSuccess) return
        const rawData = queryStatitics?.data?.data
        setCustomers(rawData?.countCustomer)
        setOrders(rawData?.countTotalOrder)
        setCategories(rawData?.countCategory)
        setProducts(rawData?.countProduct)
        return () => {
            setOrders(0)
            setCustomers(0)
            setCategories(0)
            setProducts(0)
        }
    }, [queryStatitics?.isSuccess, queryStatitics?.data])


    useEffect(() => {
        if (!queryProductCategory?.isSuccess) return
        const rawData = queryProductCategory?.data?.data?.countProductInEachCategory
        setProductCategory(
            rawData.map((item, index) => ({
                categoryId: item?.categoryIds[0],
                name: item?.categoryName,
                value: item?.totalCount,
                fill: CHART_COLORS[index % CHART_COLORS.length]
            }))
        )
        return () => {
            setProductCategory([])
        }
    }, [queryProductCategory?.isSuccess, queryProductCategory?.data])


    useEffect(() => {
        if (!queryOrder?.isSuccess) return
        const rawData = queryOrder?.data?.data
        setOrderByShippingStatus(
            rawData?.countOrderByShippingStatus.map((item, index) => ({
                name: getLabelByValue(item?._id, shippingStatusOptions),
                value: item?.totalCount,
                fill: CHART_COLORS[index % CHART_COLORS.length]

            }))
        )

        setOrderByPaymentStatus(
            rawData?.countOrderByPaymentStatus.map((item, index) => ({
                name: getLabelByValue(item?._id, paymentStatusOptions),
                value: item?.totalCount,
                fill: CHART_COLORS[(index + 2) % CHART_COLORS.length]

            }))
        )

        setOrderByOrderStatus(
            rawData?.countOrderByOrderStatus.map((item, index) => ({
                name: getLabelByValue(item?._id, orderStatusOptions),
                value: item?.totalCount,
                fill: CHART_COLORS[(index + 4) % CHART_COLORS.length]

            }))
        )
        return () => {
            setOrderByShippingStatus([])
            setOrderByPaymentStatus([])
            setOrderByOrderStatus([])
        }
    }, [queryOrder?.isSuccess, queryOrder?.data])
    useEffect(() => {
        document.title = "Tổng quan"
    }, [])

    return (
        <Flex vertical className='overview' gap="24px">
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <div className='glass-stat-card card'>
                        <div className='card_item green'>
                            <ProductOutlined />
                        </div>
                        <Card.Meta title="Tổng sản phẩm" description={
                            <Flex vertical gap={4}>
                                <Typography.Text className="stat-number">{products}</Typography.Text>
                                <Button type='link' onClick={() => navigate('/admin/product')} icon={<LoginOutlined />}>Xem chi tiết</Button>
                            </Flex>
                        } />
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className='glass-stat-card card'>
                        <div className='card_item blue'>
                            <TagOutlined />
                        </div>
                        <Card.Meta title="Tổng danh mục" description={
                            <Flex vertical gap={4}>
                                <Typography.Text className="stat-number">{categories}</Typography.Text>
                                <Button type='link' onClick={() => navigate('/admin/category')} icon={<LoginOutlined />}>Xem chi tiết</Button>
                            </Flex>
                        } />
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className='glass-stat-card card'>
                        <div className='card_item yellow'>
                            <ShoppingCartOutlined />
                        </div>
                        <Card.Meta title="Tổng đơn hàng" description={
                            <Flex vertical gap={4}>
                                <Typography.Text className="stat-number">{orders}</Typography.Text>
                                <Button type='link' onClick={() => navigate('/admin/orders')} icon={<LoginOutlined />}>Xem chi tiết</Button>
                            </Flex>
                        } />
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className='glass-stat-card card'>
                        <div className='card_item red'>
                            <UsergroupDeleteOutlined />
                        </div>
                        <Card.Meta title="Tổng khách hàng" description={
                            <Flex vertical gap={4}>
                                <Typography.Text className="stat-number">{customers}</Typography.Text>
                                <Button type='link' onClick={() => navigate('/admin/customers')} icon={<LoginOutlined />}>Xem chi tiết</Button>
                            </Flex>
                        } />
                    </div>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={12}>
                    <Card title="Phân phối sản phẩm theo danh mục" className="glass-chart-card">
                        <Row align="middle" gutter={[24, 24]}>
                            <Col span={24} md={12}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Tooltip formatter={(value, name, props) => {
                                            const total = productCategory.reduce((sum, item) => sum + item.value, 0);
                                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            return [`${value} (Tỷ lệ ${percent}%)`, name];
                                        }} />
                                        <Pie
                                            activeIndex={state.activeIndex}
                                            data={productCategory}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            innerRadius={75}
                                            outerRadius={105}
                                            fill="#8884d8"
                                            activeShape={renderActiveShape}
                                            onMouseEnter={onPieEnter}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Col>
                            <Col span={24} md={12}>
                                {currentCategoryId && (
                                    <Card hoverable className="category-preview-card"
                                        cover={<Image src={info?.image} preview={false} onClick={() => navigate(`/admin/category/${currentCategoryId}`)} />}
                                    >
                                        <Card.Meta title={info?.name} description={info?.description} />
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} xl={12}>
                    <Card title="Đơn hàng" className="glass-chart-card">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Flex vertical align='center' gap={8}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Tooltip />
                                            <Pie
                                                data={orderByShippingStatus}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%" cy="50%"
                                                outerRadius={70} fill="#8884d8" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Typography.Title level={5} style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>Theo giao hàng</Typography.Title>
                                </Flex>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Flex vertical align='center' gap={8}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Tooltip />
                                            <Pie
                                                data={orderByPaymentStatus}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%" cy="50%"
                                                outerRadius={70} fill="#8884d8" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Typography.Title level={5} style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>Theo thanh toán</Typography.Title>
                                </Flex>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Flex vertical align='center' gap={8}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Tooltip />
                                            <Pie
                                                data={orderByOrderStatus}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%" cy="50%"
                                                outerRadius={70} fill="#8884d8" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Typography.Title level={5} style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>Theo trạng thái đơn</Typography.Title>
                                </Flex>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title="Số lượng sản phẩm chưa bán được" className="glass-chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={unsoldProduct} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[5, "dataMax + 5"]} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Bar dataKey="quantity" name="Số lượng" fill="#1890ff" radius={[4, 4, 0, 0]} />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="Đơn hàng trong tháng" className="glass-chart-card inMonth">
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={perDay} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                                <Bar dataKey="revenue" name="Doanh thu" barSize={12} fill="#413ea0" yAxisId="left" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#ff7300" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} yAxisId="left" />
                                <YAxis orientation="left" yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} domain={[5, "dataMax + 5"]} tickCount={5} width={80} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Đơn hàng trong năm" className="glass-chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={perMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis orientation="right" yAxisId="right" tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} domain={[5, "dataMax +5000"]} tickCount={5} width={80} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <Legend />
                                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                                <Bar dataKey="Orders" name="Số đơn hàng" barSize={12} fill="#13c2c2" yAxisId="left" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="Revenue" name="Doanh thu" stroke="#faad14" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} yAxisId="right" />
                                <YAxis orientation="left" yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} domain={[5, "dataMax + 5"]} tickCount={5} width={40} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title="Thống kê thêm mới mỗi ngày" className="glass-chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={transformData(statsPerday)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Date" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Category" name="Danh mục" stroke="#722ed1" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="Product" name="Sản phẩm" stroke="#52c41a" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="Order" name="Đơn hàng" stroke="#f5222d" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="Customer" name="Khách hàng" stroke="#faad14" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </Flex>
    )
}
