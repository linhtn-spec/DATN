import Rating from '../models/rating_model.js';
import Product from '../models/product_model.js';
import User from '../models/user_model.js';
import Order from '../models/order_model.js';
import TaxConfig from '../models/tax_model.js';
import ShippingConfig from '../models/shipping_model.js';
import Banner from '../models/banner_model.js';
import Blog from '../models/blog_model.js';
import Sale from '../models/sale_model.js';
import StockAdjustment from '../models/stock_adjustment_model.js';
import Consignment from '../models/consignment_model.js';
import Withdrawal from '../models/withdrawal_model.js';

import { CONFIG, REVIEW_POOL } from './constants.js';
import { randomInt, randomItem } from './utils.js';

export const seedConfigs = async () => {
  console.log('⚙️  Seeding Configs...');
  await TaxConfig.create({ label: 'VAT', rate: 0.08, description: 'Thuế giá trị gia tăng 8%' });
  await ShippingConfig.insertMany([
    { method: 'standard', fee: 30000, description: 'Giao hàng tiêu chuẩn 2-3 ngày' },
    { method: 'express',  fee: 50000, description: 'Giao hàng hỏa tốc trong ngày' },
    { method: 'free',     fee: 0,     description: 'Miễn phí giao hàng cho đơn trên 1tr' }
  ]);
  console.log('   └─ Tax & Shipping configs created');
};

export const seedBannersAndBlogs = async () => {
  console.log('📰 Seeding Banners & Blogs...');

  // 5 banners với ảnh chất lượng cao từ Unsplash (stable, không bị block)
  await Banner.insertMany([
    {
      title: 'Trái Cây Tươi Mỗi Ngày',
      description: 'Cam kết 100% trái cây tươi ngon, giao hàng nhanh trong 2-4 giờ. Đặt hàng ngay hôm nay!',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1920&q=80',
      isActive: true,
      order: 1
    },
    {
      title: 'Mùa Hè - Hoa Quả Ngoại Nhập Siêu Ngon',
      description: 'Cherry Mỹ, Nho Nhật, Blueberry Peru — giảm đến 30% trong tháng này. Số lượng có hạn!',
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1920&q=80',
      isActive: true,
      order: 2
    },
    {
      title: 'Giỏ Quà Biếu Tết 2025',
      description: 'Gói quà sang trọng từ 650.000đ — Lựa chọn hoàn hảo cho đối tác, gia đình và người thân.',
      image: 'https://images.unsplash.com/photo-1543158266-0066955047b1?w=1920&q=80',
      isActive: true,
      order: 3
    },
    {
      title: 'Organic & VietGAP — Sức Khỏe Từ Thiên Nhiên',
      description: 'Sản phẩm hữu cơ 100% không thuốc trừ sâu, được chứng nhận VietGAP. An toàn cho cả gia đình.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80',
      isActive: true,
      order: 4
    },
    {
      title: 'Đặc Sản Miền Tây Chính Gốc',
      description: 'Xoài Cát Hòa Lộc, Sầu Riêng Ri6, Bưởi Da Xanh — thẳng từ vườn đến tay bạn.',
      image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=1920&q=80',
      isActive: true,
      order: 5
    }
  ]);
  console.log('   └─ 5 banners created');

  const owner = await User.findOne({ role: 3 }).lean();
  if (owner) {
    await Blog.insertMany([
      {
        title: 'Lợi ích của việc ăn trái cây mỗi ngày',
        user: { userId: owner._id, firstName: owner.firstName, lastName: owner.lastName },
        content: 'Trái cây chứa rất nhiều vitamin và khoáng chất cần thiết cho cơ thể. Việc duy trì thói quen ăn trái cây mỗi ngày giúp tăng cường hệ miễn dịch, cải thiện hệ tiêu hóa và giảm nguy cơ mắc các bệnh mãn tính. Theo khuyến nghị của WHO, mỗi người nên ăn ít nhất 400g trái cây và rau củ mỗi ngày.',
        order: 1
      },
      {
        title: 'Cách chọn xoài Cát Hòa Lộc chuẩn nhất',
        user: { userId: owner._id, firstName: owner.firstName, lastName: owner.lastName },
        content: 'Xoài Cát Hòa Lộc là loại xoài ngon nhất miền Tây, nổi tiếng với vị ngọt thanh và thơm đặc trưng. Để chọn được quả xoài chín cây, hãy chú ý: vỏ căng bóng không bị nhăn, màu vàng đều, có mùi thơm nhẹ ở cuống, và khi ấn nhẹ cảm thấy đàn hồi chứ không bị mềm nhão.',
        order: 2
      },
      {
        title: 'Top 5 loại trái cây tốt nhất cho sức đề kháng mùa hè',
        user: { userId: owner._id, firstName: owner.firstName, lastName: owner.lastName },
        content: 'Mùa hè nắng nóng cần bổ sung vitamin C và các chất chống oxy hóa để tăng sức đề kháng. 5 loại trái cây bạn nên ăn nhiều hơn trong mùa này: Cam, Dâu tây, Kiwi, Ổi và Thanh long. Tất cả đều có sẵn tại cửa hàng chúng tôi với mức giá phải chăng.',
        order: 3
      }
    ]);
    console.log('   └─ 3 blogs created');
  }
};

