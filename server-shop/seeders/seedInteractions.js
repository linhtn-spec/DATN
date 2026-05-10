import Cart from '../models/cart_model.js';
import Favourite from '../models/favourite_model.js';
import Comment from '../models/comment_model.js';
import Chat from '../models/chat_model.js';
import User from '../models/user_model.js';
import Product from '../models/product_model.js';
import { randomInt, randomItem, faker } from './utils.js';
import { CONFIG } from './constants.js';

export const seedInteractions = async () => {
  console.log('💬 Seeding Carts, Favourites, Comments, and Chats...');

  const users = await User.find({ role: 0 }, '_id').lean();
  const owner = await User.findOne({ role: 3 }, '_id').lean();
  const products = await Product.find({ isActive: true }, '_id').lean();

  if (!users.length || !products.length) return;

  const carts = [];
  const favourites = [];
  const comments = [];
  const chats = [];

  for (const user of users) {
    const rand = Math.random();

    // 1. Carts (30% of users have abandoned carts)
    if (rand < 0.3) {
      const cartItemsCount = randomInt(1, 4);
      const cartProducts = [];
      for (let i = 0; i < cartItemsCount; i++) {
        cartProducts.push({
          productId: randomItem(products)._id,
          quantity: randomInt(1, 5)
        });
      }
      carts.push({ userId: user._id, products: cartProducts });
    }

    // 2. Favourites (50% of users have wishlists)
    if (rand < 0.5) {
      const favItemsCount = randomInt(3, 10);
      const favProducts = [];
      for (let i = 0; i < favItemsCount; i++) {
        favProducts.push(randomItem(products)._id);
      }
      // remove duplicates
      const uniqueFavs = [...new Set(favProducts)];
      favourites.push({ userId: user._id, products: uniqueFavs });
    }

    // 3. Comments (10% users ask questions)
    if (rand < 0.1) {
      comments.push({
        userId: user._id,
        productId: randomItem(products)._id,
        content: randomItem([
          "Trái cây này bảo quản tủ lạnh được bao lâu vậy shop?",
          "Cho mình hỏi có giao hàng hỏa tốc trong 2h không?",
          "Mình mua số lượng lớn có được giảm giá không ạ?",
          "Sản phẩm còn hàng không shop ơi?",
          "Loại này có chứng nhận Organic không?",
          faker.lorem.sentence()
        ]),
        isActive: true,
        createdAt: new Date(Date.now() - randomInt(0, 30) * 86400000)
      });
    }

    // 4. Chats (5% users chat with admin)
    if (rand < 0.05 && owner) {
      const chatMessages = [
        {
          userId: user._id,
          content: "Chào shop, mình muốn hỏi về đơn hàng.",
          isRead: true,
          day: new Date(Date.now() - 2 * 86400000)
        },
        {
          userId: owner._id,
          content: "Chào bạn, shop có thể giúp gì cho bạn ạ?",
          isRead: true,
          day: new Date(Date.now() - 2 * 86400000 + 60000) // 1 min later
        },
        {
          userId: user._id,
          content: "Đơn hàng của mình bao giờ thì giao tới nơi?",
          isRead: false,
          day: new Date(Date.now() - 86400000)
        }
      ];
      chats.push({ roomId: user._id, message: chatMessages });
    }
  }

  // Insert batches
  if (carts.length > 0) {
    const chunkedCarts = [];
    while(carts.length) chunkedCarts.push(carts.splice(0, CONFIG.BATCH_SIZE));
    for (const chunk of chunkedCarts) await Cart.insertMany(chunk);
    console.log(`   └─ Created ${chunkedCarts.reduce((a,b)=>a+b.length,0)} Abandoned Carts`);
  }

  if (favourites.length > 0) {
    const chunkedFavs = [];
    while(favourites.length) chunkedFavs.push(favourites.splice(0, CONFIG.BATCH_SIZE));
    for (const chunk of chunkedFavs) await Favourite.insertMany(chunk);
    console.log(`   └─ Created ${chunkedFavs.reduce((a,b)=>a+b.length,0)} Wishlists`);
  }

  if (comments.length > 0) {
    await Comment.insertMany(comments);
    console.log(`   └─ Created ${comments.length} Product Q&A Comments`);
  }

  if (chats.length > 0) {
    await Chat.insertMany(chats);
    console.log(`   └─ Created ${chats.length} Chat Sessions`);
  }
};
