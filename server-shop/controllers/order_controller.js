import { order_form, order_subject, order_text } from "../form_mail/order_form.js";
import order_model from "../models/order_model.js"
import { sendEmail } from "../nodemailer/nodemailer_config.js";
import product_model from "../models/product_model.js";
import { asyncHandler } from "../helper/async_handler.js";
import mongoose from "mongoose";
import { Role } from "../helper/enum.js";

const from = process.env.NODEMAILER_EMAIL

export const add_order = asyncHandler(async (req, res) => {
    const data = req.body;
    const { tax, products, shippingMethod } = data
    const update = {}
    if (shippingMethod === 'free') update.shippingCost = 0
    if (shippingMethod === 'express') update.shippingCost = 100
    if (shippingMethod === 'standard') update.shippingCost = 10

    const subPriceSumForEachProduct = products.map(product => product.subPrice);
    const totalSubPrice = subPriceSumForEachProduct.reduce((acc, curr) => acc + curr, 0) + update.shippingCost;
    const total = totalSubPrice + parseFloat(tax);

    const session = await mongoose.startSession();
    let order;

    try {
        await session.withTransaction(async () => {
            // 1. Create Order
            const [newOrder] = await order_model.create([{ ...data, total: total, ...update }], { session });
            order = newOrder;

            // 2. Update Product Quantities
            for (const product of products) {
                // Check stock availability before updating
                const currentProduct = await product_model.findById(product.productId).session(session);
                if (!currentProduct) {
                    throw new Error(`Product not found: ${product.productId}`);
                }
                if (currentProduct.quantity.inTrade < product.quantity) {
                    throw new Error(`Insufficient stock for product: ${currentProduct.name}. Available: ${currentProduct.quantity.inTrade}`);
                }

                await product_model.findByIdAndUpdate(
                    product.productId,
                    {
                        $inc: {
                            'quantity.inTrade': -product.quantity,
                            'quantity.sold': product.quantity
                        }
                    },
                    { session, new: true }
                );
            }
        });

        // After transaction succeeds, perform post-processing (Populate, Email)
        const orderCreated = await order_model.findOne({ _id: order._id }).populate({
            path: "products.productId",
            model: "Product",
            select: 'name price images'
        });

        const modifiedData = {
            ...orderCreated._doc,
            products: orderCreated.products.map(product => ({
                ...product._doc,
                productId: {
                    ...product.productId._doc,
                    images: product.productId._doc.images[0]
                }
            }))
        };

        await sendEmail(from, modifiedData.emailReceiver, order_subject, order_text, order_form(modifiedData));
        
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_order', { 
                id: order._id, 
                customer: `${order.firstNameReceiver} ${order.lastNameReceiver}`,
                total: order.total
            });
        }

        return res.status(201).json({ order });

    } finally {
        session.endSession();
    }
});

export const edit_order = asyncHandler(async (req, res) => {
    const order_id = req.params.id;
    const { paymentStatus, shippingStatus, orderStatus, shippingCost, tax } = req.body;
    const data = {};

    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (shippingStatus) data.shippingStatus = shippingStatus;
    if (orderStatus) data.orderStatus = orderStatus;
    if (shippingCost) data.shippingCost = shippingCost
    if (tax) data.tax = tax

    const order = await order_model.findOne({ _id: order_id });
    if (!order) {
        return res.status(404).json({ message: "Order does not exist" });
    }
    if (order.orderStatus === 'canceled' || order.orderStatus === 'done')
        return res.status(400).json({ message: "You cant edit this order" });

    if (orderStatus === "canceled") {
        const products = order.products;
        for (const product of products) {
            await product_model.findByIdAndUpdate(product.productId, {
                $inc: { 
                    'quantity.inTrade': product.quantity,
                    'quantity.sold': -product.quantity
                }
            });
        }
    }
    const updated_order = await order_model.findOneAndUpdate(
        { _id: order._id },
        data,
        { new: true }
    );
    if (updated_order)
        return res.status(200).json({ ...updated_order._doc });
    return res.status(400).json({ message: "Update unsuccessfully " })
});

