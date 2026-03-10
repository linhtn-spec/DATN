import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2'

const banner_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 6,
        max: 50,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        min: 6,
        max: 300
    },
    image: {
        type: String,
        required: true
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

banner_schema.plugin(moongosePaginate)
export default mongoose.model("Banner", banner_schema);