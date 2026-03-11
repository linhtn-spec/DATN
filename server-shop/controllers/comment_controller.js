import comment_model from "../models/comment_model.js"
import product_model from '../models/product_model.js'
import user_model from "../models/user_model.js";

export const add_comment = async (req, res) => {
    const { content, productId } = req.body;
    const userId = req.user._id
    try {
        const checkExistProduct = await product_model.findById(productId);
        if (!checkExistProduct) {
            return res.status(404).json({ message: "Product not existed!" });
        }

        const checkExistedComment = await comment_model.findOne({ userId: userId, productId: productId })
        if (checkExistedComment) return res.status(409).json({ message: "You have feedback this product" });

        const newComment = await comment_model.create({ content, productId, userId })
        if (!newComment) {
            return res.status(404).json({ message: "Feedback a product unsuccessfully" });
        }
        return res.status(201).json({ message: "Feedback a product successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const update_comment = async (req, res) => {
    const { isActive } = req.body;
    const commentId = req.params.id
    try {
        const comment = await comment_model.findById(commentId)
        if (!comment) {
            return res.status(404).json({ message: "Feedback does not exist" });
        }

        const updatedComment = await comment_model.findOneAndUpdate(
            { _id: commentId },
            { isActive: isActive },
            { new: true }
        );
        if (updatedComment)
            return res.status(200).json({ ...updatedComment._doc });
        return res.status(400).json({ message: "Update unsuccessfully " })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const detail_comment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const data = await comment_model.findOne({ _id: commentId }).populate("productId").populate({
            path: 'userId',
            model: 'User',
            select: 'firstName lastName _id'
        })
        if (!data) {
            return res.status(404).json({ message: "Feedback no exist" });
        }
        return res.status(200).json({
            ...data._doc
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const paginate_comment = async (req, res) => {
    const { page, sortDate, isActive } = req.query
    const limit = 6;
    const skip = (page - 1) * limit;
    const query = {};
    if (isActive) query.isActive = isActive
    let sortKind = {};
    if (sortDate) {
        if (sortDate === 'ascend') {
            sortKind.createdAt = 1;
        } else {
            sortKind.createdAt = -1;
        }
    }
    try {
        const dataAll = await comment_model.paginate(query, {
            offset: skip, page: page, limit: limit, sort: sortKind,
            populate: {
                path: "userId",
                model: "User",
                select: "firstName lastName"
            }
        });
        return res.status(200).json({ ...dataAll });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const all_comment = async (req, res) => {
    try {
        const data = await comment_model.find({});
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const comment_of_product = async (req, res) => {
    const productId = req.query.productId
    try {
        const data = await comment_model.find({ productId: productId }).populate({
            path: 'userId',
            model: 'User',
            select: 'firstName lastName _id image'
        });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const comment_product_paginate = async (req, res) => {
    const product_id = req.params.product_id
    console.log(product_id);
    const { page, sortDate, isActive, name } = req.query
    const limit = 6;
    const skip = (page - 1) * limit;
    const query = {}
    query.productId = product_id
    if (isActive) query.isActive = isActive
    let sortKind = {};
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

        const data = await comment_model.paginate({ ...query, ...ratingQuery }, {
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
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

