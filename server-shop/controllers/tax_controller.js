import tax_model from "../models/tax_model.js";
import { asyncHandler } from "../helper/async_handler.js";

// Ensure a default tax configuration exists
const seedTaxConfig = async () => {
    try {
        const count = await tax_model.countDocuments();
        if (count === 0) {
            await tax_model.create({
                label: 'Thuế (VAT)',
                rate: 0.09,
                description: 'Thuế giá trị gia tăng mặc định'
            });
            console.log("Seeded default tax configuration.");
        }
    } catch (error) {
        console.error("Error seeding tax config:", error);
    }
};

seedTaxConfig();

export const get_tax_config = asyncHandler(async (req, res) => {
    let config = await tax_model.findOne();
    if (!config) {
        config = await tax_model.create({
            label: 'Thuế (VAT)',
            rate: 0.09,
            description: 'Thuế giá trị gia tăng mặc định'
        });
    }
    return res.status(200).json(config);
});

export const update_tax_config = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { label, rate, description } = req.body;

    const updated = await tax_model.findByIdAndUpdate(
        id,
        { label, rate, description },
        { new: true, runValidators: true }
    );

    if (!updated) {
        return res.status(404).json({ message: "Cấu hình thuế không tồn tại" });
    }

    return res.status(200).json(updated);
});
