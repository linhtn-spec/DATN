import { cloudinary, options } from "../cloudinary/cloudinary.js"
import DatauriParser from "datauri/parser.js";

const parser = new DatauriParser();


export const upload_image = async (req, res) => {
    const images = req.files
    if (!images || images.length === 0) {
        return res.status(400).json({ message: "Không có tệp nào được tải lên" });
    }

    try {
        const imagesToUpload = images.map((image) =>
            cloudinary.uploader.upload(parser.format(image.originalname.toString(), image.buffer).content, options)
        );
        const result = await Promise.all(imagesToUpload);
        
        const imageUrls = result.map((item) => ({
            url: item.url
        }))
        
        return res.status(200).json({ images: imageUrls })
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ message: "Lỗi tải ảnh lên Cloudinary", error: error.message });
    }
};

