import { Router } from "express";

import { Role } from "../helper/enum.js";
import { authRole, checkAuth } from "../middleware/check_auth.js";
import { auditLogger } from "../middleware/audit_middleware.js";
import { add_banner, all_banner, delete_banner_list, delete_banner_one, detail_banner, paginate_banner, update_banner } from "../controllers/banner_controller.js";
import { create_validator, edit_validator } from "../validator/banner_validator.js";
const router = Router();


router.post("/banner", checkAuth, authRole(Role.MANAGER), auditLogger("ADD_BANNER", "Banner"), create_validator, add_banner);

router.put("/banner/:id", checkAuth, authRole(Role.MANAGER), auditLogger("EDIT_BANNER", "Banner"), edit_validator, update_banner);

router.get("/banner/options", all_banner);
router.get("/banner", paginate_banner);
router.get("/banner/:id", detail_banner);

router.delete("/banner/:id", checkAuth, authRole(Role.MANAGER), auditLogger("DELETE_BANNER", "Banner"), delete_banner_one);
router.delete("/banner", checkAuth, authRole(Role.MANAGER), auditLogger("DELETE_BANNERS", "Banner"), delete_banner_list);

export default router;