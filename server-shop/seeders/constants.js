// server-shop/seeders/constants.js

export const CONFIG = {
  USERS: 1800,
  PRODUCTS_MAX: 800,
  ORDERS: 12000,
  REVIEWS: 3500,
  BATCH_SIZE: 500
};

export const CATEGORIES = [
  { name: 'Trái Cây Nội Địa',   description: 'Trái cây tươi ngon từ các vùng miền Việt Nam' },
  { name: 'Trái Cây Nhập Khẩu', description: 'Trái cây cao cấp nhập khẩu từ Úc, Mỹ, New Zealand' },
  { name: 'Sản Phẩm Organic',   description: 'Trái cây trồng theo phương pháp hữu cơ, không hóa chất' },
  { name: 'Combo & Quà Tặng',   description: 'Giỏ quà, hộp quà trái cây sang trọng cho dịp lễ Tết' }
];

export const PRODUCT_DATA = [
  // Trái Cây Nội Địa
  { name: 'Xoài Cát Hòa Lộc',     cat: 'Trái Cây Nội Địa',   basePrice:  85000, unit: 'Kg',  origin: 'Tiền Giang' },
  { name: 'Bưởi Da Xanh',          cat: 'Trái Cây Nội Địa',   basePrice:  65000, unit: 'Kg',  origin: 'Bến Tre' },
  { name: 'Sầu Riêng Ri6',         cat: 'Trái Cây Nội Địa',   basePrice: 160000, unit: 'Kg',  origin: 'Tiền Giang' },
  { name: 'Dâu Tây Đà Lạt',        cat: 'Trái Cây Nội Địa',   basePrice: 280000, unit: 'Hộp', origin: 'Lâm Đồng' },
  { name: 'Cam Sành Hà Giang',      cat: 'Trái Cây Nội Địa',   basePrice:  35000, unit: 'Kg',  origin: 'Hà Giang' },
  { name: 'Thanh Long Ruột Đỏ',    cat: 'Trái Cây Nội Địa',   basePrice:  45000, unit: 'Kg',  origin: 'Bình Thuận' },
  { name: 'Mãng Cầu Xiêm',         cat: 'Trái Cây Nội Địa',   basePrice:  55000, unit: 'Kg',  origin: 'Tây Ninh' },
  // Trái Cây Nhập Khẩu
  { name: 'Cherry Mỹ Đỏ',          cat: 'Trái Cây Nhập Khẩu', basePrice: 480000, unit: 'Kg',  origin: 'USA' },
  { name: 'Táo Envy Size L',        cat: 'Trái Cây Nhập Khẩu', basePrice: 220000, unit: 'Kg',  origin: 'New Zealand' },
  { name: 'Nho Shine Muscat',       cat: 'Trái Cây Nhập Khẩu', basePrice: 950000, unit: 'Kg',  origin: 'Nhật Bản' },
  { name: 'Lê Hàn Quốc Premium',   cat: 'Trái Cây Nhập Khẩu', basePrice: 145000, unit: 'Kg',  origin: 'Hàn Quốc' },
  { name: 'Blueberry Peru',         cat: 'Trái Cây Nhập Khẩu', basePrice: 420000, unit: 'Hộp', origin: 'Peru' },
  { name: 'Kiwi Zespri Vàng',       cat: 'Trái Cây Nhập Khẩu', basePrice: 185000, unit: 'Kg',  origin: 'New Zealand' },
  { name: 'Cam Cara Cara Mỹ',       cat: 'Trái Cây Nhập Khẩu', basePrice: 260000, unit: 'Kg',  origin: 'USA' },
  // Sản Phẩm Organic
  { name: 'Xoài VietGAP Cát Chu',  cat: 'Sản Phẩm Organic',   basePrice:  95000, unit: 'Kg',  origin: 'Đồng Tháp' },
  { name: 'Ổi VietGAP Lê Domaine', cat: 'Sản Phẩm Organic',   basePrice:  45000, unit: 'Kg',  origin: 'Bình Dương' },
  { name: 'Chuối VietGAP Nam Mỹ',  cat: 'Sản Phẩm Organic',   basePrice:  30000, unit: 'Kg',  origin: 'Long An' },
  { name: 'Táo Organic Fuji Nhật', cat: 'Sản Phẩm Organic',   basePrice: 320000, unit: 'Kg',  origin: 'Nhật Bản' },
  { name: 'Cam Organic California', cat: 'Sản Phẩm Organic',   basePrice: 280000, unit: 'Kg',  origin: 'USA' },
  { name: 'Lê Organic Williams Úc', cat: 'Sản Phẩm Organic',   basePrice: 240000, unit: 'Kg',  origin: 'Úc' },
  // Combo & Quà Tặng
  { name: 'Giỏ Quà Tết Sum Vầy',   cat: 'Combo & Quà Tặng',   basePrice: 850000, unit: 'Giỏ', origin: 'Việt Nam' },
  { name: 'Hộp Quà Tết Phú Quý',   cat: 'Combo & Quà Tặng',   basePrice:1200000, unit: 'Hộp', origin: 'Việt Nam' },
  { name: 'Giỏ Quà Tết Bình An',   cat: 'Combo & Quà Tặng',   basePrice: 650000, unit: 'Giỏ', origin: 'Việt Nam' },
  { name: 'Giỏ Quà Biếu Cao Cấp',  cat: 'Combo & Quà Tặng',   basePrice: 980000, unit: 'Giỏ', origin: 'Việt Nam' },
  { name: 'Hộp Quà Trái Cây Ngoại',cat: 'Combo & Quà Tặng',   basePrice:1500000, unit: 'Hộp', origin: 'Nhập Khẩu' },
  { name: 'Giỏ Quà Sức Khỏe Mix',  cat: 'Combo & Quà Tặng',   basePrice: 750000, unit: 'Giỏ', origin: 'Việt Nam' }
];

export const REVIEW_POOL = [
  "Trái cây rất tươi, ngọt lịm. Đóng gói rất kỹ.",
  "Cherry khá tươi nhưng hơi nhỏ so với ảnh một chút.",
  "Xoài chín cây thơm nức mũi, ship rất nhanh.",
  "Giá hơi cao nhưng chất lượng xứng đáng, sẽ ủng hộ tiếp.",
  "Sầu riêng béo ngậy, cơm vàng hạt lép, quá tuyệt vời.",
  "Đóng gói đẹp, làm quà biếu đối tác rất sang trọng.",
  "Giao hàng hơi chậm nhưng trái cây vẫn giữ được độ tươi.",
  "Trái cây sạch, ăn rất yên tâm cho cả gia đình.",
  "Hộp quà sang xịn mịn, nhân viên tư vấn nhiệt tình."
];
