import Order from '../models/order_model.js';
import User from '../models/user_model.js';
import Product from '../models/product_model.js';
import { CONFIG } from './constants.js';
import { randomInt, randomItem } from './utils.js';

export const seedOrders = async () => {
  console.log(`📦 Seeding ${CONFIG.ORDERS} Orders with Seasonal Spikes...`);
  
  // OPTIMIZATION: Only fetch needed fields, use lean() to avoid heavy Mongoose documents in RAM
  const customers = await User.find({ role: 0 }, '_id firstName lastName phone email address isVIP').lean();
  const products  = await Product.find({ isActive: true }, '_id price').lean();

  if (customers.length === 0 || products.length === 0) {
    console.error('   ❌ Missing customers or products. Cannot seed orders.');
    return;
  }

  for (let m = 0; m < 12; m++) {
    const month = m + 1;
    let multiplier = 1.0;
    
    // Seasonal spikes logic
    if (month === 1 || month === 2) multiplier = 2.8; // Lunar New Year
    if (month >= 5 && month <= 7)   multiplier = 1.4; // Summer fruits
    if (month === 12)               multiplier = 2.0; // End of year

    const ordersInMonth = Math.round((CONFIG.ORDERS / 12) * multiplier);
    const batch = [];

    for (let i = 0; i < ordersInMonth; i++) {
      const user       = randomItem(customers);
      const itemsCount = user.isVIP ? randomInt(3, 6) : randomInt(1, 3);
      const orderProducts = [];
      let totalItemsPrice = 0;

      for (let j = 0; j < itemsCount; j++) {
        const prod = randomItem(products);
        const qty  = randomInt(1, 5);
        orderProducts.push({ productId: prod._id, subPrice: prod.price * qty, quantity: qty });
        totalItemsPrice += prod.price * qty;
      }

      const orderDate  = new Date(2025, m, randomInt(1, 28), randomInt(8, 22));
      const payMethod  = Math.random() < 0.7 ? 'cod' : 'vnpay';
      const shipMethod = randomItem(['standard', 'express']);
      const shipCost   = shipMethod === 'express' ? 50000 : 30000;
      const taxAmount  = Math.round(totalItemsPrice * 0.08);

      // Phân bổ trạng thái đơn hàng thực tế
      const randStatus = Math.random();
      let orderStatus = 'done';
      let shippingStatus = 'sent';
      let paymentStatus = 'paid';

      if (randStatus > 0.85) {
        if (randStatus > 0.98) {
          orderStatus = 'canceled';
          shippingStatus = 'not_sent';
          paymentStatus = 'unpaid';
        } else if (randStatus > 0.95) {
          orderStatus = 'new';
          shippingStatus = 'not_sent';
          paymentStatus = payMethod === 'vnpay' ? 'paid' : 'unpaid';
        } else if (randStatus > 0.90) {
          orderStatus = 'processing';
          shippingStatus = 'sending';
          paymentStatus = payMethod === 'vnpay' ? 'paid' : 'unpaid';
        } else {
          orderStatus = 'hold';
          shippingStatus = 'not_sent';
          paymentStatus = payMethod === 'vnpay' ? 'partial_payment' : 'unpaid';
        }
      }

      batch.push({
        userId: user._id, 
        firstNameReceiver: user.firstName || 'Khách', 
        lastNameReceiver: user.lastName || 'Hàng',
        phoneReceiver: user.phone || '0900000000', 
        emailReceiver: user.email, 
        addressReceiver: user.address || '123 Đường Lê Lợi, TP. HCM',
        countryReceiver: 'Việt Nam', 
        paymentMethod: payMethod, 
        shippingMethod: shipMethod,
        paymentStatus, 
        shippingStatus, 
        orderStatus,
        products: orderProducts, 
        tax: taxAmount, 
        shippingCost: shipCost,
        total: totalItemsPrice + taxAmount + shipCost,
        createdAt: orderDate, 
        updatedAt: orderDate
      });

      // Insert in batches to prevent memory overflow
      if (batch.length >= CONFIG.BATCH_SIZE) { 
        await Order.insertMany(batch); 
        batch.length = 0; 
      }
    }
    
    // Insert any remaining orders in the batch for this month
    if (batch.length > 0) {
      await Order.insertMany(batch);
    }
    
    console.log(`   └─ Month ${month}: ${ordersInMonth} orders`);
  }
};
