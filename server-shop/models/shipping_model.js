import mongoose from "mongoose";

const shipping_schema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['express', 'free', 'standard'],
        unique: true,
        required: true
    },
    fee: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model("ShippingConfig", shipping_schema);
