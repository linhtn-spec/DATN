import { Router } from "express";

import { Role } from "../../helper/enum.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { add_blog, all_blog, delete_blog_list, delete_blog_one, detail_blog, paginate_blog, update_blog } from "../../controllers/blog_controller.js";

const router = Router();

router.get("/blog/options", all_blog);
router.get("/blog", paginate_blog);
router.get("/blog/:id", detail_blog);

export default router;
