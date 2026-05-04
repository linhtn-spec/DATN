/**
 * Role Configuration - Single Source of Truth for Backend Permissions
 *
 * Role hierarchy (higher = more permissions):
 *   CUSTOMER (0) < STAFF (1) < MANAGER (2) < ADMIN (3)
 *
 * Middleware authRole(minRole) uses: user.role >= minRole
 * So setting minRole = STAFF means STAFF, MANAGER, and ADMIN all have access.
 */

/**
 * Role definitions with descriptions and permission labels.
 * Used for documentation and future audit/logging enhancements.
 */
export const ROLE_CONFIG = {
    CUSTOMER: {
        level: 0,
        description: 'Khách hàng đã đăng ký',
        permissions: [
            'place_order',
            'manage_cart',
            'manage_wishlist',
            'send_chat',
            'submit_rating',
            'submit_comment',
            'view_own_orders',
            'update_own_profile',
            'change_own_password',
        ],
    },
    STAFF: {
        level: 1,
        description: 'Nhân viên',
        permissions: [
            // Inherits all CUSTOMER permissions (via role >= 1 check on backend)
            'view_paginated_orders',       // GET /order
            'view_paginated_customers',    // GET /customers
            'edit_comment',               // PUT /comment/:id
            'view_comments',              // GET /comment
            'view_ratings',              // GET /rating, GET /rating/:id
            'access_customer_support',   // GET/POST /chat (via staff portal) — moved from CUSTOMER
        ],
    },
    MANAGER: {
        level: 2,
        description: 'Quản trị viên',
        permissions: [
            // Inherits all STAFF permissions
            'manage_products',           // CRUD /product
            'manage_categories',         // CRUD /category
            'manage_banners',            // CRUD /banner
            'manage_sales',              // CRUD /sale
            'manage_consignment',        // CRUD /consignment
            'manage_users',              // GET /users, POST /users, DELETE /users/:id
            'manage_ratings',            // PUT/GET /rating (QuanLyDanhGia)
            'view_blogs',                // GET /blog
        ],
    },
    ADMIN: {
        level: 3,
        description: 'Chủ cửa hàng',
        permissions: [
            // Inherits all MANAGER permissions
            'view_statistics',           // GET /count_*, /order_per_*, /unsold, /statitics_perday
            'manage_admin_accounts',     // Tạo tài khoản Admin (via /users với role=3)
            'view_audit_logs',           // GET /audit-logs
        ],
    },
}

/**
 * Quick lookup: minimum role level required for a permission category.
 * Used as documentation reference - actual enforcement is in the router files.
 *
 * Route → Required Role mapping:
 * -----------------------------------------
 * PUBLIC         → No auth required
 * CUSTOMER (0)   → /order (POST), /order/:id (GET), /rating (POST), /comment (POST), /cart, /favourite
 * STAFF    (1)   → /order (GET list), /customers (GET), /comment (GET/PUT), /rating (GET), /chat
 * MANAGER  (2)   → /product, /category, /banner, /sale, /consignment (CRUD+DELETE), /users, /rating (PUT)
 * ADMIN    (3)   → /count_*, /order_per_*, /unsold, /statitics_perday, /audit-logs
 * -----------------------------------------
 */
export const ROUTE_PERMISSION_MAP = {
    // Customer routes
    POST_ORDER: 0,
    POST_RATING: 0,
    POST_COMMENT: 0,
    MANAGE_CART: 0,
    MANAGE_WISHLIST: 0,

    // Staff routes
    LIST_ORDERS: 1,
    LIST_CUSTOMERS: 1,
    LIST_COMMENTS: 1,
    UPDATE_COMMENT: 1,
    LIST_RATINGS: 1,

    // Manager routes
    MANAGE_PRODUCTS: 2,
    MANAGE_CATEGORIES: 2,
    MANAGE_BANNERS: 2,
    MANAGE_SALES: 2,
    MANAGE_CONSIGNMENT: 2,
    MANAGE_USERS: 2,
    UPDATE_RATING: 2,

    // Admin routes
    VIEW_STATISTICS: 3,
    VIEW_AUDIT_LOGS: 3,
    MANAGE_ADMIN_ACCOUNTS: 3,
}
