import product_model from "../models/product_model.js"
import category_model from "../models/category_model.js"
import order_model from "../models/order_model.js"
import user_model from "../models/user_model.js"
import withdrawal_model from "../models/withdrawal_model.js"
import consignment_model from "../models/consignment_model.js"
import stock_adjustment_model from "../models/stock_adjustment_model.js"
import moment from "moment";
import fetch from "node-fetch";

export const count_product_category = async (req, res) => {
    try {
        const countCategory = await category_model.countDocuments()
        const countProduct = await product_model.countDocuments()
        const countProductInEachCategory = await product_model.aggregate([
            {
                $lookup: {
                    from: "categories", // Tên của collection chứa danh mục
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category" // Tách mỗi sản phẩm thành một bản ghi riêng lẻ cho mỗi danh mục
            },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" }, // Lấy tên của danh mục
                    totalCount: { $sum: 1 },
                    categoryIds: { $addToSet: "$category._id" }// Đếm số lượng sản phẩm trong mỗi nhóm
                }
            }
        ])
        return res.status(200).json({ countCategory: countCategory, countProduct: countProduct, countProductInEachCategory: countProductInEachCategory })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const count_order = async (req, res) => {
    try {
        const countOrderByShippingStatus = await order_model.aggregate([

            {
                $group: {
                    _id: "$shippingStatus",
                    totalCount: { $sum: 1 }
                }
            }
        ])
        const countOrderByPaymentStatus = await order_model.aggregate([

            {
                $group: {
                    _id: "$paymentStatus",
                    totalCount: { $sum: 1 }
                }
            }
        ])
        const countOrderByOrderStatus = await order_model.aggregate([

            {
                $group: {
                    _id: "$orderStatus",
                    totalCount: { $sum: 1 }
                }
            }
        ])
        return res.status(200).json({
            countOrderByShippingStatus: countOrderByShippingStatus,
            countOrderByPaymentStatus: countOrderByPaymentStatus,
            countOrderByOrderStatus: countOrderByOrderStatus,
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const count_statitics = async (req, res) => {
    try {
        const [countCategory, countProduct, countTotalOrder, countCustomer] = await Promise.all([
            category_model.countDocuments(),
            product_model.countDocuments(),
            order_model.countDocuments(),
            user_model.countDocuments({ role: 0 })
        ]);

        return res.status(200).json({
            countTotalOrder: countTotalOrder,
            countProduct: countProduct,
            countCategory: countCategory,
            countCustomer: countCustomer
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
export const countMonthlyOrders = async (req, res) => {
    try {
        // Calculate the start of the current month and the start of the previous year
        const today = new Date();
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfPreviousYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);

        // Array to store monthly statistics
        const monthlyStats = [];

        // Loop through each month from the previous year to the current month
        for (let i = 0; i < 13; i++) {
            // Calculate the start and end dates of the current month
            const startOfMonth = new Date(startOfPreviousYear.getFullYear(), startOfPreviousYear.getMonth() + i, 1);
            const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

            // Aggregate orders for the current month
            const monthlyOrders = await order_model.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 }, // Count total orders
                        totalRevenue: { $sum: "$total" } // Calculate total revenue
                    }
                }
            ]);

            // Add monthly statistics to the array
            monthlyStats.push({
                month: moment(startOfMonth).format('MMMM YYYY'),
                totalOrders: monthlyOrders.length > 0 ? monthlyOrders[0].totalOrders : 0,
                totalRevenue: monthlyOrders.length > 0 ? monthlyOrders[0].totalRevenue : 0
            });
        }

        // Return the monthly statistics
        return res.status(200).json(monthlyStats);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const countDailyOrders = async (req, res) => {
    try {
        const today = new Date();

        // Tính toán ngày bắt đầu và kết thúc của một tháng trước
        const startOfPastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const endOfPastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const dailyStats = [];

        // Lặp qua từng ngày trong khoảng thời gian đó
        for (let currentDate = startOfPastMonth; currentDate <= endOfPastMonth; currentDate.setDate(currentDate.getDate() + 1)) {
            // Tính toán ngày bắt đầu và kết thúc của ngày hiện tại
            const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

            // Sử dụng aggregation framework để đếm tổng số đơn hàng và tổng doanh thu trong ngày
            const dailyOrders = await order_model.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfDay, $lt: endOfDay } // Sử dụng $lt thay vì $lte để không bao gồm ngày kế tiếp
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$total" }
                    }
                }
            ]);

            dailyStats.push({
                date: currentDate.toISOString().split('T')[0], // Lấy ngày dưới dạng chuỗi YYYY-MM-DD
                totalRevenue: dailyOrders.length > 0 ? dailyOrders[0].totalRevenue : 0
            });
        }

        return res.status(200).json(dailyStats);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const unsold = async (req, res) => {
    try {
        const products = await product_model.find({}).select("name quantity.inTrade")
        if (products?.length === 0) return res.status(400).json({ message: "Không có sản phẩm" });

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const countAddedPerDay = async (req, res) => {
    try {
        const productNewPerDay = await product_model.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const categoryNewPerDay = await category_model.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const orderNewPerDay = await order_model.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const userNewPerDay = await user_model.aggregate([
            {
                $match: { role: 0 }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return res.status(200).json({
            productNewPerDay: productNewPerDay,
            categoryNewPerDay: categoryNewPerDay,
            orderNewPerDay: orderNewPerDay,
            userNewPerDay: userNewPerDay
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getFinanceOverview = async (req, res) => {
    try {
        // 1. Fetch completed orders to sum revenue and track quantities sold per product
        const doneOrders = await order_model.find({ orderStatus: 'done' });
        
        let totalRevenue = 0;
        const soldProductMap = {}; // productId -> quantity sold
        
        doneOrders.forEach(order => {
            order.products.forEach(item => {
                const pId = item.productId.toString();
                const qty = Number(item.quantity) || 0;
                const subPrice = Number(item.subPrice) || 0;
                
                // subPrice is already the line total (qty × unitPrice), so use it directly
                totalRevenue += subPrice;
                
                if (!soldProductMap[pId]) soldProductMap[pId] = 0;
                soldProductMap[pId] += qty;
            });
        });

        // 2. Fetch all consignments in chronological order (FIFO)
        const consignments = await consignment_model.find().sort({ importDate: 1 });
        
        // 3. Compute exact COGS based on FIFO strategy
        let totalCOGS = 0;
        
        Object.keys(soldProductMap).forEach(pId => {
            let remainingToCost = soldProductMap[pId];
            
            for (let i = 0; i < consignments.length; i++) {
                if (remainingToCost <= 0) break;
                
                const c = consignments[i];
                // Find matching product line item in consignment
                const cProduct = c.products.find(p => p.productId && p.productId.toString() === pId);
                
                if (cProduct) {
                    const availableQtyInC = cProduct.quantity;
                    const cogsTaken = Math.min(availableQtyInC, remainingToCost);
                    
                    // We treat importMoney as the Unit Import Price
                    const unitCost = Number(cProduct.importMoney) || 0;
                    
                    totalCOGS += (cogsTaken * unitCost);
                    remainingToCost -= cogsTaken;
                }
            }
            
            // Fallback for inventory sold that was never imported via consignment (e.g. seeded data)
            if (remainingToCost > 0) {
                // Heuristic: Use the latest known importMoney as the unit cost fallback
                const latestC = [...consignments].reverse().find(c => c.products.some(p => p.productId && p.productId.toString() === pId));
                let fallbackPrice = 0;
                if (latestC) {
                    const pItem = latestC.products.find(p => p.productId && p.productId.toString() === pId);
                    fallbackPrice = Number(pItem.importMoney) || 0;
                }
                totalCOGS += (remainingToCost * fallbackPrice);
            }
        });

        const totalProfit = totalRevenue - totalCOGS;

        // 4. Sum stock write-off losses (hàng hủy/kiểm kê)
        const adjAgg = await stock_adjustment_model.aggregate([
            { $group: { _id: null, totalLoss: { $sum: '$totalLoss' } } }
        ]);
        const totalAdjustmentLoss = adjAgg.length ? adjAgg[0].totalLoss : 0;

        const netProfit = totalProfit - totalAdjustmentLoss;

        const withdrawalAgg = await withdrawal_model.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalWithdrawal: { $sum: "$amount" } } }
        ]);
        const totalWithdrawal = withdrawalAgg.length ? withdrawalAgg[0].totalWithdrawal : 0;
        
        const balance = netProfit - totalWithdrawal;

        return res.status(200).json({
            totalRevenue,
            totalCOGS,
            totalProfit,
            totalAdjustmentLoss,
            netProfit,
            totalWithdrawal,
            balance
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getWithdrawalsHistory = async (req, res) => {
    try {
        const list = await withdrawal_model.find().sort({ createdAt: -1 });
        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createWithdrawal = async (req, res) => {
    try {
        const { amount, note, bankName, accountNumber, accountHolder } = req.body;
        const userId = req.user._id;

        const withdrawal = await withdrawal_model.create({
            userId,
            amount,
            bankName,
            accountNumber,
            accountHolder,
            note,
            status: 'completed'
        });

        return res.status(201).json({ message: "Tạo lệnh rút tiền thành công", data: withdrawal });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const lookupBankAccount = async (req, res) => {
    try {
        const { bin, accountNumber } = req.body;
        const apiKey = process.env.CASSO_API_KEY;
        const clientId = process.env.CASSO_CLIENT_ID;

        if (!apiKey || !clientId) {
            return res.status(400).json({ 
                code: "401", 
                desc: "Thiếu cấu hình CASSO_API_KEY hoặc CASSO_CLIENT_ID trong .env. Vui lòng liên hệ Admin." 
            });
        }

        const response = await fetch("https://api.vietqr.io/v2/lookup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "x-client-id": clientId
            },
            body: JSON.stringify({ bin, accountNumber })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}