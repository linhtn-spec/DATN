import {
    AccountBookOutlined,
    CommentOutlined,
    FileTextOutlined,
    FileZipOutlined,
    FolderOpenOutlined,
    FolderOutlined,
    HomeOutlined,
    MessageOutlined,
    PercentageOutlined,
    PictureOutlined,
    PieChartOutlined,
    ProjectOutlined,
    StarOutlined,
    UserOutlined,
    UsergroupDeleteOutlined,
} from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import { ROLE } from '../constants/roles';

// ---------------------------------------------------------------------------
// Role-Based Access Control — Single Source of Truth for Frontend
//
// To change permissions for a role, edit ONLY this file.
// ProtectRoute.jsx and navbar.jsx import from here.
// ---------------------------------------------------------------------------

/**
 * Default landing page per role after login.
 */
export const ROLE_HOME_PATH = {
    [ROLE.CUSTOMER]: '/client',
    [ROLE.STAFF]: '/admin',
    [ROLE.MANAGER]: '/admin',
    [ROLE.ADMIN]: '/admin',
};

/**
 * Paths that require the user to be logged in (even as Customer).
 */
export const AUTH_REQUIRED_PATHS = [
    '/client/cart',
    '/client/checkout',
    '/client/checkout/confirm',
    '/client/checkout/success',
    '/client/user',
];

/**
 * Paths accessible without logging in.
 */
export const PUBLIC_PATHS = [
    '/client',
    '/register',
    '/forget-password',
    '/change-password',
    '/',
];

// Blocked paths configuration removed — protection is now handled declaratively by RoleRoute in route.jsx

/**
 * Returns the sidebar navigation items for a given role.
 * Items follow role inheritance: higher roles see everything lower roles see.
 *
 * @param {number} userRole - The current user's role number
 * @param {Function} getItem - Helper to create a menu item object
 * @returns {Array} Filtered list of menu items for the role
 */
export const getNavbarItems = (userRole, getItem) => [
    // ── Owner (ADMIN = 3) only ────────────────────────────────────
    userRole >= ROLE.ADMIN && getItem(
        <NavLink to="overview">Overview</NavLink>,
        'overview',
        <PieChartOutlined />
    ),

    // ── Manager (MANAGER = 2) and above ────────────────────────────
    userRole >= ROLE.MANAGER && getItem(
        'Product & Category',
        'products-group',
        <FolderOpenOutlined />,
        [
            getItem(<NavLink to="category">Category</NavLink>, 'category', <FolderOutlined />),
            getItem(<NavLink to="product">Product</NavLink>, 'product', <FileZipOutlined />),
        ]
    ),
    userRole >= ROLE.MANAGER && getItem(
        <NavLink to="banner">Banner</NavLink>,
        'banner',
        <PictureOutlined />
    ),
    userRole >= ROLE.MANAGER && getItem(
        <NavLink to="sales">Promotions</NavLink>,
        'sales',
        <PercentageOutlined />
    ),
    userRole >= ROLE.MANAGER && getItem(
        <NavLink to="consignment">Consignment</NavLink>,
        'consignment',
        <HomeOutlined />
    ),
    userRole >= ROLE.MANAGER && getItem(
        <NavLink to="users">Users</NavLink>,
        'users',
        <ProjectOutlined />
    ),
    userRole >= ROLE.MANAGER && getItem(
        <NavLink to="ratings">Ratings</NavLink>,
        'ratings',
        <StarOutlined />
    ),
    userRole >= ROLE.MANAGER && getItem(
        <NavLink to="blog">Blog</NavLink>,
        'blog',
        <FileTextOutlined />
    ),

    // ── Staff (STAFF = 1) and above ──────────────────────────────────
    userRole >= ROLE.STAFF && getItem(
        'Order & Customer',
        'orders-group',
        <UsergroupDeleteOutlined />,
        [
            getItem(<NavLink to="orders">Order</NavLink>, 'orders', <AccountBookOutlined />),
            getItem(<NavLink to="customers">Customer</NavLink>, 'customers', <UserOutlined />),
        ]
    ),
    userRole >= ROLE.STAFF && getItem(
        <NavLink to="customer-support">Customer Support</NavLink>,
        'customer-support',
        <MessageOutlined />
    ),
    userRole >= ROLE.STAFF && getItem(
        <NavLink to="comments">Feedback/Comments</NavLink>,
        'comments',
        <CommentOutlined />
    ),
].filter(Boolean);
