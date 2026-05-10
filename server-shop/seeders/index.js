import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import modules
import { seedUsers } from './seedUsers.js';
import { seedCategories, seedProducts } from './seedProducts.js';
import { seedOrders } from './seedOrders.js';
import { seedInteractions } from './seedInteractions.js';
import { 
  seedConfigs, 
  seedBannersAndBlogs, 
  seedRatings, 
  seedSalesAndStock, 
  seedFinance 
} from './seedRatings.js';

// Load environment variables
dotenv.config();

const clearDB = async () => {
  console.log('🧹 Clearing existing data...');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (e) {
      console.log(`Failed to clear collection: ${key}`, e);
    }
  }
};

const run = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    if (!process.env.URL_DB) {
      throw new Error("Missing URL_DB in .env file");
    }
    
    await mongoose.connect(process.env.URL_DB);

    await clearDB();
    
    // Run sequentially to ensure dependencies exist (e.g. users for orders, products for orders)
    await seedConfigs();
    await seedUsers();
    await seedCategories();
    await seedProducts();
    await seedBannersAndBlogs();
    await seedOrders();
    await seedRatings();
    await seedInteractions();
    await seedSalesAndStock();
    await seedFinance();

    console.log('✨ SUCCESS: Realistic Enterprise Seed V4 (Optimized Module) Completed!');
  } catch (error) {
    console.error('❌ ERROR: Seeding Failed!', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

run();
