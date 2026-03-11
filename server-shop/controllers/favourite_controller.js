import favourite_model from "../models/favourite_model.js";
import { asyncHandler } from "../helper/async_handler.js";

export const addFavourite = asyncHandler(async (req, res) => {
    const user_id = req.user._id
    const data = req.body.productId
    const favouriteOfUser = await favourite_model.findOne({ userId: user_id })
    if (favouriteOfUser) {
        const isProductExists = favouriteOfUser.products.includes(data);
        if (isProductExists) {
            return res.status(400).json({ message: "Product already exists in the wishlist." });
        }
        const pushFavourite = await favourite_model.findOneAndUpdate({ _id: favouriteOfUser._id }, { $push: { products: data } }, { new: true })
        return res.status(200).json(pushFavourite);
    }
    else {
        const createFavourite = await favourite_model.create({ userId: user_id, products: [data] })
        return res.status(201).json(createFavourite);
    }
});

export const deleteFavourite = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const productIdToDelete = req.body.productId;

    const updatedFavourite = await favourite_model.findOneAndUpdate(
        { userId: user_id },
        { $pull: { products: productIdToDelete } },
        { new: true }
    );

    if (!updatedFavourite) {
        return res.status(404).json({ message: "No favourite" });
    } else {
        return res.status(200).json(updatedFavourite);
    }
});

export const getFavourite = asyncHandler(async (req, res) => {
    const user_id = req.user._id
    const favourite = await favourite_model.findOne({ userId: user_id }).populate({
        path: "products",
        model: "Product",
        populate: {
            path: "saleId",
            model: "Sale"
        }
    })
    if (!favourite)
        return res.status(404).json({ message: "No favourite" });
    else {
        const now = new Date();
        const productsWithPromotion = favourite.products.map(product => {
            let pricePromotion = 0;
            if (product.saleId && product.saleId.length > 0) {
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
                ...product.toObject(),
                pricePromotion
            };
        });

        return res.status(200).json({
            ...favourite.toObject(),
            products: productsWithPromotion
        });
    }
});