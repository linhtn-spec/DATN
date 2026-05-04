import mongoose from 'mongoose';
import user_model from './models/user_model.js';
import category_model from './models/category_model.js';
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;


mongoose.connect(process.env.URL_DB)
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((err) => {
        console.error("Error connecting to the database:", err.message);
    });



const defaultCategory = {
    "name": process.env.CATEGORY_NAME_DEFAULT,
    "description": process.env.CATEGORY_DESCRIPTION_DEFAULT,
    "order": process.env.CATEGORY_ORDER_DEFAULT,
}


const defaultAdmin = {
    "firstName": process.env.FIRST_NAME_DEFAULT,
    "lastName": process.env.LAST_NAME_DEFAULT,
    "role": process.env.ROLE_DEFAULT,
    "gender": process.env.GENDER,
    "password": process.env.PASSWORD_DEFAULT,
    "username": process.env.USERNAME_DEFAULT,
    "email": process.env.EMAIL_DEFAULT
}



const seedUser = async (data) => {

    try {
        const checkUsername = await user_model.findOne({ username: data.username });
        const checkEmail = await user_model.findOne({ email: data.email });
        if (checkEmail || checkUsername) return
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(data.password, salt)
        data.password = hashed;
        const user = await user_model.create(data);
        if (user) {
            const dataForRefreshToken = {
                username: user.username,
                user_id: user._id
            };
            const refreshToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
            if (user.refreshToken) {
                await user_model.findByIdAndUpdate(user._id, { refreshToken: refreshToken })
            }
        }
    } catch (error) {
        console.log("Error creating user:", error);
        throw error;
    }
}



const seedCategory = async (data) => {
    try {
        const checkName = await category_model.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
        if (checkName) {
            return;
        }
        await category_model.create(data);
    } catch (error) {
        console.log("Error creating category:", error);
        throw error;
    }
}

const dbSeed = async () => {
    try {
        await seedUser(defaultAdmin);
        await seedCategory(defaultCategory);
        console.log("Default data seeding completed!");
    } catch (error) {
        throw error;
    }
}

dbSeed().then(() => {
    mongoose.disconnect();
})
    .catch(error => {
        console.log("Error seeding the database:", error);
        mongoose.disconnect();
    });