export const seedRatings = async () => {
  console.log(`⭐ Seeding ${CONFIG.REVIEWS} Ratings...`);
  const allProducts  = await Product.find({}, '_id').lean();
  const allCustomers = await User.find({ role: 0 }, '_id').lean();
  const ratings = [];
  let ratingCount = 0;

  const flushRatings = async () => {
    if (ratings.length === 0) return;
    const inserted = await Rating.insertMany(ratings);
    const bulkOps  = inserted.map(r => ({
      updateOne: { filter: { _id: r.productId }, update: { $push: { ratingId: r._id } } }
    }));
    await Product.bulkWrite(bulkOps);
    ratings.length = 0;
  };

  const cursor = Order.find({}, 'createdAt').limit(CONFIG.REVIEWS * 2).cursor();
  for await (const order of cursor) {
    if (ratingCount >= CONFIG.REVIEWS) break;
    ratings.push({
      stars:     Math.random() < 0.8 ? randomInt(4, 5) : randomInt(3, 4),
      userId:    randomItem(allCustomers)._id,
      productId: randomItem(allProducts)._id,
      content:   randomItem(REVIEW_POOL),
      isActive:  true,
      createdAt: order.createdAt
    });
    ratingCount++;
    if (ratings.length >= CONFIG.BATCH_SIZE) await flushRatings();
  }
  await flushRatings();
  console.log(`   └─ ${ratingCount} ratings created`);
};

export const seedSalesAndStock = async () => {
  console.log('📉 Seeding Sales & Stock Adjustments...');
  const allProducts = await Product.find({}, '_id').lean();

  if (allProducts.length > 0) {
    const now = new Date();

    // 3 đợt khuyến mãi đang hoạt động với sản phẩm khác nhau
    const saleConfigs = [
      {
        label: 'Flash Sale Cuối Tuần',
        products: allProducts.slice(0, 20),
        discount: { min: 20, max: 35 },
        applyDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        dueDate:   new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      },
      {
        label: 'Khuyến Mãi Mùa Hè',
        products: allProducts.slice(20, 40),
        discount: { min: 10, max: 25 },
        applyDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        dueDate:   new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        label: 'Trái Cây Organic Giảm Giá',
        products: allProducts.slice(40, 60),
        discount: { min: 5, max: 15 },
        applyDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueDate:   new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      }
    ];

    for (const cfg of saleConfigs) {
      if (cfg.products.length === 0) continue;
      const saleProducts = cfg.products.map(p => ({
        productId: p._id,
        pricePromotion: randomInt(cfg.discount.min, cfg.discount.max)
      }));

      const sale = await Sale.create({
        products: saleProducts,
        applyDate: cfg.applyDate,
        dueDate:   cfg.dueDate,
        isActive:  true
      });

      // Gắn saleId vào từng sản phẩm để route /sale/lastest/products hoạt động
      await Product.bulkWrite(cfg.products.map(p => ({
        updateOne: { filter: { _id: p._id }, update: { $push: { saleId: sale._id } } }
      })));

      console.log(`   └─ Sale "${cfg.label}" tạo thành công (${saleProducts.length} sản phẩm)`);
    }
  }

  // Stock adjustments — lấy cả staff lẫn manager để tránh trường hợp thiếu
  const staffUsers = await User.find({ role: { $in: [1, 2] } }, '_id').lean();
  const allProds   = await Product.find({}, '_id price').limit(30).lean();
  const REASONS    = ['damaged', 'expired', 'other'];
  const NOTES      = {
    damaged: 'Dập nát trong quá trình vận chuyển',
    expired: 'Hết hạn sử dụng, hủy theo quy định',
    other:   'Lý do khác, ghi chú nội bộ'
  };

  if (staffUsers.length > 0 && allProds.length > 0) {
    const stockAdjustments = [];
    for (let i = 0; i < 15; i++) {
      const reason = REASONS[i % REASONS.length];
      const prod   = allProds[i % allProds.length];
      const qty    = randomInt(2, 20);
      stockAdjustments.push({
        userId:         randomItem(staffUsers)._id,
        products:       [{ productId: prod._id, quantity: qty, reason, note: NOTES[reason] }],
        adjustmentDate: new Date(Date.now() - randomInt(0, 180) * 86400000),
        totalLoss:      prod.price * qty
      });
    }
    await StockAdjustment.insertMany(stockAdjustments);
    console.log(`   └─ ${stockAdjustments.length} stock adjustments created`);
  }
};

export const seedFinance = async () => {
  console.log('💰 Seeding Consignments & Withdrawals...');
  const owner    = await User.findOne({ role: 3 }).lean();
  const manager  = await User.findOne({ role: 2 }).lean();
  const products = await Product.find({}, '_id price').limit(10).lean();

  const financialUser = owner || manager;
  if (!financialUser || products.length === 0) {
    console.log('   └─ No owner/manager found, skipping finance seed');
    return;
  }

  // 3 đợt nhập hàng ở các thời điểm khác nhau
  const consignmentDates = [
    new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  ];

  for (let i = 0; i < consignmentDates.length; i++) {
    const batch = products.slice(0, 5);
    const expireDate = new Date(consignmentDates[i].getTime() + 90 * 24 * 60 * 60 * 1000);
    await Consignment.create({
      userId:     financialUser._id,
      products:   batch.map(p => ({
        productId:   p._id,
        quantity:    randomInt(200, 600),
        importMoney: Math.round(p.price * 0.6),
        expireDate
      })),
      money:      randomInt(30, 80) * 1000000,
      importDate: consignmentDates[i]
    });
  }
  console.log('   └─ 3 consignments created');

  // 5 lần rút tiền với trạng thái phong phú
  const withdrawalStatuses = ['completed', 'completed', 'completed', 'pending', 'canceled'];
  for (let i = 0; i < withdrawalStatuses.length; i++) {
    await Withdrawal.create({
      userId:        financialUser._id,
      amount:        randomInt(5, 20) * 1000000,
      bankName:      'Vietcombank',
      accountNumber: '1234567890',
      accountHolder: 'NGUYEN VAN OWNER',
      status:        withdrawalStatuses[i],
      note:          `Rút lợi nhuận tháng ${i + 1}`
    });
  }
  console.log('   └─ 5 withdrawals created');
};
