import mongoose from "mongoose";

const tax_schema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        default: 'VAT'
    },
    rate: {
        type: Number,
        required: true,
        default: 0.09, // 9% default
        min: 0,
        max: 1
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model("TaxConfig", tax_schema);
