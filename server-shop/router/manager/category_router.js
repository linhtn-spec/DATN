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

// NOTE: GET /category and GET /category/:id are served by the public router
router.post("/category", auditLogger("ADD_CATEGORY", "Category"), create_validator, add_category);
router.put("/category/:id", auditLogger("EDIT_CATEGORY", "Category"), edit_validator, update_category);
router.delete("/category/:id", auditLogger("DELETE_CATEGORY", "Category"), delete_category_one);
router.delete("/category", auditLogger("DELETE_CATEGORIES", "Category"), delete_category_list);

export default router;
