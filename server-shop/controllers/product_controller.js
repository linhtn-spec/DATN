// import { upload_image } from "../cloudinary/upload_image.js";
import product_model from "../models/product_model.js";
import { options } from "../paginate/options.js";

export const add_product = async (req, res) => {
    try {
        const data = req.body;

        const checkExistName = await product_model.findOne({ name: { $regex: new RegExp(data.name, 'i') } });
        if (checkExistName) {
            return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
        }
        if (data.images && typeof data.images === 'string') {
            data.images = data.images.match(/https?:\/\/[^,]+?(?=https?:\/\/|,|$)/g) || [data.images];
        }
        const product = await product_model.create(data);
        if (product) {
            return res.status(201).json({ product, message: "Thêm sản phẩm thành công" });
        }
        else {
            return res.status(400).json({ message: error.message });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const edit_product = async (req, res) => {
    const product_id = req.params.id;
    const { name, images, categoryId, quantity, origin, description, isActive, unit, price } = req.body;
    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (isActive !== '') data.isActive = isActive;
    if (images) {
        data.images = typeof images === 'string'
            ? (images.match(/https?:\/\/[^,]+?(?=https?:\/\/|,|$)/g) || [images])
            : images;
    }
    if (categoryId) data.categoryId = categoryId
    if (quantity) data.quantity = quantity
    if (origin) data.origin = origin
    if (unit) data.unit = unit
    if (price) data.price = price

    try {
        const product = await product_model.findOne({ _id: product_id });
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Optimize quantity update
        if (quantity !== undefined) {
            // Ensure product.quantity is an object if we're doing partial updates
            if (typeof product.quantity === 'number') {
                product.quantity = { inTrade: product.quantity, sold: 0, unSold: 0 };
            }

            if (typeof quantity === 'number') {
                data.quantity = {
                    ...product.quantity,
                    inTrade: quantity
                };
            } else {
                data.quantity = quantity;
            }
        }

        if (data.name !== product.name && data.name) {
            const checkExistName = await product_model.findOne({ name: { $regex: new RegExp(data.name, 'iyu') } });
            if (checkExistName) {
                return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
            }
        }

        const updated_product = await product_model.findOneAndUpdate(
            { _id: product_id },
            data,
            { new: true }
        );
        if (updated_product)
            return res.status(200).json({ ...updated_product._doc });
        return res.status(400).json({ message: "Cập nhật thất bại" })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const detail_product = async (req, res) => {
    const product_id = req.params.id;
    console.log(product_id);
    try {
        const product = await product_model.findOne({ _id: product_id })
            .populate({
                path: 'ratingId',
                model: "Rating"
            })
            .populate({
                path: 'saleId',
                model: "Sale"
            })
            .populate('categoryId')
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        else {
            const productDoc = { ...product._doc };
            if (typeof productDoc.quantity === 'number') {
                productDoc.quantity = { inTrade: productDoc.quantity, sold: 0, unSold: 0 };
            }
            return res.status(200).json(productDoc);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_product_one = async (req, res) => {
    const id = req.params.id;
    try {
        console.log(id);
        const data = await product_model.findOneAndDelete({ _id: id });
        if (data) {
            return res.status(200).json({ message: "Xóa sản phẩm thành công" });
        } else {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

export const delete_product_all = async (req, res) => {
    try {
        const data = await product_model.deleteMany({ _id: { $ne: null } });
        if (data) {
            return res.status(200).json({ message: "Xóa sản phẩm thành công" });
        } else {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_product_list = async (req, res) => {
    try {
        const product_id = req.body.product_id;
        if (!product_id || product_id.length === 0) {
            return res.status(400).json({ message: "Vui lòng cung cấp danh sách product_id" });
        }
        const data = await product_model.deleteMany({ _id: { $in: product_id } });

        if (data) {
            return res.status(200).json({ message: "Xóa các sản phẩm thành công" });
        } else {
            return res.status(404).json({ message: "Không tìm thấy các sản phẩm" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const paginate_product = async (req, res) => {
    const { name, origin, categoryId, sortName, page, start_price, end_price, sortPrice, sortDate, limit: queryLimit } = req.query;
    const limit = queryLimit ? parseInt(queryLimit) : 6;
    const skip = (page - 1) * limit;
    const query = {};
    if (name) query.name = new RegExp(name, 'iuy');
    if (origin) query.origin = new RegExp(origin, 'iuy');
    if (categoryId) {
        const parsedCategoryIds = categoryId.split(",").map(id => id.trim());
        query.categoryId = { $in: parsedCategoryIds };
    }
    const sortKind = {};
    if (sortName) {
        sortKind.name = sortName === 'ascend' ? 1 : -1;
    }
    if (sortPrice) {
        sortKind.price = sortPrice === 'ascend' ? 1 : -1;
    }
    if (sortDate) {
        sortKind.createdAt = sortDate === 'ascend' ? 1 : -1;
    }

    if (Object.keys(sortKind).length === 0) {
        sortKind.createdAt = -1;
    }
    let finalQuery = { ...query };
    if (start_price || end_price) {
        finalQuery.price = {}; // Initialize price field
        if (start_price) finalQuery.price.$gte = parseFloat(start_price);
        if (end_price) finalQuery.price.$lte = parseFloat(end_price);
    }
    try {
        const products = await product_model.paginate(finalQuery, {
            offset: skip, page: page, limit: limit, sort: sortKind,
            populate: ["categoryId", "saleId", "ratingId"]
        })


        return res.status(200).json({
            products
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const all_product = async (req, res) => {

    try {
        const data = await product_model.find()
            .populate({
                path: 'ratingId',
                model: "Rating"
            })
            .populate({
                path: 'saleId',
                model: "Sale"
            })
            .populate('categoryId')
        if (data.length === 0) {
            return res.status(404).json({ message: "Không có sản phẩm" });
        }
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}



export const category_product = async (req, res) => {
    const cateName = req.params.name;
    const limit = 9;
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * limit;
    try {
        const dataAll = await product_model.find({ category_name: cateName }).sort({ createdAt: -1 });
        const data = dataAll.slice(skip, skip + limit);
        if (dataAll.length === 0) {
            return res.status(404).json({ message: "Không có sản phẩm" });
        }
        else {
            const total_page = Math.ceil(dataAll.length / limit);
            const product_list = data.map((product) => ({
                product_id: product.product_id,
                title: product.title,
                price: product.price,
                description: product.description,
                qty: product.qty,
                category_name: product.category_name,
                thumbnail: product.thumbnail,
                price_promotion: product.price_promotion,
                unit: product.unit,
                status: product.status
            })
            );
            return res.status(200).json({ product_list, total_page: total_page, total_product: dataAll.length, page: page });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const new_product = async (req, res) => {
    try {
        const data = await product_model.find({ isActive: true }).sort({ createdAt: -1 });
        if (data.length === 0) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        else {

            return res.status(200).json({ data });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const recommend_product = async (req, res) => {
    const product_id = req.params.id
    try {
        const product = await product_model.findById(product_id)
        const dataRecommend = await product_model.find({
            $or: [
                { categoryId: product.categoryId },
                { price: { $gte: product.price - 50, $lte: product.price + 50 } }
            ]
        });

        if (dataRecommend.length === 0) {
            return res.status(404).json({ message: "Không có sản phẩm gợi ý" });
        }
        else {
            return res.status(200).json(dataRecommend);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const product_by_category = async (req, res) => {
    try {
        const category_id = req.params.category_id
        const data = await product_model.paginate({ categoryId: category_id }, {
            ...options, populate: "categoryId"
        });
        if (data.totalDocs === 0) {
            return res.status(404).json({ message: "Không có sản phẩm" });
        }
        return res.status(200).json({ ...data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const product_may_like = async (req, res) => {
    const productId = req?.query?.id
    const hasProductId = productId && productId.trim() !== '';
    try {
        if (hasProductId) {
            const toCategory = await product_model.findById(productId)
            if (!toCategory) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            }

            const dataToCategory = await product_model.find({
                categoryId: toCategory.categoryId,
                _id: { $ne: productId },
                isActive: true
            }).limit(10);

            const topSold = await product_model.find({
                'quantity.sold': { $gt: 0 },
                isActive: true,
                _id: { $ne: productId }
            }).populate('saleId').sort({
                'quantity.sold': -1
            }).limit(10);

            // Merge and deduplicate
            const combined = [...dataToCategory, ...topSold];
            const uniqueData = Array.from(new Map(combined.map(item => [item._id.toString(), item])).values());

            return res.status(200).json(uniqueData);
        }
        else {
            // Home page recommendations: Top sold + Newest if needed
            let data = await product_model.find({
                'quantity.sold': { $gt: 0 },
                isActive: true
            }).populate('saleId').sort({
                'quantity.sold': -1
            }).limit(5);

            if (data.length < 5) {
                const existing = data.map(i => i._id);
                const recent = await product_model.find({
                    _id: { $nin: existing },
                    isActive: true
                }).sort({ createdAt: -1 }).limit(5 - data.length);
                data = [...data, ...recent];
            }

            return res.status(200).json(data)
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
