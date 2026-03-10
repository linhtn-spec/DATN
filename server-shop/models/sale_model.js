import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2'

const sale_schema = new mongoose.Schema({
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            pricePromotion: {
                type: Number,
                min: 0,
                max: 100,
                required: true
            }
        }
    ],
    applyDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    })
sale_schema.plugin(moongosePaginate)
export default mongoose.model("Sale", sale_schema);