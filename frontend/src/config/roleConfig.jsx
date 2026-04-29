import {
    AccountBookOutlined,
    CommentOutlined,
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

/**
 * Admin sub-paths blocked per role.
 *
 * Logic: role >= minRole (inherited), so we only need to block paths
 * that the role CANNOT access despite being in /admin.
 *
 * STAFF   (1): Can only access: orders, customers, customer-support, comments
 * MANAGER (2): Can access everything EXCEPT overview (statistics)
 * ADMIN   (3): Can access everything — no blocked paths
 */
export const ROLE_BLOCKED_PATHS = {
    [ROLE.STAFF]: [
        '/admin/product',
        '/admin/consignment',
        '/admin/users',
        '/admin/sales',
        '/admin/category',
        '/admin/banner',
        '/admin/overview',
        '/admin/ratings',
    ],
    [ROLE.MANAGER]: [
        '/admin/overview',
    ],
    [ROLE.ADMIN]: [],
};

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
