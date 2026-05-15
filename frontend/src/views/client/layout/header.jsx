import { CloseOutlined, MenuOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Flex } from "antd";
import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { optionCategory } from "../../../services/category_service";
import { getFavourite } from "../../../services/favourite_service";
import { logout, logoutGoogle } from "../../../services/user_service";
import { ACTION_CART, CartContext } from "../../../store/cart";
import { ACTION_FAVOURITE, FavouriteContext } from "../../../store/favourite";
import { ACTION_ORDER } from "../../../store/order";
import { OrderContext } from "../../../store/order/provider";
import { ACTION_LOG } from "../../../store/typeLog";
import { LogContext } from "../../../store/typeLog/provider";
import { ACTION_USER, UserContext } from "../../../store/user";
import Notification from "../../../utils/configToastify";
import "./../style/header.css";
import Modal_Search from "./modal_search";

function Headers() {
    const [searchView, setSearchView] = useState(false);
    const [category, setCategory] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logGoogle = useContext(LogContext)
    const user = useContext(UserContext)
    const cart = useContext(CartContext)
    const order = useContext(OrderContext)
    const favourite = useContext(FavouriteContext)

    const [fetched, setFetched] = useState(true)
    const navigate = useNavigate()
    const getFavouriteNow = useQuery({
        queryKey: ['favourite'],
        queryFn: () => getFavourite(),
        refetchOnWindowFocus: false,
        enabled: fetched || !!user?.state?.currentUser
    })
    useEffect(() => {
        if (!getFavouriteNow?.isSuccess) return
        else {
            setFetched(false)
            const rawData = getFavouriteNow?.data?.data?.products
            const mappedData = rawData?.map(item => ({
                ...item,
                id: item._id
            }))
            favourite.dispatch({ type: ACTION_FAVOURITE.FETCH_FAVOURITE, payload: mappedData })
        }
    }, [getFavouriteNow?.isSuccess, getFavouriteNow?.data])


    const handleCart = () => {
        if (!user?.state?.currentUser) Notification({ message: "Bạn cần đăng nhập trước!", type: "error" })
        else
            navigate("/client/cart")
    }

    const toggleSearchView = () => {
        setSearchView(!searchView);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const { mutate } = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            Notification({ message: "Đăng xuất thành công!", type: "success" });
            user?.dispatch({ type: ACTION_USER.LOGOUT })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })

    const outGoogle = useMutation({
        mutationKey: ['logout_google'],
        mutationFn: () => logoutGoogle(),
        onSuccess: () => {
            Notification({ message: "Đăng xuất thành công!", type: "success" });
            user?.dispatch({ type: ACTION_USER.LOGOUT })
            logGoogle.dispatch({ type: ACTION_LOG.OUT })
        },
        onError: (error) => {
            Notification({ message: error?.response?.data, type: "error" })
        }
    })
    const handleLogout = () => {
        if (logGoogle?.state?.isLogByGoogle) {
            outGoogle.mutate()
        }
        else {
            mutate()
        }
        order?.dispatch({ type: ACTION_ORDER.REMOVE_ORDER })
        cart?.dispatch({ type: ACTION_CART.CLEAR_CART_LOCAL })
        favourite?.dispatch({ type: ACTION_FAVOURITE.REMOVE_FAVOURITE })
        closeMobileMenu()
    }

    const { data, isError } = useQuery({
        queryKey: ['category_list_client'],
        queryFn: () => optionCategory()
    })

    useEffect(() => {
        if (isError) return
        const rawData = data?.data?.data
        setCategory(rawData?.map((item) => ({
            name: item.name,
            id: item._id,
            order: item?.order,
            status: item?.isActive
        })));
        return () => {
            setCategory([])
        }
    }, [setCategory, isError, data])

    const sortedCategories = category?.filter(item => item?.status)?.sort((a, b) => a.order - b.order);
    const isLoggedIn = user?.state?.currentUser != null && user?.state?.currentUser !== undefined;

    return (
        <>
            {!searchView && (
                <header>
                    <Flex style={{ height: "100%" }} justify="space-between" align="center">
                        {/* Logo */}
                        <Flex className="header-logo" align="center">
                            <Link to={"home"} className="icon">
                                <img src="/data/logo/scart-mid.png" alt="logo" width={120} height={60} />
                            </Link>
                        </Flex>

                        {/* Desktop Nav Links */}
                        <Flex className="header-link" justify="space-between">
                            <Link to={"home"}>Trang chủ</Link>
                            <div className="main_menu">
                                <div className="categories">Danh mục</div>
                                <div className="sub_menu">
                                    {sortedCategories?.map((item) => (
                                        <NavLink key={item.id} to={`/client/category/${item.id}`}>{item.name}</NavLink>
                                    ))}
                                </div>
                            </div>
                            <Link to={"sale"}>Flash Sale</Link>
                            <Link to={"blog"}>Bài viết</Link>
                            <Link to={"shop"}>Cửa hàng</Link>
                        </Flex>

                        {/* Desktop Icons (right side) */}
                        <div className="header-icon">
                            <div>
                                <button onClick={toggleSearchView}><SearchOutlined style={{ fontSize: '18px', cursor: "pointer" }} /></button>
                            </div>
                            <div>
                                <button className="cart" onClick={handleCart}><ShoppingCartOutlined style={{ fontSize: '18px' }} /></button>
                                <div className="qty">{cart?.state?.currentCart?.length ?? 0}</div>
                            </div>
                            <>
                                <div className="main_menu">
                                    <UserOutlined style={{ fontSize: '18px', cursor: "pointer" }} />
                                    <div className="user">
                                        {isLoggedIn ? (<>
                                            <Link to={'user'}>Thông tin tài khoản</Link>
                                            <Link to={'user/change-password'}>Đổi mật khẩu</Link>
                                            <Link to={'user/wishlist'}>Yêu thích</Link>
                                            <Link to={'user/orders'}>Đơn hàng</Link>
                                            <Link onClick={handleLogout}>Đăng xuất</Link>
                                        </>) : (
                                            <>
                                                <Link to={'/'}>Đăng nhập</Link>
                                                <Link to={'/register'}>Đăng ký</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>

                            {/* Mobile Hamburger Button */}
                            <button
                                className="mobile-menu-btn"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Mở menu"
                            >
                                <MenuOutlined style={{ fontSize: '22px' }} />
                            </button>
                        </div>
                    </Flex>

                    {/* Mobile Drawer Overlay + Drawer — only rendered when open */}
                    {mobileMenuOpen && (
                        <>
                            <div className="mobile-overlay" onClick={closeMobileMenu} />

                            <nav className="mobile-drawer open">
                                <div className="mobile-drawer-header">
                                    <img src="/data/logo/scart-mid.png" alt="logo" height={40} />
                                    <button className="mobile-close-btn" onClick={closeMobileMenu}>
                                        <CloseOutlined style={{ fontSize: '20px' }} />
                                    </button>
                                </div>

                                <div className="mobile-nav-links">
                                    <NavLink to={"home"} onClick={closeMobileMenu}>Trang chủ</NavLink>
                                    <NavLink to={"sale"} onClick={closeMobileMenu}>Flash Sale</NavLink>
                                    <NavLink to={"blog"} onClick={closeMobileMenu}>Bài viết</NavLink>
                                    <NavLink to={"shop"} onClick={closeMobileMenu}>Cửa hàng</NavLink>

                                    {sortedCategories?.length > 0 && (
                                        <div className="mobile-category-section">
                                            <span className="mobile-section-label">Danh mục</span>
                                            {sortedCategories.map((item) => (
                                                <NavLink key={item.id} to={`/client/category/${item.id}`} onClick={closeMobileMenu}>
                                                    {item.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mobile-divider" />

                                    {isLoggedIn ? (<>
                                        <NavLink to={'user'} onClick={closeMobileMenu}>
                                            <UserOutlined /> &nbsp;Thông tin tài khoản
                                        </NavLink>
                                        <NavLink to={'user/change-password'} onClick={closeMobileMenu}>Đổi mật khẩu</NavLink>
                                        <NavLink to={'user/wishlist'} onClick={closeMobileMenu}>Yêu thích</NavLink>
                                        <NavLink to={'user/orders'} onClick={closeMobileMenu}>Đơn hàng</NavLink>
                                        <button className="mobile-logout-btn" onClick={handleLogout}>Đăng xuất</button>
                                    </>) : (
                                        <div className="mobile-auth-btns">
                                            <NavLink to={'/'} className="mobile-login-btn" onClick={closeMobileMenu}>Đăng nhập</NavLink>
                                            <NavLink to={'/register'} className="mobile-register-btn" onClick={closeMobileMenu}>Đăng ký</NavLink>
                                        </div>
                                    )}
                                </div>
                            </nav>
                        </>
                    )}
                </header>
            )}
            {searchView && <Modal_Search onClose={toggleSearchView} />}
        </>
    );
}

export default Headers;