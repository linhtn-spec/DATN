import { Layout, Menu, Flex } from 'antd';
import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { notification } from 'antd';
import io from 'socket.io-client';
import { ROLE } from '../../../constants/roles';
import { getNavbarItems } from '../../../config/roleConfig.jsx';
import { UserContext } from '../../../store/user';
import "./../style/navbar.css";

const socket = io(import.meta.env.VITE_SOCKET_ENDPOINT || 'http://localhost:5000', {
    withCredentials: true
});

/**
 * Helper: create an Ant Design Menu item object.
 */
function getItem(label, key, icon, children, type) {
    return { key, icon, children, label, type };
}

/**
 * AdminNavbar — Sidebar navigation for admin panel.
 *
 * IMPORTANT: Menu items per role are defined in `src/config/roleConfig.js`.
 * To add/remove menu items or change which role sees them, edit that file.
 */
function Navbar() {
    const { Sider } = Layout;
    const { state } = useContext(UserContext);
    const userRole = state?.currentUser?.role;
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const [current, setCurrent] = useState('');

    // Listen for new order notifications (all admin roles)
    useEffect(() => {
        if (userRole >= ROLE.STAFF) {
            socket.on('new_order', (data) => {
                notification.info({
                    message: 'Đơn hàng mới!',
                    description: `Đơn từ ${data.customer} — ${data.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
                    placement: 'topRight',
                    duration: 5,
                });
            });
        }
        return () => { socket.off('new_order'); };
    }, [userRole]);

    // Sync active menu key with current URL
    useEffect(() => {
        setCurrent(location.pathname.split('/')[2] ?? '');
        return () => { setCurrent(''); };
    }, [location.pathname]);

    const items = getNavbarItems(userRole, getItem);

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            className="side_bar"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
            }}
        >
            <Flex className="logo" justify="center">
                <NavLink to="/admin">S-cart <span>admin</span></NavLink>
            </Flex>
            <Menu
                mode="inline"
                theme="light"
                items={items}
                selectedKeys={[current]}
            />
        </Sider>
    );
}

export default Navbar;