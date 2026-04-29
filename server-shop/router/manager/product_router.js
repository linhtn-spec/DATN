import { Router } from "express";
import {
    // edit_product,
    delete_product_one,
    delete_product_list,
    delete_product_all,
    detail_product,
    // add_product,
    new_product,
    category_product,
    all_product,
    product_by_category,
    paginate_product,
    add_product,
    edit_product,
    recommend_product,
    product_may_like
} from "../../controllers/product_controller.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { Role } from "../../helper/enum.js";
import { add_product_validator, edit_product_validator } from "../../validator/product_validator.js";


const router = Router();

router.put("/product/:id", auditLogger("EDIT_PRODUCT", "Product"), edit_product_validator, edit_product);
router.post("/product", auditLogger("ADD_PRODUCT", "Product"), add_product_validator, add_product);
router.delete("/product/:id", auditLogger("DELETE_PRODUCT", "Product"), delete_product_one);
router.delete("/product", auditLogger("DELETE_PRODUCTS", "Product"), delete_product_list);
router.delete("/product", auditLogger("DELETE_ALL_PRODUCTS", "Product"), delete_product_all);

export default router;
