import product_model from "../models/product_model.js";
import consignment_model from "../models/consignment_model.js";

export const add_consignment = async (req, res) => {
    const { products, importDate, money } = req.body;
    const userId = req.user._id
    try {
        const productPromises = products.map(async item => {
            return await product_model.findById(item?.productId);
        });
        const productResults = await Promise.all(productPromises);
        const nonExistentProducts = productResults.some(result => !result);
        if (nonExistentProducts) {
            return res.status(404).json({ message: "One or more products not existed." });
        }
        const createdResult = await consignment_model.create({ products, importDate: new Date(importDate), money, userId })
        for (const item of products) {
            const product = await product_model.findById(item.productId);
            if (product && typeof product.quantity === 'number') {
                // Migrate to object format on-the-fly
                await product_model.findByIdAndUpdate(item.productId, {
                    $set: { quantity: { inTrade: product.quantity, sold: 0, unSold: 0 } }
                });
            }
            await product_model.findByIdAndUpdate(item.productId, {
                $inc: { 'quantity.inTrade': item.quantity }
            });
        }
        return res.status(201).json(createdResult)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const update_consignment = async (req, res) => {
    const { products, importDate, money } = req.body;

    const data = {}
    if (products) data.products = products
    if (importDate) data.importDate = new Date(importDate)
    if (money) data.importDate = money

    const consignmentId = req.params.id
    try {
        const findConsignment = await consignment_model.findById(consignmentId)
        if (!findConsignment) {
            return res.status(404).json({ message: "Consignment not existed." });
        }
        if (products) {
            const newProductIds = products.map(item => item.productId);

            const existingProductIds = findConsignment.products.map(item => item.productId);

            const productsToDelete = existingProductIds.filter(productId => !newProductIds.includes(productId));


            await Promise.all(products.map(async item => {
                const product = await product_model.findById(item.productId);
                if (product && typeof product.quantity === 'number') {
                    await product_model.findByIdAndUpdate(item.productId, {
                        $set: { quantity: { inTrade: product.quantity, sold: 0, unSold: 0 } }
                    });
                }
                await product_model.findByIdAndUpdate(item.productId, { $inc: { 'quantity.inTrade': item.quantity } });
            }));

            await Promise.all(productsToDelete.map(async productId => {
                const productToDelete = findConsignment.products.find(item => item.productId.toString() === productId.toString());
                const product = await product_model.findById(productId);
                if (product && typeof product.quantity === 'number') {
                    await product_model.findByIdAndUpdate(productId, {
                        $set: { quantity: { inTrade: product.quantity, sold: 0, unSold: 0 } }
                    });
                }
                await product_model.findByIdAndUpdate(productId, { $inc: { 'quantity.inTrade': -productToDelete.quantity } });
            }));

            const updatedConsignment = await consignment_model.findByIdAndUpdate(consignmentId, data, { new: true });

            return res.status(200).json(updatedConsignment);
        }
        const updateConsignmentImportDate = await consignment_model.findByIdAndUpdate(consignmentId, data, { new: true })
        if (!updateConsignmentImportDate) return res.status(404).json({ message: "Update consignment unsuccessfully." });
        return res.status(200).json(updateConsignmentImportDate)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}




export const paginate_consignment = async (req, res) => {
    const { page, applyDate, dueDate, sortDate, sortMoney } = req.query;
    const limit = 6;
    const skip = (page - 1) * limit;
    const sortKind = {};
    if (sortDate) {
        sortKind.createdAt = sortDate === 'ascend' ? 1 : -1;
    }
    if (sortMoney) {
        sortKind.money = sortMoney === 'ascend' ? 1 : -1;
    }
    let finalQuery = {};
    if (applyDate || dueDate) {
        finalQuery.importDate = {};

        if (applyDate) {
            finalQuery.importDate.$gte = new Date(applyDate);
        }
        if (dueDate) {
            finalQuery.importDate.$lte = new Date(dueDate);
        }
    }
    try {
        const consignments = await consignment_model.paginate(finalQuery, {
            offset: skip, page: page, limit: limit, sort: sortKind,
            populate: [{
                path: "products.productId",
                model: "Product"
            },
            {
                path: "userId",
                model: "User",
                select: "firstName lastName role"
            }]
        })

        return res.status(200).json(consignments);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



export const all_consignment = async (req, res) => {
    try {
        const data = await consignment_model.find({})
            .populate({
                path: "products.productId",
                model: "Product"
            })
            .populate({
                path: "userId",
                model: "User",
                select: "firstName lastName role"
            })


        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const detail_consignment = async (req, res) => {
    const consignmentId = req.params.id
    try {
        const consignment = await consignment_model.findOne({ _id: consignmentId })
            .populate({ path: "products.productId", model: "Product" })
            .populate({
                path: "userId", model: "User", select: "firstName lastName role"
            })
        if (!consignment) return res.status(404).json({ message: "Consignment not existed!" });
        return res.status(200).json(consignment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}