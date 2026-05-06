import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2';

const withdrawal_schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        min: 1,
        required: true
    },
    note: {
        type: String,
        trim: true,
        default: 'Rút tiền lợi nhuận'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        default: 'completed'
    }
}, {
    timestamps: true
});

withdrawal_schema.plugin(moongosePaginate);
withdrawal_schema.index({ createdAt: -1 });

export default mongoose.model("Withdrawal", withdrawal_schema);
