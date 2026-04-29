import { Router } from "express";
import {
    add_order,
    edit_order,
    detail_order,
    all_order,
    paginate_order,
    order_by_user,
    paginate_order_user,

} from "../../controllers/order_controller.js";
import { add_order_validator, edit_order_validator } from "../../validator/order_validator.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { Role } from "../../helper/enum.js";


const router = Router();

router.post("/order", auditLogger("CREATE_ORDER", "Order"), add_order_validator, add_order);
router.put("/order/:id", auditLogger("EDIT_ORDER", "Order"), edit_order_validator, edit_order);
router.get("/order/:id", detail_order);
router.get("/order/user/:userId", order_by_user)
router.get("/order/user/paginate/:user_id", paginate_order_user)

export default router;
