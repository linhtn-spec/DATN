import mongoose from 'mongoose';
import sale_model from './models/sale_model.js';
import product_model from './models/product_model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.URL_DB);
        const saleCount = await sale_model.countDocuments();
        const productCount = await product_model.countDocuments();
        console.log('Product count:', productCount);
        console.log('Sale count:', saleCount);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