export const detail_order = asyncHandler(async (req, res) => {
    const order_id = req.params.id;
    const data = await order_model.findOne({ _id: order_id }).populate({
        path: "products.productId",
        model: "Product",
        select: 'name price images'
    })
    if (!data) {
        return res.status(404).json({ message: "Order no exists" });
    }
    else {
        const modifiedData = {
            ...data._doc,
            products: data.products.map(product => ({
                ...product._doc,
                productId: {
                    ...product.productId._doc,
                    images: product.productId._doc.images[0]
                }
            }))
        };
        return res.status(200).json(modifiedData);

    }
});


export const paginate_order = asyncHandler(async (req, res) => {
    const { name, orderStatus, paymentStatus, shippingStatus, sortCreated, page } = req.query
    const limit = 6;
    const skip = page ? (page - 1) * limit : 0;
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (shippingStatus) query.shippingStatus = shippingStatus;
    if (orderStatus) query.orderStatus = orderStatus;
    const fullNameRegex = new RegExp(name, "i");
    const fullNameQuery = { fullName: fullNameRegex };
    let conditions = [];
    if (name) {
        conditions.push(fullNameQuery);
    }
    if (Object.keys(query).length !== 0) {
        conditions.push(query);
    }
    let finalQuery = {};
    if (conditions.length > 0) {
        finalQuery.$and = conditions;
    }
    let sortKind = {};
    if (sortCreated) {
        if (sortCreated === 'ascend') {
            sortKind.createdAt = 1;
        } else {
            sortKind.createdAt = -1;
        }
    }

    const aggregationStages = [
        {
            $addFields: {
                fullName: { $concat: ["$firstNameReceiver", " ", "$lastNameReceiver"] }
            }
        },
        {
            $match: finalQuery
        },
        ...(Object.keys(sortKind).length !== 0 ? [{ $sort: sortKind }] : []),  // Add sort stage conditionally

        {
            $facet: {
                paginatedResults: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ];

    const [{ paginatedResults, totalCount }] = await order_model.aggregate(aggregationStages);

    if (totalCount[0]?.count === 0 || paginatedResults?.length === 0) {
        return res.status(404).json({ message: "No order " });
    }

    return res.status(200).json({ paginatedResults, total: totalCount[0].count, page, per_page: limit, skip, page: page ? page : 1 });
});


export const all_order = asyncHandler(async (req, res) => {
    const data = await order_model.find({}).populate({
        path: "products.productId",
        model: "Product",
        select: 'name price images'
    });
    if (data.length === 0) {
        return res.status(404).json({ message: "No order" });
    }
    else {
        return res.status(200).json(data);
    }
});

export const order_by_user = asyncHandler(async (req, res) => {
    const userId = req.params.userId
    const { page, sortCreated } = req.query
    const limit = 6;
    const skip = page ? (page - 1) * limit : 0;
    const query = {};
    if (userId) query.userId = userId
    let sortKind = {};
    if (sortCreated) {
        if (sortCreated === 'ascend') {
            sortKind.createdAt = 1;
        } else {
            sortKind.createdAt = -1;
        }
    }
    const dataAll = await order_model.paginate(query, {
        offset: skip, page: page, limit: limit, sort: sortKind,
        populate: {
            path: "products.productId",
            model: "Product",
            select: 'name price images'
        }
    });
    if (dataAll.totalDocs === 0) {
        return res.status(404).json({ message: "No order" });
    }
    return res.status(200).json({ ...dataAll });
});


export const paginate_order_user = asyncHandler(async (req, res) => {
    const { orderStatus, paymentStatus, shippingStatus, sortCreated, page } = req.query
    const limit = 6;
    const skip = page ? (page - 1) * limit : 0;
    const user_id = req.params.user_id
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (shippingStatus) query.shippingStatus = shippingStatus;
    query.userId = user_id
    if (orderStatus) query.orderStatus = orderStatus;
    let sortKind = {};
    if (sortCreated) {
        if (sortCreated === 'ascend') {
            sortKind.createdAt = 1;
        } else {
            sortKind.createdAt = -1;
        }
    }

    const dataAll = await order_model.paginate(query, {
        offset: skip, page: page, limit: limit, sort: sortKind,
        populate: {
            path: "products.productId",
            model: "Product",
            select: 'name price images'
        }
    });
    if (dataAll.totalDocs === 0) {
        return res.status(404).json({ message: "No order " });
    }

    return res.status(200).json(dataAll);
});
