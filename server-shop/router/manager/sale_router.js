import { Router } from "express";

import { add_sale, all_sale, delete_sale, detail_sale, lastest_sale, paginate_sale, updateSale } from "../../controllers/sale_controller.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { Role } from "../../helper/enum.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { create_validator, edit_validator } from "../../validator/sale_validator.js";


const router = Router();

router.post('/sale', auditLogger("ADD_SALE", "Sale"), create_validator, add_sale)
router.put('/sale/:id', auditLogger("EDIT_SALE", "Sale"), edit_validator, updateSale)
router.get('/sale', paginate_sale)
router.get('/sale/:id', detail_sale)
router.delete('/sale/:id', auditLogger("DELETE_SALE", "Sale"), delete_sale)

export default router;
