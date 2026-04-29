import { Router } from "express";
import {
    add_category,
    all_category,
    delete_category_list,
    delete_category_one,
    detail_category,
    paginate_category,
    product_by_category,
    update_category
} from "../../controllers/category_controller.js";
import { Role } from "../../helper/enum.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { create_validator, edit_validator } from "../../validator/category_validator.js";

const router = Router();

router.get("/category/options", all_category);
router.get("/category/detail/:id", product_by_category);

export default router;
