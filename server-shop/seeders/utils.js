// server-shop/seeders/utils.js
import { fakerVI as faker } from '@faker-js/faker';

// Giữ lại các hàm cũ để tương thích với các module khác (như products, ratings)
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-');

// Export instance faker đã được cấu hình chuẩn Việt Nam
export const generateFakeData = () => {
  const gender = randomItem(['male', 'female']);
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);
  const fullName = `${lastName} ${firstName}`;
  
  // Tạo số điện thoại Việt Nam hợp lệ (bắt đầu bằng 09, 08, 03, 07, 05)
  const phonePrefix = randomItem(['09', '08', '03', '07', '05']);
  const phone = `${phonePrefix}${faker.string.numeric(8)}`;
  
  return {
    firstName,
    lastName,
    fullName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone,
    address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    gender
  };
};

export { faker };
