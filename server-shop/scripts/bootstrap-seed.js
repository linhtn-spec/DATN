import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import user_model from '../models/user_model.js';

dotenv.config();

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;

async function run() {
  const email = process.env.EMAIL_DEFAULT;
  const username = process.env.USERNAME_DEFAULT;
  const password = process.env.PASSWORD_DEFAULT;
  if (!email || !username || !password) {
    console.log('Bootstrap: missing EMAIL_DEFAULT/USERNAME_DEFAULT/PASSWORD_DEFAULT; skipping.');
    return;
  }

  try {
    await mongoose.connect(process.env.URL_DB);
    console.log('Bootstrap: connected to DB');

    const existing = await user_model.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      console.log('Bootstrap: default admin already exists; nothing to do.');
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = {
      firstName: process.env.FIRST_NAME_DEFAULT || 'Admin',
      lastName: process.env.LAST_NAME_DEFAULT || 'User',
      username,
      email,
      password: hashed,
      role: Number(process.env.ROLE_DEFAULT) || 3,
      gender: process.env.GENDER || 'male',
      isActive: true
    };

    const created = await user_model.create(newUser);
    if (created) {
      const dataForRefreshToken = { username: created.username, user_id: created._id };
      const refreshToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
      if (refreshToken) {
        await user_model.findByIdAndUpdate(created._id, { refreshToken });
      }
      console.log('Bootstrap: default admin created:', email);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Bootstrap error:', err && err.message ? err.message : err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(0);
  }
}

run();
