import { Router } from "express";
import { getAuditLogs } from "../controllers/audit_controller.js";
import { authRole, checkAuth } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";

const router = Router();

router.get("/audit-logs", checkAuth, authRole(Role.ADMIN), getAuditLogs);

export default router;
