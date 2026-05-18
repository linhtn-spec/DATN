import Notification from "../models/notification_model.js";
import { asyncHandler } from "../helper/async_handler.js";

// @desc    Get user notifications (or all admin notifications if userId is not provided)
// @route   GET /api/notifications
// @access  Private
export const get_notifications = asyncHandler(async (req, res) => {
    // If Admin requests without userId query, they might get global notifications or their own.
    // Let's assume customer requests with their userId in req.query or from JWT.
    // Usually JWT user is in req.user, but in this project auth logic might just pass `userId` via query.
    const userId = req.query.userId || null;
    
    // Fetch notifications:
    // 1. Where userId matches the requester
    // 2. OR where userId is null (which means it's a global/admin notification) - optionally protect this so only admin sees it
    
    const query = userId ? { userId } : { userId: null };

    // Fetch the 50 most recent notifications
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

    // Also count unread
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return res.status(200).json({
        notifications,
        unreadCount
    });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const mark_as_read = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(notification);
});

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const mark_all_as_read = asyncHandler(async (req, res) => {
    const userId = req.query.userId || null;
    const query = userId ? { userId } : { userId: null };

    await Notification.updateMany(
        { ...query, isRead: false },
        { $set: { isRead: true } }
    );

    return res.status(200).json({ message: "All notifications marked as read" });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const delete_notification = asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted" });
});
