import { Router } from "express";

import { add_comment, all_comment, comment_of_product, comment_product_paginate, detail_comment, paginate_comment, update_comment } from "../../controllers/comment_controller.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { Role } from "../../helper/enum.js";
import { create_validator, edit_validator } from "../../validator/comment_validator.js";


const router = Router();

router.get('/comment/options/all', all_comment)
router.get('/comment/product/all', comment_of_product)
router.get('/comment/product/paginate/:product_id', comment_product_paginate)

export default router;
