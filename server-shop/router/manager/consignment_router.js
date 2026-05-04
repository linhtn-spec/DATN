import { Router } from "express";

import { add_consignment, all_consignment, delete_consignment, detail_consignment, paginate_consignment, update_consignment } from "../../controllers/consignment_controller.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { Role } from "../../helper/enum.js";
import { create_validator, edit_validator } from "../../validator/consignment_validator.js";


const router = Router();

router.post('/consignment', auditLogger("ADD_CONSIGNMENT", "Consignment"), create_validator, add_consignment)
router.put('/consignment/:id', auditLogger("EDIT_CONSIGNMENT", "Consignment"), edit_validator, update_consignment)
router.delete('/consignment/:id', auditLogger("DELETE_CONSIGNMENT", "Consignment"), delete_consignment)
router.get('/consignment', paginate_consignment)
router.get('/consignment/:id', detail_consignment)
router.get('/consignment/options/all', all_consignment)

export default router;
