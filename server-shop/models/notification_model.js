import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, // User who receives the notification. If null, it's a global admin notification.
            ref: 'User',
            default: null
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String, // e.g., 'ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'SYSTEM'
            default: 'SYSTEM'
        },
        link: {
            type: String, // Optional URL to redirect the user when clicked
            default: ''
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
