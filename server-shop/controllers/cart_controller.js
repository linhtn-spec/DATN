import cart_model from "../models/cart_model.js";
import { asyncHandler } from "../helper/async_handler.js";

// Get user cart
export const get_cart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    let cart = await cart_model.findOne({ userId }).populate({
        path: "products.productId",
        model: "Product",
        select: 'name price quantity origin images',
        populate: {
            path: "saleId",
            model: "Sale"
        }
    });

    if (!cart) {
        cart = await cart_model.create({ userId, products: [] });
        return res.status(200).json(cart);
    }

    const now = new Date();
    const productsWithPromotion = cart.products.map(p => {
        const product = p.productId;
        let pricePromotion = 0;
        if (product && product.saleId && product.saleId.length > 0) {
            const activeSale = product.saleId.find(sale =>
                sale.isActive &&
                new Date(sale.applyDate) <= now &&
                (!sale.dueDate || new Date(sale.dueDate) >= now)
            );

            if (activeSale) {
                const saleProduct = activeSale.products.find(sp =>
                    sp.productId.toString() === product._id.toString()
                );
                if (saleProduct) {
                    pricePromotion = saleProduct.pricePromotion;
                }
            }
        }
        return {
            ...p.toObject(),
            productId: {
                ...product.toObject(),
                pricePromotion
            }
        };
    });

    return res.status(200).json({
        ...cart.toObject(),
        products: productsWithPromotion
    });
});

// Sync local cart to DB
export const sync_cart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { products } = req.body; // Array of { productId, quantity }

    // Get existing cart
    let cart = await cart_model.findOne({ userId });

    let dbProductsMap = new Map();
    if (cart) {
        cart.products.forEach(p => {
            dbProductsMap.set(p.productId.toString(), p.quantity);
        });
    }

    if (products && Array.isArray(products)) {
        for (let p of products) {
            if (p.productId && p.quantity > 0) {
                dbProductsMap.set(p.productId.toString(), p.quantity);
            }
        }
    }

    const mergedProducts = [];
    for (let [productId, quantity] of dbProductsMap.entries()) {
        mergedProducts.push({ productId, quantity });
    }

    // Use findOneAndUpdate with upsert to avoid VersionError
    const updatedCart = await cart_model.findOneAndUpdate(
        { userId },
        { $set: { products: mergedProducts } },
        { new: true, upsert: true }
    ).populate({
        path: "products.productId",
        model: "Product",
        select: 'name price quantity origin images',
        populate: {
            path: "saleId",
            model: "Sale"
        }
    });

    const now = new Date();
    const productsWithPromotion = updatedCart.products.map(p => {
        const product = p.productId;
        let pricePromotion = 0;
        if (product && product.saleId && product.saleId.length > 0) {
            const activeSale = product.saleId.find(sale =>
                sale.isActive &&
                new Date(sale.applyDate) <= now &&
                (!sale.dueDate || new Date(sale.dueDate) >= now)
            );

            if (activeSale) {
                const saleProduct = activeSale.products.find(sp =>
                    sp.productId.toString() === product._id.toString()
                );
                if (saleProduct) {
                    pricePromotion = saleProduct.pricePromotion;
                }
            }
        }
        return {
            ...p.toObject(),
            productId: {
                ...product.toObject(),
                pricePromotion
            }
        };
    });

    return res.status(200).json({
        ...updatedCart.toObject(),
        products: productsWithPromotion
    });
});

// Add/Update single item in cart
export const update_cart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number') {
         return res.status(400).json({ message: "Invalid product or quantity" });
    }

    let cart = await cart_model.findOne({ userId });
    if (!cart) {
        cart = await cart_model.create({ userId, products: [] });
    }

    const itemIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (itemIndex > -1) {
        if (quantity <= 0) {
            cart.products.splice(itemIndex, 1);
        } else {
            cart.products[itemIndex].quantity = quantity;
        }
    } else {
        if (quantity > 0) {
            cart.products.push({ productId, quantity });
        }
    }

    await cart.save();
    
    // Refetch and populate for enriched data
    const updatedCart = await cart_model.findOne({ userId }).populate({
        path: "products.productId",
        model: "Product",
        select: 'name price quantity origin images',
        populate: {
            path: "saleId",
            model: "Sale"
        }
    });

    const now = new Date();
    const productsWithPromotion = updatedCart.products.map(p => {
        const product = p.productId;
        let pricePromotion = 0;
        if (product && product.saleId && product.saleId.length > 0) {
            const activeSale = product.saleId.find(sale =>
                sale.isActive &&
                new Date(sale.applyDate) <= now &&
                (!sale.dueDate || new Date(sale.dueDate) >= now)
            );

            if (activeSale) {
                const saleProduct = activeSale.products.find(sp =>
                    sp.productId.toString() === product._id.toString()
                );
                if (saleProduct) {
                    pricePromotion = saleProduct.pricePromotion;
                }
            }
        }
        return {
            ...p.toObject(),
            productId: {
                ...product.toObject(),
                pricePromotion
            }
        };
    });

    return res.status(200).json({
        ...updatedCart.toObject(),
        products: productsWithPromotion
    });
});

// Remove single item from cart
export const remove_item = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const productId = req.params.productId;

    let cart = await cart_model.findOne({ userId });
    if (cart) {
        cart.products = cart.products.filter(p => p.productId.toString() !== productId);
        await cart.save();
    }

    return res.status(200).json(cart);
});

// Clear cart
export const clear_cart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    let cart = await cart_model.findOne({ userId });
    if (cart) {
        cart.products = [];
        await cart.save();
    }
    return res.status(200).json({ message: "Cart cleared" });
});
