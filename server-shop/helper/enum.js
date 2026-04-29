/**
 * Role Enum — Numeric role levels matching backend MongoDB `role` field.
 *
 * Hierarchy (higher = more permissions):
 *   CUSTOMER (0) < STAFF (1) < MANAGER (2) < ADMIN (3)
 *
 * Authorization middleware: authRole(minRole) allows access if user.role >= minRole
 *
 * Full permission details: see helper/roleConfig.js
 */
export const Role = {
    /** Khách hàng đã đăng ký */
    CUSTOMER: 0,
    /** Nhân viên — Quản lý đơn hàng, khách hàng, phản hồi, hỗ trợ */
    STAFF: 1,
    /** Quản trị viên — Quản lý sản phẩm, danh mục, người dùng, khuyến mãi */
    MANAGER: 2,
    /** Chủ cửa hàng — Thống kê, quản lý tài khoản Admin */
    ADMIN: 3,
}