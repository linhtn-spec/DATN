import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2'

const category_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 50,
        trim: true,
    },

    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        min: 6,
        max: 300,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    })

category_schema.plugin(moongosePaginate)
export default mongoose.model("Category", category_schema);