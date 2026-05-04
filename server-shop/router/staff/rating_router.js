import { Router } from "express";

import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { Role } from "../../helper/enum.js";
import { add_product_validator, edit_product_validator } from "../../validator/product_validator.js";
import { add_rating, all_rating, detail_rating, paginate_rating, rating_product, update_rating } from "../../controllers/rating_controller.js";
import { create_validator, edit_validator } from "../../validator/rating_validator.js";


const router = Router();

// NOTE: PUT /rating/:id is handled by manager_router (MANAGER ≥ 2 only)
router.get('/rating', paginate_rating)
router.get('/rating/:id', detail_rating)

export default router;
