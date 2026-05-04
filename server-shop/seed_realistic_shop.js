import mongoose from 'mongoose';
import Category from './models/category_model.js';
import Product from './models/product_model.js';
import User from './models/user_model.js';
import Order from './models/order_model.js';
import Sale from './models/sale_model.js';
import Rating from './models/rating_model.js';
import Comment from './models/comment_model.js';
import Favourite from './models/favourite_model.js';
import Cart from './models/cart_model.js';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: 'Trái Cây Nhập Khẩu', description: 'Trái cây cao cấp nhập khẩu từ Mỹ, Úc, New Zealand, Hàn Quốc.', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800', order: 1 },
  { name: 'Trái Cây Nội Địa', description: 'Trái cây đặc sản từ khắp các vùng miền Việt Nam.', image: 'https://images.unsplash.com/photo-1596387451750-f7bfb5146152?q=80&w=800', order: 2 },
  { name: 'Giỏ Quà Trái Cây', description: 'Giỏ quà sang trọng, tinh tế cho các dịp lễ, biếu tặng.', image: 'https://images.unsplash.com/photo-1543333309-8ead4af9e48d?q=80&w=800', order: 3 },
  { name: 'Trái Cây Cắt Sẵn', description: 'Tiện lợi, tươi ngon, phục vụ ăn liền.', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=800', order: 4 },
  { name: 'Hạt & Quả Khô', description: 'Sản phẩm hạt dinh dưỡng và trái cây sấy khô cao cấp.', image: 'https://images.unsplash.com/photo-1536592248548-dd0e194883e1?q=80&w=800', order: 5 },
  { name: 'Trái Cây Hữu Cơ (Bio)', description: 'Canh tác hoàn toàn tự nhiên, không hóa chất.', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800', order: 6 },
  { name: 'Combo Đặc Biệt', description: 'Gói sản phẩm tiết kiệm cho gia đình và văn phòng.', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800', order: 7 },
  { name: 'Trái Cây Đồng Giá', description: 'Ưu đãi hấp dẫn với các loại trái cây chất lượng đồng giá.', image: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=800', order: 8 },
  { name: 'Nước Ép Nguyên Chất', description: '100% từ trái cây tươi, không chất bảo quản.', image: 'https://images.unsplash.com/photo-1613478223719-2ab80260f0a0?q=80&w=800', order: 9 },
  { name: 'Sản Phẩm Mới', description: 'Những loại trái cây lạ, mới về hàng trong tuần.', image: 'https://images.unsplash.com/photo-1523472721958-978152f4d69b?q=80&w=800', order: 10 }
];

const productsData = [
  { category: 'Trái Cây Nhập Khẩu', items: [
    { name: 'Nho Mẫu Đơn Shine Muscat', origin: 'Hàn Quốc', unit: 'Chùm', price: 550000, images: ['https://images.unsplash.com/photo-1596515134857-e95f190e3860?q=80'] },
    { name: 'Táo Envy New Zealand', origin: 'New Zealand', unit: 'Kg', price: 195000, images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?q=80'] },
    { name: 'Cherry Mỹ Đỏ', origin: 'Mỹ', unit: 'Hộp 500g', price: 350000, images: ['https://images.unsplash.com/photo-1528821128474-27f9e7d0f2ec?q=80'] },
    { name: 'Kiwi Vàng Zespri', origin: 'New Zealand', unit: 'Kg', price: 165000, images: ['https://images.unsplash.com/photo-1585059895316-188aba482d01?q=80'] },
    { name: 'Việt Quất Peru', origin: 'Peru', unit: 'Hộp 125g', price: 95000, images: ['https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80'] },
    { name: 'Cam Cara Ruột Đỏ', origin: 'Úc', unit: 'Kg', price: 120000, images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80'] },
    { name: 'Dâu Tây Hàn Quốc', origin: 'Hàn Quốc', unit: 'Hộp 330g', price: 280000, images: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80'] },
    { name: 'Lê Hàn Quốc', origin: 'Hàn Quốc', unit: 'Quả', price: 125000, images: ['https://images.unsplash.com/photo-1514756331096-242f397ec03f?q=80'] }
  ]},
  { category: 'Trái Cây Nội Địa', items: [
    { name: 'Xoài Cát Hòa Lộc', origin: 'Tiền Giang', unit: 'Kg', price: 95000, images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?q=80'] },
    { name: 'Sầu Riêng Ri6', origin: 'Bến Tre', unit: 'Kg', price: 180000, images: ['https://images.unsplash.com/photo-1629135334791-3c6674902882?q=80'] },
    { name: 'Bưởi Da Xanh', origin: 'Vĩnh Long', unit: 'Quả', price: 75000, images: ['https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80'] },
    { name: 'Cam Sành', origin: 'Hà Giang', unit: 'Kg', price: 35000, images: ['https://images.unsplash.com/photo-1582231246141-e94184a8c2f5?q=80'] },
    { name: 'Vú Sữa Lò Rèn', origin: 'Tiền Giang', unit: 'Kg', price: 85000, images: ['https://images.unsplash.com/photo-1618161582829-1981878b3bd6?q=80'] },
    { name: 'Dưa Lưới Tabi', origin: 'Tây Ninh', unit: 'Quả', price: 110000, images: ['https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80'] },
    { name: 'Mãng Cầu Xiêm', origin: 'Đồng Tháp', unit: 'Kg', price: 65000, images: ['https://images.unsplash.com/photo-1634645266857-e9a8e0cb2042?q=80'] },
    { name: 'Chôm Chôm Nhãn', origin: 'Đồng Nai', unit: 'Kg', price: 45000, images: ['https://images.unsplash.com/photo-1563821014-99a384592764?q=80'] }
  ]},
  { category: 'Giỏ Quà Trái Cây', items: [
    { name: 'Giỏ Quà Phú Quý', origin: 'Shop Mix', unit: 'Giỏ', price: 1500000, images: ['https://images.unsplash.com/photo-1543333309-8ead4af9e48d?q=80'] },
    { name: 'Giỏ Quà Bình An', origin: 'Shop Mix', unit: 'Giỏ', price: 850000, images: ['https://images.unsplash.com/photo-1511688858344-1854ef90cfa0?q=80'] },
    { name: 'Hộp Quà Cherry Sang Trọng', origin: 'Shop Mix', unit: 'Hộp', price: 1200000, images: ['https://images.unsplash.com/photo-1528821128474-27f9e7d0f2ec?q=80'] },
    { name: 'Giỏ Trái Cây Chúc Mừng', origin: 'Shop Mix', unit: 'Giỏ', price: 650000, images: ['https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80'] },
    { name: 'Lẵng Quà Kết Hợp Rượu', origin: 'Shop Mix', unit: 'Lẵng', price: 2500000, images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80'] }
  ]},
  { category: 'Trái Cây Cắt Sẵn', items: [
    { name: 'Khay Thập Cẩm Nhỏ', origin: 'Bếp Shop', unit: 'Khay', price: 45000, images: ['https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80'] },
    { name: 'Khay Thập Cẩm Lớn', origin: 'Bếp Shop', unit: 'Khay', price: 85000, images: ['https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80'] },
    { name: 'Dưa Hấu Cắt Sẵn', origin: 'Bếp Shop', unit: 'Hộp', price: 35000, images: ['https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?q=80'] },
    { name: 'Thanh Long Cắt Sẵn', origin: 'Bếp Shop', unit: 'Hộp', price: 35000, images: ['https://images.unsplash.com/photo-1527325672341-318456387469?q=80'] }
  ]},
  { category: 'Hạt & Quả Khô', items: [
    { name: 'Hạt Điều Rang Muối', origin: 'Bình Phước', unit: 'Hũ 500g', price: 155000, images: ['https://images.unsplash.com/photo-1536592248548-dd0e194883e1?q=80'] },
    { name: 'Hạt Macca Nứt Vỏ', origin: 'Lâm Đồng', unit: 'Hũ 500g', price: 185000, images: ['https://images.unsplash.com/photo-1623961990059-2831f506c71c?q=80'] },
    { name: 'Hạnh Nhân Rang Bơ', origin: 'Mỹ', unit: 'Hũ 500g', price: 215000, images: ['https://images.unsplash.com/photo-1508815121300-c0bebe10058b?q=80'] },
    { name: 'Trái Cây Sấy Dẻo Mix', origin: 'Việt Nam', unit: 'Gói 200g', price: 75000, images: ['https://images.unsplash.com/photo-1596387451750-f7bfb5146152?q=80'] }
  ]},
  { category: 'Trái Cây Hữu Cơ (Bio)', items: [
    { name: 'Chuối Laba Hữu Cơ', origin: 'Lâm Đồng', unit: 'Nải', price: 45000, images: ['https://images.unsplash.com/photo-1571771894821-ad9958a70c47?q=80'] },
    { name: 'Đu Đủ Ruột Vàng Organic', origin: 'Mỹ Tho', unit: 'Quả', price: 55000, images: ['https://images.unsplash.com/photo-1517282001929-f83614bc50a5?q=80'] },
    { name: 'Bơ Sáp Đắk Lắk Bio', origin: 'Đắk Lắk', unit: 'Kg', price: 85000, images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80'] }
  ]},
  { category: 'Combo Đặc Biệt', items: [
    { name: 'Combo Văn Phòng Mỗi Ngày', origin: 'Shop Mix', unit: 'Combo', price: 250000, images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80'] },
    { name: 'Combo Gia Đình Hạnh Phúc', origin: 'Shop Mix', unit: 'Combo', price: 450000, images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80'] }
  ]},
  { category: 'Nước Ép Nguyên Chất', items: [
    { name: 'Nước Ép Cam Tươi', origin: 'Bếp Shop', unit: 'Chai 330ml', price: 35000, images: ['https://images.unsplash.com/photo-1613478223719-2ab80260f0a0?q=80'] },
    { name: 'Nước Ép Táo Mix Cần Tây', origin: 'Bếp Shop', unit: 'Chai 330ml', price: 45000, images: ['https://images.unsplash.com/photo-1613478223719-2ab80260f0a0?q=80'] },
    { name: 'Nước Ép Dưa Hấu', origin: 'Bếp Shop', unit: 'Chai 330ml', price: 30000, images: ['https://images.unsplash.com/photo-1613478223719-2ab80260f0a0?q=80'] }
  ]}
];

const seedRealisticData = async () => {
  try {
    await mongoose.connect(process.env.URL_DB);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing data (Categories, Products, Orders, Sales, Ratings, etc.)...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Sale.deleteMany({});
    await Rating.deleteMany({});
    await Comment.deleteMany({});
    await Favourite.deleteMany({});
    await Cart.deleteMany({});

    const demoUser = await User.findOne({ username: 'demo_customer' });
    if (!demoUser) {
      console.error('❌ Demo customer not found. Please run seeder.js first.');
      process.exit(1);
    }

    const createdCategories = [];
    for (const catData of categories) {
      const cat = await Category.create(catData);
      createdCategories.push(cat);
      console.log(`➕ Added category: ${cat.name}`);
    }

    const createdProducts = [];
    for (const group of productsData) {
      const category = createdCategories.find(c => c.name === group.category);
      for (const item of group.items) {
        const prod = await Product.create({
          ...item,
          description: `Sản phẩm ${item.name} tươi ngon, chất lượng cao, an toàn vệ sinh thực phẩm.`,
          categoryId: category._id,
          quantity: { inTrade: 200, sold: 0, unSold: 0 }
        });
        createdProducts.push(prod);
        console.log(`   └─ ➕ Added product: ${prod.name}`);
      }
    }

    console.log('🔥 Seeding a "Hot Sale" event...');
    const saleDueDate = new Date();
    saleDueDate.setDate(saleDueDate.getDate() + 7);
    const sale = await Sale.create({
      products: createdProducts.slice(0, 5).map(p => ({
        productId: p._id,
        pricePromotion: 15 // 15% off
      })),
      applyDate: new Date(),
      dueDate: saleDueDate,
      isActive: true
    });
    
    // Link sale to products
    for (const p of sale.products) {
      await Product.findByIdAndUpdate(p.productId, { $push: { saleId: sale._id } });
    }
    console.log(`✅ Created "Hot Sale" with ${sale.products.length} products`);

    console.log('📈 Simulating 1 Year of History (300M VND/month)...');
    const MONTHLY_REVENUE = 300000000;
    let totalRevenue = 0;
    const productSalesTracker = {}; // To update sold count at the end

    for (let m = 0; m < 12; m++) {
      let monthlyVolume = 0;
      const orderBatch = [];
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - m);

      while (monthlyVolume < MONTHLY_REVENUE) {
        const numProducts = Math.floor(Math.random() * 3) + 1;
        const orderProducts = [];
        let orderSubTotal = 0;

        for (let i = 0; i < numProducts; i++) {
          const randProd = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          orderProducts.push({
            productId: randProd._id,
            subPrice: randProd.price * qty,
            quantity: qty
          });
          orderSubTotal += randProd.price * qty;
          
          productSalesTracker[randProd._id] = (productSalesTracker[randProd._id] || 0) + qty;
        }

        const orderDay = new Date(monthDate);
        orderDay.setDate(Math.floor(Math.random() * 28) + 1);

        orderBatch.push({
          userId: demoUser._id,
          firstNameReceiver: 'Khách',
          lastNameReceiver: 'Hàng ' + (Math.floor(Math.random() * 1000) + 1),
          phoneReceiver: '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
          emailReceiver: `customer.${Date.now()}.${Math.random()}@example.com`,
          addressReceiver: 'Số ' + (Math.floor(Math.random() * 500) + 1) + ' Đường Láng, Hà Nội',
          countryReceiver: 'Việt Nam',
          paymentMethod: Math.random() > 0.4 ? 'vnpay' : 'cod',
          shippingMethod: 'standard',
          paymentStatus: 'paid',
          shippingStatus: 'sent',
          orderStatus: 'done',
          products: orderProducts,
          shippingCost: 30000,
          tax: orderSubTotal * 0.05,
          total: orderSubTotal + 30000 + (orderSubTotal * 0.05),
          createdAt: orderDay
        });

        monthlyVolume += orderSubTotal;
      }

      await Order.insertMany(orderBatch);
      totalRevenue += monthlyVolume;
      console.log(`   🗓️ Tháng ${m + 1}/36: Đã tạo ${orderBatch.length} đơn hàng. Doanh thu lũy kế: ${totalRevenue.toLocaleString()} VND`);
    }

    console.log('⚡ Generating Recent/Live Activity (Today)...');
    const liveOrders = [];
    const orderStatuses = ['new', 'processing', 'hold', 'done'];
    for (let i = 0; i < 12; i++) {
      const numProducts = Math.floor(Math.random() * 2) + 1;
      const orderProducts = [];
      let orderSubTotal = 0;

      for (let j = 0; j < numProducts; j++) {
        const randProd = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const qty = 1;
        orderProducts.push({ productId: randProd._id, subPrice: randProd.price * qty, quantity: qty });
        orderSubTotal += randProd.price * qty;
        productSalesTracker[randProd._id] = (productSalesTracker[randProd._id] || 0) + qty;
      }

      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      liveOrders.push({
        userId: demoUser._id,
        firstNameReceiver: 'Khách Đang Đặt',
        lastNameReceiver: '#' + (i + 1),
        phoneReceiver: '0988' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        emailReceiver: `live.${i}@example.com`,
        addressReceiver: 'Quận Cầu Giấy, Hà Nội',
        countryReceiver: 'Việt Nam',
        paymentMethod: Math.random() > 0.5 ? 'vnpay' : 'cod',
        shippingMethod: 'express',
        paymentStatus: status === 'done' || Math.random() > 0.5 ? 'paid' : 'unpaid',
        shippingStatus: status === 'done' ? 'sent' : 'not_sent',
        orderStatus: status,
        products: orderProducts,
        shippingCost: 50000,
        tax: orderSubTotal * 0.05,
        total: orderSubTotal + 50000 + (orderSubTotal * 0.05),
        createdAt: new Date() // Right now
      });
    }
    await Order.insertMany(liveOrders);
    console.log(`✅ Created 12 live orders with mixed statuses.`);

    console.log('🔄 Cập nhật lượt bán (Sold) cho tất cả sản phẩm...');
    for (const prodId of Object.keys(productSalesTracker)) {
      await Product.findByIdAndUpdate(prodId, {
        $set: { 'quantity.sold': productSalesTracker[prodId], 'quantity.inTrade': 100 }
      });
    }

    console.log(`\n🚀 Simulation complete!`);
    console.log(`💰 Total Revenue (3 Years): ${totalRevenue.toLocaleString()} VND`);
    console.log(`📦 Total Orders: ${await Order.countDocuments()}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error during simulation:', error);
    process.exit(1);
  }
};

seedRealisticData();
