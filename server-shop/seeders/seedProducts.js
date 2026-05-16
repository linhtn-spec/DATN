import Category from '../models/category_model.js';
import Product from '../models/product_model.js';
import { CATEGORIES, PRODUCT_DATA, CONFIG } from './constants.js';
import { randomInt, slugify, faker } from './utils.js';

export const seedCategories = async () => {
  console.log('🏗️  Seeding Categories...');
  const docs = CATEGORIES.map((c, i) => {
    let keyword = 'fruit';
    if (c.name.includes('Nội Địa')) keyword = 'tropical,fruit';
    if (c.name.includes('Nhập Khẩu')) keyword = 'berries,fruit';
    if (c.name.includes('Organic')) keyword = 'organic,fruit';
    if (c.name.includes('Quà')) keyword = 'fruit,basket';

    return {
      name: c.name, description: c.description,
      image: `https://loremflickr.com/800/600/${keyword}?lock=${i+1}`,
      order: i + 1, isActive: true
    };
  });
  await Category.insertMany(docs);
  console.log(`   └─ ${docs.length} categories created`);
};

export const seedProducts = async () => {
  console.log('🍎 Seeding Products...');
  const categories = await Category.find().lean();
  
  // Build map name -> _id for O(1) lookup
  const catMap = {};
  for (const c of categories) catMap[c.name] = c._id;

  const qualityVariants = [
    { suffix: 'L1',  label: 'Loại 1',  priceMult: 1.0 },
    { suffix: 'PRE', label: 'Premium', priceMult: 1.4 },
    { suffix: 'ORG', label: 'Organic', priceMult: 1.6 }
  ];
  
  const weightVariants = [
    { wSuffix: '500G', wLabel: '500g',       wFactor: 0.55 },
    { wSuffix: '1KG',  wLabel: '1kg',        wFactor: 1.0  },
    { wSuffix: '5KG',  wLabel: 'Thùng 5kg',  wFactor: 4.2  }
  ];

  const products = [];
  let skuCounter = 1; // Sequential counter guarantees uniqueness
  
  outer: for (const base of PRODUCT_DATA) {
    const catId = catMap[base.cat];
    if (!catId) {
      console.warn(`   ⚠ Category not found for: "${base.cat}" — skipping ${base.name}`);
      continue;
    }
    
    for (const q of qualityVariants) {
      for (const w of weightVariants) {
        if (products.length >= CONFIG.PRODUCTS_MAX) break outer;
        
        const name = `${base.name} ${q.label} ${w.wLabel}`;
        // Use sequential counter to guarantee globally unique SKUs
        const prefix = slugify(base.name).replace(/-/g, '').slice(0, 4).toUpperCase() || 'PROD';
        const sku  = `${prefix}-${q.suffix}-${w.wSuffix}-${String(skuCounter++).padStart(4, '0')}`;
        
        // Sinh mô tả sản phẩm hấp dẫn và thực tế hơn với Faker
        const fakeDesc = faker.lorem.paragraph(2) + " " + faker.commerce.productDescription();
        const description = `${name} được tuyển chọn kỹ lưỡng, đảm bảo độ tươi ngon nhất. Nguồn gốc từ vùng đất ${base.origin}. Đặc điểm nổi bật: ${fakeDesc}`;
        
        // Map từ khóa trái cây để ảnh trông chân thực nhất
        let keyword = 'fruit';
        const lowerName = base.name.toLowerCase();
        if (lowerName.includes('xoài')) keyword = 'mango';
        else if (lowerName.includes('bưởi')) keyword = 'pomelo';
        else if (lowerName.includes('sầu riêng')) keyword = 'durian';
        else if (lowerName.includes('dâu')) keyword = 'strawberry';
        else if (lowerName.includes('cam')) keyword = 'orange,fruit';
        else if (lowerName.includes('thanh long')) keyword = 'dragonfruit';
        else if (lowerName.includes('mãng cầu')) keyword = 'soursop';
        else if (lowerName.includes('cherry')) keyword = 'cherry,fruit';
        else if (lowerName.includes('táo')) keyword = 'apple,fruit';
        else if (lowerName.includes('nho')) keyword = 'grape,fruit';
        else if (lowerName.includes('lê')) keyword = 'pear,fruit';
        else if (lowerName.includes('blueberry')) keyword = 'blueberry';
        else if (lowerName.includes('kiwi')) keyword = 'kiwi,fruit';
        else if (lowerName.includes('chuối')) keyword = 'banana';
        else if (lowerName.includes('ổi')) keyword = 'guava';
        else if (lowerName.includes('quà')) keyword = 'gift,basket';

        products.push({
          name, sku,
          description,
          unit: w.wLabel, origin: base.origin,
          price: Math.round((base.basePrice * q.priceMult * w.wFactor) / 1000) * 1000,
          quantity: { sold: randomInt(50, 1000), inTrade: randomInt(100, 500), unSold: 0 },
          categoryId: catId,
          images: [
            `https://loremflickr.com/800/600/${keyword}?lock=${randomInt(1, 1000)}`, 
            `https://loremflickr.com/800/600/${keyword}?lock=${randomInt(1001, 2000)}`
          ],
          tags: ['trái cây', slugify(base.cat), q.label.toLowerCase(), w.wLabel],
          isActive: true
        });
      }
    }
  }
  
  // ordered:false means if one doc fails validation, others still get inserted
  await Product.insertMany(products, { ordered: false });
  console.log(`   └─ ${products.length} products created`);

  // Verify each category has products
  for (const c of categories) {
    const count = products.filter(p => p.categoryId.toString() === c._id.toString()).length;
    console.log(`   └─ ${c.name}: ${count} products`);
  }
};
