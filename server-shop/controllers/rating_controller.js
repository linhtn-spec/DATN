import rating_model from "../models/rating_model.js"
import product_model from "../models/product_model.js";
import user_model from "../models/user_model.js";


export const add_rating = async (req, res) => {
    const { stars, productId } = req.body;
    const userId = req.user._id
    try {
        const checkExistProduct = await product_model.findById(productId);
        if (!checkExistProduct) {
            return res.status(404).json({ message: "Product not existed!" });
        }

        const checkExistedRating = await rating_model.findOne({ userId: userId, productId: productId })
        if (checkExistedRating) return res.status(409).json({ message: "You have rated this product" });

        const newRating = await rating_model.create({ stars, productId, userId })
        if (!newRating) {
            return res.status(404).json({ message: "Rate a product unsuccessfully" });
        }
        await product_model.findOneAndUpdate(
            { _id: productId },
            { $push: { ratingId: newRating._id } }
        );

        return res.status(201).json({ message: "Rate a product successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const update_rating = async (req, res) => {
    const { isActive } = req.body;
    const ratingId = req.params.id
    try {
        const rating = await rating_model.findById(ratingId)
        if (!rating) {
            return res.status(404).json({ message: "Rating does not exist" });
        }

        const updatedRating = await rating_model.findOneAndUpdate(
            { _id: ratingId },
            { isActive: isActive },
            { new: true }
        );
        if (updatedRating)
            return res.status(200).json({ ...updatedRating._doc });
        return res.status(400).json({ message: "Update unsuccessfully " })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const detail_rating = async (req, res) => {
    try {
        const ratingId = req.params.id;
        const data = await rating_model.findOne({ _id: ratingId }).populate("productId").populate({
            path: 'userId',
            model: 'User',
            select: 'firstName lastName _id'
        })
        if (!data) {
            return res.status(404).json({ message: "Rating no exist" });
        }
        return res.status(200).json({
            ...data._doc
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const paginate_rating = async (req, res) => {
    const { page, sortStar, sortDate, isActive, name } = req.query
    const limit = 6;
    const skip = (page - 1) * limit;
    let sortKind = {};
    if (sortStar) {
        if (sortStar === 'ascend') {
            sortKind.stars = 1;
        } else {
            sortKind.stars = -1;
        }
    }
    if (sortDate) {
        if (sortDate === 'ascend') {
            sortKind.createdAt = 1;
        } else {
            sortKind.createdAt = -1;
        }
    }
    const fullNameRegex = new RegExp(name, "iuy");
    const userQuery = name ? {
        $or: [
            { firstName: fullNameRegex },
            { lastName: fullNameRegex }
        ]
    } : {};
    try {
        const users = name ? await user_model.find(userQuery) : [];

        const userIds = users.map(user => user._id);

        // Nếu tìm kiếm theo tên nhưng không có user nào khớp → trả rỗng ngay
        if (name && userIds.length === 0) {
            return res.status(404).json({ message: "No rating" });
        }

        let ratingQuery = {}
        if (userIds.length)
            ratingQuery.userId = { $in: userIds }
        if (isActive) {
            ratingQuery.isActive = isActive;
        }
        const dataAll = await rating_model.paginate(ratingQuery, {
            offset: skip, page: page, limit: limit, sort: sortKind,
            populate: {
                path: "userId",
                model: "User",
                select: "firstName lastName"
            }
        });
        if (dataAll.totalDocs === 0) {
            return res.status(404).json({ message: "No rating" });
        }
        return res.status(200).json({ ...dataAll });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const all_rating = async (req, res) => {
    try {
        const data = await rating_model.find({});
        if (data.length === 0) {
            return res.status(404).json({ message: "No rating" });
        }
        else return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const rating_product = async (req, res) => {
    const product_id = req.params.product_id
    console.log(product_id);
    const { page, sortStar, sortDate, isActive, name } = req.query
    const limit = 6;
    const skip = (page - 1) * limit;
    const query = {}
    query.productId = product_id
    if (isActive) query.isActive = isActive
    let sortKind = {};
    if (sortStar) {
        if (sortStar === 'ascend') {
            sortKind.stars = 1;
        } else {
            sortKind.stars = -1;
        }
    }
    if (sortDate) {
        if (sortDate === 'ascend') {
            sortKind.createdAt = 1;
        } else {
            sortKind.createdAt = -1;
        }
    }
    const fullNameRegex = new RegExp(name, "iuy");
    const userQuery = name ? {
        $or: [
            { firstName: fullNameRegex },
            { lastName: fullNameRegex }
        ]
    } : {};
    try {
        const users = name ? await user_model.find(userQuery) : [];

        const userIds = users.map(user => user._id);
        let ratingQuery = {}
        if (userIds.length)
            ratingQuery.userId = { $in: userIds }

        const data = await rating_model.paginate({ ...query, ...ratingQuery }, {
            offset: skip, page: page, limit: limit, sort: sortKind,
            populate: [{
                path: "userId",
                model: "User",
                select: "-password -refreshToken"
            },
            {
                path: "productId",
                model: "Product",
                select: "-quantity"
            }
            ]

        })
        if (data.docs === 0) {
            return res.status(404).json({ message: "No rating" });
        }
        else return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}