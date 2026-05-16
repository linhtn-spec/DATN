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
import { errorHandler } from "./middleware/error_handler.js";
import { router as order_router } from './vnpay/vnpay.js';
import rootRouter from './router/index.js';
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
        // Cho phép request không có origin (ví dụ: mobile apps, postman)
        if (!origin) return callback(null, true);
        
        const whiteList = [
            "http://localhost",
            "http://localhost:80",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:80",
            process.env.WHITE_URL_1,
            process.env.WHITE_URL_2
        ].filter(Boolean); // Bỏ các giá trị undefined

        // Kiểm tra xem origin có nằm trong whitelist không (kiểm tra rễ, bỏ qua port nếu cần)
        const isAllowed = whiteList.some(url => {
            if (url === origin) return true;
            // Cho phép localhost khác port nếu trong giai đoạn dev, 
            // nhưng ở prod docker-compose, frontend luôn là http://localhost (port 80 proxy)
            // hoặc tên domain cấu hình trong env
            return origin.startsWith(url) && url !== "http://localhost"; 
        });

        if (isAllowed || whiteList.includes(origin)) {
            return callback(null, true);
        }
        
        console.warn(`[CORS Blocked] Origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
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


import cron from "node-cron";
import order_model from "./models/order_model.js";
import product_model from "./models/product_model.js";

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

cron.schedule("1-59 * * * *", async () => {
    try {
        const twentyMinutesInMilliseconds = 14 * 60 * 1000;
        const orders = await order_model.find({
            paymentMethod: "vnpay",
            paymentStatus: "unpaid",
            orderStatus: "new",
            createdAt: { $lte: new Date(Date.now() - twentyMinutesInMilliseconds) },
        });

        for (const order of orders) {
            await order_model.findByIdAndUpdate(order._id, { orderStatus: "canceled" });
            for (const product of order.products) {
                const originalProduct = await product_model.findById(product.productId);
                if (originalProduct) {
                    const newInTrade = originalProduct.quantity.inTrade + product.quantity;
                    await product_model.findByIdAndUpdate(product.productId, {
                        $set: { 'quantity.inTrade': newInTrade }
                    });
                }
            }
        }
    } catch (error) {
        console.error(error.message);
    }
});





app.use("/api/", order_router)
app.use("/api/", router_elastic)
app.use("/api/", rootRouter)

// Health check endpoint for Docker
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

app.use(errorHandler);

connectToGoogle()

export default app