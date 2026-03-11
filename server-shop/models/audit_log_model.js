import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: String,
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String,
        required: true
    },
    resourceId: String,
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ip: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const audit_log_model = mongoose.model("AuditLog", auditLogSchema);
export default audit_log_model;
