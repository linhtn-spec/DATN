import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2'

const order_schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstNameReceiver: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        trim: true
    },
    lastNameReceiver: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        trim: true
    },
    phoneReceiver: {
        type: String,
        required: true,
        min: 10,
        max: 13,
        trim: true
    },
    emailReceiver: {
        type: String,
        required: true,
        min: 5,
        max: 50,
        trim: true
    },
    addressReceiver: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        trim: true
    },
    countryReceiver: {
        type: String,
        required: true,
        min: 5,
        max: 50,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['vnpay', 'cod'],
        required: true
    },
    shippingMethod: {
        type: String,
        enum: ['express', 'free', 'standard'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial_payment', 'paid'],
        default: 'unpaid',
    },
    shippingStatus: {
        type: String,
        enum: ['not_sent', 'sending', 'sent'],
        default: 'not_sent',
    },
    orderStatus: {
        type: String,
        enum: ['new', 'processing', 'hold', 'canceled', 'done'],
        default: 'new',
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            subPrice: {
                type: Number,
                min: 1,
                required: true
            },
            quantity: {
                type: Number,
                min: 1,
                required: true
            },
        }
    ],
    tax: {
        type: Number,
        min: 0,
        default: 1
    },
    shippingCost: {
        type: Number,
        min: 0,
        default: 0
    },
    total: {
        type: Number,
        min: 0,
    },
    note: {
        type: String,
        trim: true,
        min: 3,
        max: 300
    }
},
    {
        timestamps: true
    })

order_schema.pre('findOneAndUpdate', async function (next) {
    const updatedFields = this.getUpdate();
    if (updatedFields && updatedFields.shippingCost !== undefined && updatedFields.tax !== undefined) {
        try {
            console.log(updatedFields);
            const order = await this.model.findOne(this.getQuery());
            if (order) {
                let total = 0;
                for (const product of order.products) {
                    total += product.subPrice;
                    console.log(product.subPrice);
                }
                total = total + Number(updatedFields.shippingCost) + Number(updatedFields.tax);
                console.log(total);
                await this.model.updateOne(this.getQuery(), { total: total });
            }
        } catch (error) {
            console.error("Error updating total:", error);
        }
    }
    if (updatedFields && updatedFields.shippingCost !== undefined) {
        try {
            const order = await this.model.findOne(this.getQuery());
            if (order) {
                let total = 0;
                for (const product of order.products) {
                    total += product.subPrice;
                }
                total = total + Number(updatedFields.shippingCost) + order.tax;
                await this.model.updateOne(this.getQuery(), { total: total });
            }
        } catch (error) {
            console.error("Error updating total:", error);
        }
    }
    if (updatedFields && updatedFields.tax !== undefined) {
        try {
            const order = await this.model.findOne(this.getQuery());
            if (order) {
                let total = 0;
                for (const product of order.products) {
                    total += product.subPrice;
                }

                total = total + Number(updatedFields.tax) + order.shippingCost;
                await this.model.updateOne(this.getQuery(), { total: total });
            }
        } catch (error) {
            console.error("Error updating total:", error);
        }
    }


    next();
});



order_schema.plugin(moongosePaginate)

order_schema.index({ userId: 1 });
order_schema.index({ orderStatus: 1 });
order_schema.index({ createdAt: -1 });

export default mongoose.model("Order", order_schema);