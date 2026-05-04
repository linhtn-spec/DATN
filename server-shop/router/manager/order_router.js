import { Router } from "express";
import { edit_order } from "../../controllers/order_controller.js";
import { edit_order_validator } from "../../validator/order_validator.js";
import { auditLogger } from "../../middleware/audit_middleware.js";

const router = Router();

router.put("/order/:id", auditLogger("EDIT_ORDER", "Order"), edit_order_validator, edit_order);

export default router;
