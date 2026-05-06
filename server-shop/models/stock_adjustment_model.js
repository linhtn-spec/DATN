import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Stock Adjustment — records intentional inventory write-offs.
 * Reason types:
 *   - 'expired'  : hàng hết hạn sử dụng
 *   - 'damaged'  : hàng bị hư hỏng, dập nát
 *   - 'lost'     : mất hàng, thất thoát
 *   - 'other'    : lý do khác (ghi chú bắt buộc)
 */
const stock_adjustment_schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    min: 1,
                    required: true
                },
                reason: {
                    type: String,
                    enum: ['expired', 'damaged', 'lost', 'other'],
                    required: true
                },
                note: {
                    type: String,
                    trim: true,
                    maxlength: 500
                }
            }
        ],
        adjustmentDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        totalLoss: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

stock_adjustment_schema.plugin(mongoosePaginate);
export default mongoose.model('StockAdjustment', stock_adjustment_schema);
