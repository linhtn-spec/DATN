import mongoose from 'mongoose';
import sale_model from './models/sale_model.js';
import product_model from './models/product_model.js';
import dotenv from 'dotenv';

dotenv.config();

const createActiveSale = async () => {
    try {
        await mongoose.connect(process.env.URL_DB);
        
        // Find a product to add to sale
        const product = await product_model.findOne({});
        if (!product) {
            console.log('No products found to create a sale.');
            process.exit(1);
        }

        const applyDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 days in the future

        const newSale = await sale_model.create({
            products: [{
                productId: product._id,
                pricePromotion: 20 // 20% discount
            }],
            applyDate: applyDate,
            dueDate: dueDate,
            isActive: true
        });

        // Update product with saleId
        await product_model.findByIdAndUpdate(product._id, { $push: { saleId: newSale._id } });

        console.log('Active sale created:', newSale._id);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createActiveSale();
