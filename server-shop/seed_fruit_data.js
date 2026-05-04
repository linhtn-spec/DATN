import mongoose from 'mongoose';
import Category from './models/category_model.js';
import Product from './models/product_model.js';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  {
    name: 'Trái cây nhiệt đới',
    description: 'Thưởng thức hương vị rực rỡ của vùng nhiệt đới với các loại trái cây tươi ngon nhất.',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=800&auto=format&fit=crop',
    order: 1
  },
  {
    name: 'Trái cây nhập khẩu',
    description: 'Tuyển chọn những loại trái cây thượng hạng từ các quốc gia trên thế giới.',
    image: 'https://images.unsplash.com/photo-1528821128474-27f9e7d0f2ec?q=80&w=800&auto=format&fit=crop',
    order: 2
  },
  {
    name: 'Quả mọng & Đặc sản',
    description: 'Những quả mọng ngọt ngào và các sản phẩm đặc trưng từ các vùng miền.',
    image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=800&auto=format&fit=crop',
    order: 3
  }
];

const products = [
  {
    categoryName: 'Trái cây nhiệt đới',
    items: [
      {
        name: 'Xoài Cát Hòa Lộc',
        description: 'Xoài đặc sản nổi tiếng với vị ngọt thanh, hương thơm đặc trưng và thịt quả mềm mịn.',
        unit: 'Kg',
        origin: 'Tiền Giang, Việt Nam',
        price: 85000,
        quantity: { inTrade: 50, sold: 12, unSold: 38 },
        images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop']
      },
      {
        name: 'Thanh Long Ruột Đỏ',
        description: 'Quả tươi, vị ngọt đậm, chứa nhiều chất chống oxy hóa tốt cho sức khỏe.',
        unit: 'Kg',
        origin: 'Bình Thuận, Việt Nam',
        price: 45000,
        quantity: { inTrade: 100, sold: 45, unSold: 55 },
        images: ['https://images.unsplash.com/photo-1527325672341-318456387469?q=80&w=800&auto=format&fit=crop']
      },
      {
        name: 'Dứa Mật (Khóm)',
        description: 'Dứa có vị ngọt lịm như mật, nhiều nước, giòn và thơm.',
        unit: 'Quả',
        origin: 'Kiên Giang, Việt Nam',
        price: 30000,
        quantity: { inTrade: 80, sold: 10, unSold: 70 },
        images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=800&auto=format&fit=crop']
      }
    ]
  },
  {
    categoryName: 'Trái cây nhập khẩu',
    items: [
      {
        name: 'Táo Envy New Zealand',
        description: 'Táo giòn tan, vị ngọt đậm đà và hương thơm quyến rũ đặc trưng của giống Envy.',
        unit: 'Kg',
        origin: 'New Zealand',
        price: 180000,
        quantity: { inTrade: 40, sold: 25, unSold: 15 },
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?q=80&w=800&auto=format&fit=crop']
      },
      {
        name: 'Nho Mẫu Đơn Shine Muscat',
        description: 'Giống nho cao cấp từ Hàn Quốc, trái to, không hạt, vị ngọt thơm mùi sữa.',
        unit: 'Chùm',
        origin: 'Hàn Quốc',
        price: 450000,
        quantity: { inTrade: 20, sold: 5, unSold: 15 },
        images: ['https://images.unsplash.com/photo-1596515134857-e95f190e3860?q=80&w=800&auto=format&fit=crop']
      }
    ]
  },
  {
    categoryName: 'Quả mọng & Đặc sản',
    items: [
      {
        name: 'Dâu Tây Đà Lạt',
        description: 'Dâu tây tươi ngon được hái tận vườn, màu đỏ căng mọng, vị chua ngọt hài hòa.',
        unit: 'Hộp 500g',
        origin: 'Lâm Đồng, Việt Nam',
        price: 120000,
        quantity: { inTrade: 60, sold: 30, unSold: 30 },
        images: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop']
      },
      {
        name: 'Việt Quất Tươi',
        description: 'Quả việt quất nhập khẩu, giòn, ngọt và chứa nhiều vitamin cần thiết.',
        unit: 'Hộp 125g',
        origin: 'Peru',
        price: 95000,
        quantity: { inTrade: 40, sold: 15, unSold: 25 },
        images: ['https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=800&auto=format&fit=crop']
      }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.URL_DB);
    console.log('✅ Kết nối DB thành công');

    for (const cat of categories) {
      const category = await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
      console.log(`✨ Đã cập nhật danh mục: ${cat.name}`);

      const categoryProducts = products.find(p => p.categoryName === cat.name);
      if (categoryProducts) {
        for (const item of categoryProducts.items) {
          await Product.findOneAndUpdate(
            { name: item.name },
            { ...item, categoryId: category._id },
            { upsert: true }
          );
          console.log(`   └─ ✨ Đã cập nhật sản phẩm: ${item.name}`);
        }
      }
    }

    console.log('🚀 Quá trình seed dữ liệu hoàn tất!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
