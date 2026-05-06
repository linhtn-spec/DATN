import { Router } from "express";
import { checkAuth, authRole } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";

const rootRouter = Router();

const publicRouter = Router();
const customerRouter = Router();
const staffRouter = Router();
const managerRouter = Router();
const adminRouter = Router();

// ==========================================
// 1. PUBLIC ROUTES (No Auth Required)
// ==========================================
import public_banner from './public/banner_router.js';
import public_blog from './public/blog_router.js';
import public_cart from './public/cart_router.js';
import public_category from './public/category_router.js';
import public_comment from './public/comment_router.js';
import public_order from './public/order_router.js';
import public_product from './public/product_router.js';
import public_rating from './public/rating_router.js';
import public_sale from './public/sale_router.js';
import public_user from './public/user_router.js';
import public_tax from './public/tax_router.js';

publicRouter.use('/', public_banner);
publicRouter.use('/', public_blog);
publicRouter.use('/', public_cart);
publicRouter.use('/', public_category);
publicRouter.use('/', public_comment);
publicRouter.use('/', public_order);
publicRouter.use('/', public_product);
publicRouter.use('/', public_rating);
publicRouter.use('/', public_sale);
publicRouter.use('/', public_user);
publicRouter.use('/', public_tax);


// ==========================================
// 2. CUSTOMER ROUTES (Level 0)
// ==========================================
import customer_comment from './customer/comment_router.js';
import customer_favourite from './customer/favourite_router.js';
import customer_order from './customer/order_router.js';
import customer_rating from './customer/rating_router.js';
import customer_upload from './customer/upload_router.js';
import customer_user from './customer/user_router.js';

customerRouter.use('/', customer_comment);
customerRouter.use('/', customer_favourite);
customerRouter.use('/', customer_order);
customerRouter.use('/', customer_rating);
customerRouter.use('/', customer_upload);
customerRouter.use('/', customer_user);


// ==========================================
// 3. STAFF ROUTES (Level 1)
// ==========================================
import staff_chat from './staff/chat_router.js';
import staff_comment from './staff/comment_router.js';
import staff_order from './staff/order_router.js';
import staff_rating from './staff/rating_router.js';
import staff_user from './staff/user_router.js';

staffRouter.use('/', staff_chat);     // Chat requires STAFF minimum
staffRouter.use('/', staff_comment);
staffRouter.use('/', staff_order);
staffRouter.use('/', staff_rating);
staffRouter.use('/', staff_user);


// ==========================================
// 4. MANAGER ROUTES (Level 2)
// ==========================================
import manager_banner from './manager/banner_router.js';
import manager_blog from './manager/blog_router.js';
import manager_category from './manager/category_router.js';
import manager_consignment from './manager/consignment_router.js';
import manager_product from './manager/product_router.js';
import manager_sale from './manager/sale_router.js';
import manager_user from './manager/user_router.js';
import manager_rating from './manager/rating_router.js';
import manager_order from './manager/order_router.js';
import manager_shipping from './manager/shipping_router.js';
import manager_stock_adjustment from './manager/stock_adjustment_router.js';
import manager_finance from './manager/finance_router.js';

managerRouter.use('/', manager_banner);
managerRouter.use('/', manager_blog);
managerRouter.use('/', manager_category);
managerRouter.use('/', manager_consignment);
managerRouter.use('/', manager_product);
managerRouter.use('/', manager_sale);
managerRouter.use('/', manager_user);
managerRouter.use('/', manager_rating);
managerRouter.use('/', manager_order);
managerRouter.use('/', manager_shipping);
managerRouter.use('/', manager_stock_adjustment);


// ==========================================
// 5. ADMIN ROUTES (Level 3)
// ==========================================
import admin_audit from './admin/audit_router.js';
import admin_statitics from './admin/statitics_router.js';

adminRouter.use('/', admin_audit);
adminRouter.use('/', admin_statitics);
adminRouter.use('/', manager_finance);


// ==========================================
// MOUNT ROUTERS WITH MIDDLEWARES
// ==========================================
rootRouter.use('/', publicRouter);
rootRouter.use('/', checkAuth, authRole(Role.CUSTOMER), customerRouter);
rootRouter.use('/', checkAuth, authRole(Role.STAFF), staffRouter);
rootRouter.use('/', checkAuth, authRole(Role.MANAGER), managerRouter);
rootRouter.use('/', checkAuth, authRole(Role.ADMIN), adminRouter);

export default rootRouter;
