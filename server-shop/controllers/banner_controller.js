// import { upload_image } from "./upload_controller.js";
import banner_model from "../models/banner_model.js"
import { options } from "../paginate/options.js";

export const add_banner = async (req, res) => {

    const { title, image, description, order, isActive } = req.body;

    try {
        const checkExistTitle = await banner_model.findOne({ title: title });
        if (checkExistTitle != null) {
            return res.status(400).json({ messsage: "Banner title is existed" });
        }

        const checkExistOrder = await banner_model.findOne({ order: order });
        if (checkExistOrder) {
            return res.status(400).json({ message: "Thứ tự biểu ngữ đã tồn tại" });
        }

        const banner = await banner_model.create({ title, image, description, order, isActive });
        if (banner) {
            return res.status(201).json({ banner, message: "Thêm biểu ngữ thành công" });
        }

        return res.status(400).json({ message: "Thêm biểu ngữ thất bại" })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const update_banner = async (req, res) => {

    const banner_id = req.params.id;
    const { title, image, description, isActive, order } = req.body;
    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (isActive !== '') data.isActive = isActive;
    if (image) data.image = image
    if (order) data.order = order
    try {
        const banner = await banner_model.findOne({ _id: banner_id });
        if (!banner) {
            return res.status(404).json({ message: "Biểu ngữ không tồn tại" });
        }
        if (order && order !== banner.order) {
            const checkExistOrder = await banner_model.findOne({ order: order });
            if (checkExistOrder) {
                return res.status(400).json({ message: "Thứ tự biểu ngữ đã tồn tại" });
            }
        }

        const updated_banner = await banner_model.findOneAndUpdate(
            { _id: banner_id },
            data,
            { new: true }
        );
        if (updated_banner)
            return res.status(200).json({ ...updated_banner._doc });
        return res.status(400).json({ message: "Cập nhật thất bại" })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const detail_banner = async (req, res) => {
    try {
        const banner_id = req.params.id;
        const data = await banner_model.findOne({ _id: banner_id })
        if (data === null) {
            return res.status(404).json({ message: "Biểu ngữ không tồn tại" });
        }
        return res.status(200).json({
            ...data._doc
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_banner_one = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await banner_model.findOneAndDelete({ _id: id });
        if (data !== null) {
            return res.status(200).json({ message: "Đã xóa biểu ngữ thành công" });
        } else {
            return res.status(404).json({ message: "Không tìm thấy biểu ngữ" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const delete_banner_list = async (req, res) => {
    try {
        const banner_id = req.body.id;
        if (!banner_id || banner_id.length === 0) {
            return res.status(400).json({ message: "Vui lòng cung cấp danh sách banner_id" });
        }
        const existingBanners = await banner_model.find({ _id: { $in: banner_id } });
        if (existingBanners.length !== banner_id.length) {
            return res.status(404).json({ message: "Một hoặc nhiều biểu ngữ không tồn tại" });
        }
        const data = await banner_model.deleteMany({ _id: { $in: banner_id } });
        if (data) {
            return res.status(200).json({ message: "Xóa các biểu ngữ thành công" });
        } else {
            return res.status(404).json({ message: "Không tìm thấy các biểu ngữ" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const paginate_banner = async (req, res) => {
    const { title, description, isActive, sortOrder, sortName, page } = req.query
    const limit = 6;
    const skip = (page - 1) * limit;
    const query = {};
    if (title) query.title = { $regex: new RegExp(title, "iuy") };
    if (description) query.description = { $regex: new RegExp(description, "iuy") };
    if (isActive) query.isActive = isActive;
    let sortKind = {};
    if (sortOrder) {
        if (sortOrder === 'ascend') {
            sortKind.order = 1;
        } else {
            sortKind.order = -1;
        }
    }

    if (sortName) {
        if (sortName === 'ascend') {
            sortKind.title = 1;
        } else {
            sortKind.title = -1;
        }
    }

    if (Object.keys(sortKind).length === 0) {
        sortKind.createdAt = -1;
    }

    try {
        const dataAll = await banner_model.paginate(query, {
            offset: skip, page: page, limit: limit, sort: sortKind
        });
        if (dataAll.totalDocs === 0) {
            return res.status(404).json({ message: "Không có biểu ngữ" });
        }
        return res.status(200).json({ ...dataAll });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const all_banner = async (req, res) => {
    try {
        const data = await banner_model.find({ isActive: true }).sort({ order: 1 })
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}