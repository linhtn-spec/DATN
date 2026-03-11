import cookieParser from "cookie-parser";
import cors from "cors";
import Express from "express";
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import multer from "multer";
import passport from "passport";
import router_elastic from './elastic_search/elastic_search.js';
import './google/google-auth.js';
import { connectToGoogle } from "./google/google-auth.js";
import router_banner from './router/banner_router.js';
import router_blog from './router/blog_router.js';
import router_category from "./router/category_router.js";
import router_chat from './router/chat_router.js';
import router_comment from './router/comment_router.js';
import router_consignment from './router/consignment_router.js';
import router_favourite from './router/favourite_router.js';
import router_order from "./router/order_router.js";
import router_product from "./router/product_router.js";
import router_rating from './router/rating_router.js';
import router_sale from './router/sale_router.js';
import router_statitics from './router/statitics_router.js';
import router_upload from "./router/upload_router.js";
import router_auth from "./router/user_router.js";
import router_audit from "./router/audit_router.js";
import router_cart from "./router/cart_router.js";
import { errorHandler } from "./middleware/error_handler.js";
import { router as order_router } from './vnpay/vnpay.js';
const app = Express();


app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET || "SESSION_SECRET_CHANGE_ME",
        // cookie: { maxAge: 172800000 }
    })
);
var upload = multer()

app.use(cookieParser());
app.use(mongoSanitize({ allowDots: true }))
app.use(upload.array('images', 100))

app.use(cors({
    origin: function (origin, callback) {
        const whiteList = [
            "http://localhost",
            "http://localhost:80",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:80",
            process.env.WHITE_URL_1 || "http://localhost",
            process.env.WHITE_URL_2 || "http://localhost:5173"
        ];
        if (!origin || whiteList.some(url => origin.includes(url.split("://")[1] || url))) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    preflightContinue: true
}));


app.use(helmet())
app.use(Express.json({ limit: '10MB' }));
app.use(Express.urlencoded({ extended: true, limit: "500MB" }));

app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    keyGenerator: (req, res) => {
        return req.clientIp
    }
}));

app.use(passport.initialize());
app.use(passport.session());


// cron.schedule("*/5 * * * *", async () => {
//     try {
//         const consignments = await consignment_model.find();

//         for (let consignment of consignments) {
//             for (let product of consignment.products) {
//                 if (isToday(product.expireDate)) {
//                     const originalProduct = await product_model.findById(product.productId);
//                     if (originalProduct) {
//                         const updatedUnSold = originalProduct.quantity.unSold + originalProduct.quantity.inTrade;
//                         await product_model.findByIdAndUpdate(product.productId, {
//                             $set: {
//                                 'quantity.inTrade': 0,
//                                 'quantity.unSold': updatedUnSold
//                             }
//                         });

//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error.message);
//     }
// });

// cron.schedule("1-59 * * * *", async () => {
//     try {
//         const twentyMinutesInMilliseconds = 14 * 60 * 1000;
//         const orders = await order_model.find({
//             paymentMethod: "vnpay",
//             paymentStatus: "unpaid",
//             orderStatus: "new",
//             createdAt: { $lte: new Date(Date.now() - twentyMinutesInMilliseconds) },
//         });

//         for (const order of orders) {
//             await order_model.findByIdAndUpdate(order._id, { orderStatus: "canceled" });
//             for (const product of order.products) {
//                 const originalProduct = await product_model.findById(product.productId);
//                 if (originalProduct) {
//                     const newInTrade = originalProduct.quantity.inTrade + product.quantity;
//                     await product_model.findByIdAndUpdate(product.productId, {
//                         $set: { 'quantity.inTrade': newInTrade }
//                     });
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error.message);
//     }
// });





app.use("/api/", order_router)
app.use("/api/", router_auth);
app.use("/api/", router_order);
app.use("/api/", router_product);
app.use("/api/", router_category);
app.use("/api/", router_elastic)
app.use("/api/", router_upload)
app.use("/api/", router_chat)
app.use("/api/", router_banner)
app.use("/api/", router_blog)
app.use("/api/", router_favourite)
app.use("/api/", router_rating)
app.use("/api/", router_comment)
app.use("/api/", router_sale)
app.use("/api/", router_consignment)
app.use("/api/", router_statitics)
app.use("/api/", router_audit)
app.use("/api/", router_cart)

// Health check endpoint for Docker
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

app.use(errorHandler);

connectToGoogle()

export default app