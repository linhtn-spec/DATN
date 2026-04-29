import { Router } from "express";

import { Role } from "../../helper/enum.js";
import { authRole, checkAuth } from "../../middleware/check_auth.js";
import { auditLogger } from "../../middleware/audit_middleware.js";
import { add_blog, all_blog, delete_blog_list, delete_blog_one, detail_blog, paginate_blog, update_blog } from "../../controllers/blog_controller.js";

const router = Router();

router.post("/blog", auditLogger("ADD_BLOG", "Blog"), add_blog);
router.put("/blog/:id", auditLogger("EDIT_BLOG", "Blog"), update_blog);
router.delete("/blog/:id", auditLogger("DELETE_BLOG", "Blog"), delete_blog_one);
router.delete("/blog", auditLogger("DELETE_BLOGS", "Blog"), delete_blog_list);

export default router;
