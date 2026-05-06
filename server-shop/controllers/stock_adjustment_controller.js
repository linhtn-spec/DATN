import product_model from "../models/product_model.js";
import stock_adjustment_model from "../models/stock_adjustment_model.js";

export const create_adjustment = async (req, res) => {
    const { products, adjustmentDate } = req.body;
    const userId = req.user._id;

    if (!products || products.length === 0) {
        return res.status(400).json({ message: "Danh sách sản phẩm không được để trống." });
    }

    try {
        // Validate stock availability and calculate total loss
        let totalLoss = 0;
        for (const item of products) {
            const product = await product_model.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Sản phẩm không tồn tại: ${item.productId}` });
            }
            const available = typeof product.quantity === 'object'
                ? product.quantity.inTrade : (product.quantity || 0);
            if (available < item.quantity) {
                return res.status(400).json({
                    message: `Số lượng hủy (${item.quantity}) vượt quá tồn kho (${available}) của sản phẩm: ${product.name}`
                });
            }
            totalLoss += product.price * item.quantity; // Loss based on selling price
        }

        // Create the adjustment record
        const adjustment = await stock_adjustment_model.create({
            userId,
            products,
            adjustmentDate: adjustmentDate ? new Date(adjustmentDate) : new Date(),
            totalLoss
        });

        // Deduct inventory
        for (const item of products) {
            await product_model.findByIdAndUpdate(item.productId, {
                $inc: { 'quantity.inTrade': -item.quantity }
            });
        }

        return res.status(201).json({ message: "Tạo phiếu kiểm kê thành công.", adjustment });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const paginate_adjustments = async (req, res) => {
    const { page = 1, reason, sortDate } = req.query;
    const limit = 8;
    const skip = (page - 1) * limit;
    const query = {};
    if (reason) query['products.reason'] = reason;

    const sortKind = { adjustmentDate: sortDate === 'ascend' ? 1 : -1 };
    try {
        const result = await stock_adjustment_model.paginate(query, {
            offset: skip, page, limit, sort: sortKind,
            populate: [
                { path: 'products.productId', model: 'Product', select: 'name images unit price' },
                { path: 'userId', model: 'User', select: 'firstName lastName' }
            ]
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const detail_adjustment = async (req, res) => {
    try {
        const adj = await stock_adjustment_model.findById(req.params.id)
            .populate({ path: 'products.productId', model: 'Product', select: 'name images unit price' })
            .populate({ path: 'userId', model: 'User', select: 'firstName lastName' });
        if (!adj) return res.status(404).json({ message: "Phiếu kiểm kê không tồn tại." });
        return res.status(200).json(adj);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
