import mongoose from 'mongoose';
import user_model from './models/user_model.js';
import category_model from './models/category_model.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "7d";

// 1. Default Configuration from ENV (for Owner/Admin)
const defaultAdmin = {
    firstName: process.env.FIRST_NAME_DEFAULT || "Admin",
    lastName: process.env.LAST_NAME_DEFAULT || "System",
    role: parseInt(process.env.ROLE_DEFAULT) || 3,
    gender: process.env.GENDER || "male",
    password: process.env.PASSWORD_DEFAULT || "Admin@123456",
    username: process.env.USERNAME_DEFAULT || "admin",
    email: process.env.EMAIL_DEFAULT || "admin@example.com"
};

const defaultCategory = {
    name: process.env.CATEGORY_NAME_DEFAULT || "All Products",
    description: process.env.CATEGORY_DESCRIPTION_DEFAULT || "Default category for all products",
    order: parseInt(process.env.CATEGORY_ORDER_DEFAULT) || 1,
    image: process.env.CATEGORY_IMAGE_DEFAULT || "https://res.cloudinary.com/thanh-nam/image/upload/v1714885565/DATN/default_category.png"
};

// 2. Demo Accounts for Testing
const demoAccounts = [
    {
        username: "demo_customer",
        email: "customer@demo.com",
        firstName: "Demo",
        lastName: "Customer",
        role: 0,
        password: "password123",
        gender: "other"
    },
    {
        username: "demo_staff",
        email: "staff@demo.com",
        firstName: "Demo",
        lastName: "Staff",
        role: 1,
        password: "password123",
        gender: "other"
    },
    {
        username: "demo_manager",
        email: "manager@demo.com",
        firstName: "Demo",
        lastName: "Manager",
        role: 2,
        password: "password123",
        gender: "other"
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URL_DB);
        console.log("✅ Connected to the database");
    } catch (err) {
        console.error("❌ Error connecting to the database:", err.message);
        process.exit(1);
    }
};

const seedUser = async (data) => {
    try {
        const checkUsername = await user_model.findOne({ username: data.username });
        const checkEmail = await user_model.findOne({ email: data.email });
        if (checkEmail || checkUsername) {
            console.log(`ℹ️ User ${data.username} already exists, skipping.`);
            return;
        }

        // Note: Password hashing is handled by pre('save') hook in user_model.js
        const user = await user_model.create({ ...data, isVerified: true });
        if (user) {
            const dataForRefreshToken = {
                username: user.username,
                user_id: user._id
            };
            const refreshToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
            await user_model.findByIdAndUpdate(user._id, { refreshToken: refreshToken });
            console.log(`✅ Created user: ${data.username} (Role: ${data.role})`);
        }
    } catch (error) {
        console.error(`❌ Error creating user ${data.username}:`, error.message);
    }
};

const seedCategory = async (data) => {
    try {
        const checkName = await category_model.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
        if (checkName) {
            console.log(`ℹ️ Category ${data.name} already exists, skipping.`);
            return;
        }
        await category_model.create(data);
        console.log(`✅ Created category: ${data.name}`);
    } catch (error) {
        console.error(`❌ Error creating category ${data.name}:`, error.message);
    }
};

const dbSeed = async () => {
    await connectDB();
    
    console.log("\n--- Seeding Initial Data ---");
    await seedCategory(defaultCategory);

    console.log("\n--- Seeding Demo Accounts ---");
    for (const account of demoAccounts) {
        await seedUser(account);
    }

    console.log("\n🚀 Seeding process completed!\n");
    await mongoose.disconnect();
};

dbSeed().catch(err => {
    console.error("❌ Seeding failed:", err);
    mongoose.disconnect();
});
