import product_model from "../models/product_model.js"
import category_model from "../models/category_model.js"
import order_model from "../models/order_model.js"
import user_model from "../models/user_model.js"
import moment from "moment";

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
        const products = await product_model.find({}).select("name quantity.unSold")
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
        console.error("Error counting products added per day:", error);
        return res.status(500).json({ message: error.message });
    }
};