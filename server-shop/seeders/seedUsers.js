import bcrypt from 'bcryptjs';
import User from '../models/user_model.js';
import { CONFIG } from './constants.js';
import { generateFakeData } from './utils.js';

export const seedUsers = async () => {
  console.log(`👤 Seeding ${CONFIG.USERS} Users...`);
  const salt = await bcrypt.genSalt(12);
  const hashedPwd = await bcrypt.hash('password123', salt);
  const users = [];

  // Owner, Managers, Staffs
  users.push({ username: 'owner', email: 'owner@shop.com', password: hashedPwd, firstName: 'Chủ', lastName: 'Cửa Hàng', role: 3, isVerified: true, gender: 'male', phone: '0901234567', address: '123 Lê Lợi, TP. HCM' });
  for (let i = 1; i <= 2; i++) users.push({ username: `mgr${i}`, email: `mgr${i}@shop.com`, password: hashedPwd, firstName: 'Quản', lastName: `Lý ${i}`, role: 2, isVerified: true, gender: 'female', phone: `091234567${i}`, address: `${i} CMT8, TP. HCM` });
  for (let i = 1; i <= 6; i++) users.push({ username: `staff${i}`, email: `staff${i}@shop.com`, password: hashedPwd, firstName: 'Nhân', lastName: `Viên ${i}`, role: 1, isVerified: true, gender: 'male', phone: `092234567${i}`, address: `${i} Nguyễn Huệ, TP. HCM` });

  // Customers
  for (let i = 1; i <= CONFIG.USERS; i++) {
    const fakeData = generateFakeData();
    users.push({
      username: `cust${i}`, 
      email: fakeData.email, 
      password: hashedPwd,
      firstName: fakeData.firstName, 
      lastName: fakeData.lastName,
      role: 0, 
      gender: fakeData.gender,
      phone: fakeData.phone,
      address: fakeData.address,
      isVIP: Math.random() < 0.1, 
      isVerified: true, 
      isActive: true
    });
    
    // Batch processing to save memory
    if (users.length >= CONFIG.BATCH_SIZE) { 
      await User.insertMany(users); 
      users.length = 0; 
    }
  }
  
  if (users.length > 0) {
    await User.insertMany(users);
  }
  
  console.log(`   └─ Users seeding completed`);
};
