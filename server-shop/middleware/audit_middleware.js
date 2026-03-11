import audit_log_model from "../models/audit_log_model.js";

export const auditLogger = (action, resource) => {
    return async (req, res, next) => {
        // We only want to log successful or attempted administrative changes
        // Capture the original send to log after response is sent
        const originalSend = res.send;

        res.send = function (body) {
            res.send = originalSend;
            const response = res.send(body);

            // Log only if status is successful (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logEntry = {
                    userId: req.user?._id,
                    username: req.user?.username,
                    action: action || req.method,
                    resource: resource || req.baseUrl,
                    resourceId: req.params.id || req.body.id,
                    details: {
                        query: req.query,
                        body: req.method === 'DELETE' ? {} : req.body, // Avoid logging large bodies or sensitive data if needed
                        params: req.params
                    },
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                };

                audit_log_model.create(logEntry).catch(err => {
                    console.error("Failed to create audit log:", err);
                });
            }
            return response;
        };

        next();
    };
};
