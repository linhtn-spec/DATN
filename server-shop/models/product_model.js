import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2'

const product_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    description: {
        required: true,
        type: String,
        min: 5,
        max: 300
    },
    unit: {
        type: String,
        minlength: 1,
        maxlength: 20,
        required: true,
    },
    origin: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        min: 1,
        required: true
    },
    quantity: {
        sold: {
            type: Number,
            min: 0,
            default: 0
        },
        inTrade: {
            type: Number,
            min: 0,
            default: 0
        },
        unSold: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    images: [{
        type: String,
        required: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    ratingId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
    }],
    saleId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
    }]
}
    ,
    {
        timestamps: true
    })

product_schema.plugin(moongosePaginate)

product_schema.index({ price: 1 });
product_schema.index({ categoryId: 1 });
product_schema.index({ origin: 1 });
product_schema.index({ isActive: 1 });

export default mongoose.model("Product", product_schema);