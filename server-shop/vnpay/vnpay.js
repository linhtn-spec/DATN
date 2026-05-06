import { Router } from "express";
const router = Router();
import moment from 'moment'
import querystring from 'qs';
import crypto from 'crypto'
import Order from '../models/order_model.js'
import { order_form, order_subject, order_text } from "../form_mail/order_form.js";
import { sendEmail } from "../nodemailer/nodemailer_config.js";


const from = process.env.NODEMAILER_EMAIL

router.post('/create_payment_url', function (req, res, next) {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let tmnCode = process.env.VNP_TMNCODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;
        let orderId = req.body.orderId ? req.body.orderId : moment(date).format('DDHHmmss');
        let amount = req.body.amount;
        let bankCode = req.body.bankCode;
        let orderInfo = req.body?.note?.trim() == '' || !req.body.note ? ('Thanh toan cho ma GD:' + orderId) : req.body.note.trim();

        let locale = req.body.language;
        if (locale === null || locale === '') {
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        return res.status(200).json({ url: vnpUrl });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/vnpay_return', async function (req, res, next) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let tmnCode = process.env.VNP_TMNCODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];


    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        if (rspCode == '00') {
            await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' })
            const order = await Order.findOne({ _id: orderId }).populate({
                path: "products.productId",
                model: "Product",
                select: 'name price images'
            })

            const modifiedData = {
                ...order._doc,
                products: order.products.map(product => ({
                    ...product._doc,
                    productId: {
                        ...product.productId._doc,
                        images: product.productId._doc.images[0]
                    }
                }))
            };
            await sendEmail(from, modifiedData.emailReceiver, order_subject, order_text, order_form(modifiedData))
            res.redirect((process.env.FRONTEND_URL || 'http://localhost') + '/client/checkout/success')
        } else {
            // Payment failed (e.g., canceled by user)
            res.redirect((process.env.FRONTEND_URL || 'http://localhost') + '/client/user/orders')
        }
    } else {
        // Invalid signature
        res.redirect((process.env.FRONTEND_URL || 'http://localhost') + '/client/user/orders')
    }
});

// router.get('/vnpay_ipn', function (req, res, next) {
//     let vnp_Params = req.query;
//     let secureHash = vnp_Params['vnp_SecureHash'];

//     let orderId = vnp_Params['vnp_TxnRef'];
//     let rspCode = vnp_Params['vnp_ResponseCode'];

//     delete vnp_Params['vnp_SecureHash'];
//     delete vnp_Params['vnp_SecureHashType'];

//     vnp_Params = sortObject(vnp_Params);
//     let config = require('config');
//     let secretKey = config.get('vnp_HashSecret');
//     let querystring = require('qs');
//     let signData = querystring.stringify(vnp_Params, { encode: false });
//     let crypto = require("crypto");
//     let hmac = crypto.createHmac("sha512", secretKey);
//     let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

//     let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
//     //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
//     //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

//     let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
//     let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
//     if (secureHash === signed) { //kiểm tra checksum
//         if (checkOrderId) {
//             if (checkAmount) {
//                 if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
//                     if (rspCode == "00") {
//                         //thanh cong
//                         //paymentStatus = '1'
//                         // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
//                         res.status(200).json({ RspCode: '00', Message: 'Thành công' })
//                     }
//                     else {
//                         //that bai
//                         //paymentStatus = '2'
//                         // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
//                         res.status(200).json({ RspCode: '00', Message: 'Thành công' })
//                     }
//                 }
//                 else {
//                     res.status(200).json({ RspCode: '02', Message: 'Đơn hàng này đã được cập nhật trạng thái thanh toán' })
//                 }
//             }
//             else {
//                 res.status(200).json({ RspCode: '04', Message: 'Số tiền không hợp lệ' })
//             }
//         }
//         else {
//             res.status(200).json({ RspCode: '01', Message: 'Không tìm thấy đơn hàng' })
//         }
//     }
//     else {
//         res.status(200).json({ RspCode: '97', Message: 'Sai mã kiểm tra (Checksum failed)' })
//     }
// });


function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export { router }