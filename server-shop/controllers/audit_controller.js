import audit_log_model from "../models/audit_log_model.js";
import { asyncHandler } from "../helper/async_handler.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await audit_log_model.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email');

    const total = await audit_log_model.countDocuments();

    res.status(200).json({
        logs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    });
});
