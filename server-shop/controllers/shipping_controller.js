import shipping_model from "../models/shipping_model.js";
import { asyncHandler } from "../helper/async_handler.js";

// Seed default configs if none exist
const seedShippingConfigs = async () => {
    const count = await shipping_model.countDocuments();
    if (count === 0) {
        await shipping_model.create([
            { method: 'free', fee: 0, description: 'Miễn phí vận chuyển' },
            { method: 'standard', fee: 30000, description: 'Giao hàng tiêu chuẩn (3-5 ngày)' },
            { method: 'express', fee: 50000, description: 'Giao hàng hỏa tốc (1-2 ngày)' }
        ]);
        console.log("Seeded default shipping configurations.");
    }
};

// Execute seeding on load
seedShippingConfigs().catch(err => console.error("Error seeding shipping configs:", err));

export const get_all_shipping_configs = asyncHandler(async (req, res) => {
    const configs = await shipping_model.find();
    return res.status(200).json(configs);
});

export const update_shipping_config = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fee, description } = req.body;

    const updated = await shipping_model.findByIdAndUpdate(
        id,
        { fee, description },
        { new: true, runValidators: true }
    );

    if (!updated) {
        return res.status(404).json({ message: "Không tìm thấy cấu hình vận chuyển" });
    }

    return res.status(200).json(updated);
});
