import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration: Remove "partial_payment" paymentStatus
 * Updates all orders with paymentStatus: "partial_payment" to "unpaid"
 * since partial_payment is not a valid state in the COD/VNPAY business model.
 *
 * Usage: node migrations/migrate_partial_payment.js
 */
const run = async () => {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(process.env.URL_DB);
        console.log('✅ Connected');

        const db = mongoose.connection.db;
        const result = await db.collection('orders').updateMany(
            { paymentStatus: 'partial_payment' },
            { $set: { paymentStatus: 'unpaid' } }
        );

        console.log(`✨ Migration complete! Updated ${result.modifiedCount} order(s).`);
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
};

run();
