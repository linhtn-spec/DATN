import { Router } from "express";

import { Role } from "../../helper/enum.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { add_banner, all_banner, delete_banner_list, delete_banner_one, detail_banner, paginate_banner, update_banner } from "../../controllers/banner_controller.js";
import { create_validator, edit_validator } from "../../validator/banner_validator.js";

const router = Router();

router.get("/banner/options", all_banner);
router.get("/banner", paginate_banner);
router.get("/banner/:id", detail_banner);

export default router;
