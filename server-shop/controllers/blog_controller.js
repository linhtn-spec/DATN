// import { upload_image } from "./upload_controller.js";
import blog_model from "../models/blog_model.js"
import { options } from "../paginate/options.js";

export const add_blog = async (req, res) => {

    const { title, content, order, isActive } = req.body;
    const { _id, lastName, firstName } = req.user
    try {
        const checkExistTitle = await blog_model.findOne({ title: title });
        if (checkExistTitle != null) {
            return res.status(400).json({ messsage: "Blog title is existed" });
        }

        const checkExistOrder = await blog_model.findOne({ order: order });
        if (checkExistOrder) {
            return res.status(400).json({ message: "Blog order already taken" });
        }

        const blog = await blog_model.create({
            title, user: {
                userId: _id,
                lastName, firstName
            }, content, order, isActive
        });
        if (blog) {
            return res.status(201).json({ blog, message: "Add a blog successfully" });
        }

        return res.status(400).json({ message: "Add a blog unsuccessfully " })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const update_blog = async (req, res) => {

    const blog_id = req.params.id;
    const { title, content, order, isActive } = req.body;
    const data = {};
    if (title) data.title = title;
    if (content) data.content = content;
    if (isActive !== '') data.isActive = isActive;
    if (order) data.order = order
    try {
        const blog = await blog_model.findOne({ _id: blog_id });
        if (!blog) {
            return res.status(404).json({ message: "Blog not exist" });
        }
        if (order && order !== blog.order) {
            const checkExistOrder = await blog_model.findOne({ order: order });
            if (checkExistOrder) {
                return res.status(400).json({ message: "Blog order already taken" });
            }
        }

        const updated_blog = await blog_model.findOneAndUpdate(
            { _id: blog_id },
            data,
            { new: true }
        );
        if (updated_blog)
            return res.status(200).json({ ...updated_blog._doc });
        return res.status(400).json({ message: "Update blog unsuccessfully " })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const detail_blog = async (req, res) => {
    try {
        const blog_id = req.params.id;
        const data = await blog_model.findOne({ _id: blog_id })
        if (data === null) {
            return res.status(404).json({ message: "blog no exists" });
        }
        return res.status(200).json({
            ...data._doc
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_blog_one = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await blog_model.findOneAndDelete({ _id: id });
        if (data !== null) {
            return res.status(200).json({ message: "Blog deleted successfully" });
        } else {
            return res.status(404).json({ message: "Bog not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const delete_blog_list = async (req, res) => {
    try {
        const blog_id = req.body.id;
        if (!blog_id || blog_id.length === 0) {
            return res.status(400).json({ message: "Please provide list of blog_id" });
        }
        const existingblogs = await blog_model.find({ _id: { $in: blog_id } });
        if (existingblogs.length !== blog_id.length) {
            return res.status(404).json({ message: "One or more blogs not found" });
        }
        const data = await blog_model.deleteMany({ _id: { $in: blog_id } });
        if (data) {
            return res.status(200).json({ message: "Blogs deleted successfully" });
        } else {
            return res.status(404).json({ message: "Blogs not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const paginate_blog = async (req, res) => {
    const { title, isActive, sortOrder, sortTitle, page } = req.query
    const limit = 6;
    const skip = (page - 1) * limit;
    const query = {};
    if (title) query.title = title;
    if (isActive) query.isActive = isActive;
    let sortKind = {};
    if (sortOrder) {
        if (sortOrder === 'ascend') {
            sortKind.order = 1;
        } else {
            sortKind.order = -1;
        }
    }

    if (sortTitle) {
        if (sortTitle === 'ascend') {
            sortKind.title = 1;
        } else {
            sortKind.title = -1;
        }
    }

    if (Object.keys(sortKind).length === 0) {
        sortKind.createdAt = -1;
    }

    try {
        const dataAll = await blog_model.paginate(query, {
            offset: skip, page: page, limit: limit, sort: sortKind
        });
        if (!dataAll || dataAll.totalDocs === 0) {
            return res.status(200).json({ docs: [], totalDocs: 0, limit, totalPages: 0, page });
        }
        return res.status(200).json({ ...dataAll });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const all_blog = async (req, res) => {
    try {
        const data = await blog_model.paginate({}, options);
        if (!data || data.totalDocs === 0) {
            return res.status(200).json({ docs: [], totalDocs: 0 });
        }
        return res.status(200).json({ ...data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}