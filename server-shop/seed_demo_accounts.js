import mongoose from 'mongoose';
import user_model from './models/user_model.js';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "7d";

const accounts = [
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
    },
    {
        username: "demo_admin",
        email: "admin@demo.com",
        firstName: "Demo",
        lastName: "Admin",
        role: 3,
        password: "password123",
        gender: "other"
    }
];

// Note: user_model.js has a pre('save') hook that hashes the password. 
// However, the existing seeder.js manually hashed the password too. 
// To make sure we don't break authentication by double-hashing (if that was an issue),
// we will rely on mongoose plugins or follow seeder structure exactly.
// Often pre('save') correctly hashes it. Let's just create.

const seedAccounts = async () => {
    try {
        await mongoose.connect(process.env.URL_DB);
        console.log("Connected to DB.");

        for (const data of accounts) {
            const exists = await user_model.findOne({ $or: [{ username: data.username }, { email: data.email }] });
            if (exists) {
                console.log(`Account ${data.username} already exists, skipping.`);
                continue;
            }

            // Mongoose will trigger pre('save') which hashes the password for us
            const user = await user_model.create({ ...data, isVerified: true });
            
            if (user) {
                const dataForRefreshToken = {
                    username: user.username,
                    user_id: user._id
                };
                const refreshToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
                await user_model.findByIdAndUpdate(user._id, { refreshToken: refreshToken });
                console.log(`Successfully created demo account: ${data.username} / password123 (Role: ${data.role})`);
            }
        }
        console.log("Demo accounts seeding completed!");
    } catch (error) {
        console.error("Error setting up demo accounts:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedAccounts();
