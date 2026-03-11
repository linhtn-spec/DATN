import { Router } from "express";

import { authRole, checkAuth } from "../middleware/check_auth.js";
import { Role } from "../helper/enum.js";
import { add_product_validator, edit_product_validator } from "../validator/product_validator.js";
import { add_rating, all_rating, detail_rating, paginate_rating, rating_product, update_rating } from "../controllers/rating_controller.js";
import { create_validator, edit_validator } from "../validator/rating_validator.js";

const router = Router();

router.post('/rating', checkAuth, authRole(Role.CUSTOMER), create_validator, add_rating)

router.put('/rating/:id', checkAuth, authRole(Role.MANAGER), edit_validator, update_rating)

router.get('/rating', checkAuth, authRole(Role.MANAGER), paginate_rating)
router.get('/rating/:id', checkAuth, authRole(Role.MANAGER), detail_rating)
router.get('/rating/options/all', all_rating)
router.get('/rating/product/:product_id', rating_product)

export default router;