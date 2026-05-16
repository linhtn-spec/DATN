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
    
    // Run sequentially. Each step is wrapped individually so one failure
    // does NOT abort all subsequent steps.
    const runStep = async (name, fn) => {
      try {
        await fn();
      } catch (err) {
        console.error(`❌ Step [${name}] FAILED:`, err.message || err);
      }
    };

    await runStep('seedConfigs',       seedConfigs);
    await runStep('seedUsers',         seedUsers);
    await runStep('seedCategories',    seedCategories);
    await runStep('seedProducts',      seedProducts);
    await runStep('seedBannersAndBlogs', seedBannersAndBlogs);
    await runStep('seedOrders',        seedOrders);
    await runStep('seedRatings',       seedRatings);
    await runStep('seedInteractions',  seedInteractions);
    await runStep('seedSalesAndStock', seedSalesAndStock);
    await runStep('seedFinance',       seedFinance);

    console.log('✨ SUCCESS: Realistic Enterprise Seed V4 (Optimized Module) Completed!');
  } catch (error) {
    console.error('❌ ERROR: Seeding Failed!', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

run();
