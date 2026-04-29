import mongoose from 'mongoose';
import sale_model from './models/sale_model.js';
import product_model from './models/product_model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.URL_DB);
        const products = await product_model.find({});
        console.log('Products:', JSON.stringify(products, null, 2));
        
        const now = new Date();
        const sales = await sale_model.find({});
        console.log('Current Time:', now.toISOString());
        console.log('Sales:', JSON.stringify(sales, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
